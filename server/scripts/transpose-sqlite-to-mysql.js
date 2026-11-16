'use strict';

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { sequelize, Sequelize } = require('../src/models');
const runMigrations = require('../src/utils/runMigrations');

const SQLITE_PATH = path.resolve(__dirname, '../../data/lms_database.sqlite');

function querySqlite(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function transpose() {
  console.log('====================================================');
  console.log('TRANSPOSE DATABASE: SQLite3 -> MySQL (lms_database)');
  console.log('====================================================');

  console.log(`Connecting to SQLite at: ${SQLITE_PATH}`);
  const sqliteDb = new sqlite3.Database(SQLITE_PATH);

  try {
    await sequelize.authenticate();
    console.log(`Successfully connected to MySQL [${sequelize.config.database}] on ${sequelize.config.host}:${sequelize.config.port}`);

    // Step 1: Ensure all schema migrations are applied on MySQL
    console.log('\n--- Step 1: Ensuring MySQL Schema is up-to-date ---');
    await runMigrations();
    console.log('MySQL schema migrations completed successfully.');

    // Step 2: Fetch all user tables from SQLite
    console.log('\n--- Step 2: Discovering Tables from SQLite ---');
    const sqliteTables = await querySqlite(
      sqliteDb,
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%_backup'"
    );
    const tableNames = sqliteTables.map((t) => t.name);
    console.log(`Found ${tableNames.length} tables to transpose:`, tableNames.join(', '));

    // Disable foreign key checks for clean bulk transfer
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('\nDisabled MySQL FOREIGN_KEY_CHECKS.');

    const queryInterface = sequelize.getQueryInterface();
    const mysqlTables = await queryInterface.showAllTables();
    const results = [];

    // Step 3: Copy data table by table
    console.log('\n--- Step 3: Copying Records from SQLite to MySQL ---');
    for (const tableName of tableNames) {
      if (!mysqlTables.includes(tableName)) {
        console.warn(`[SKIP] Table "${tableName}" does not exist in MySQL.`);
        continue;
      }

      const rows = await querySqlite(sqliteDb, `SELECT * FROM "${tableName}"`);
      if (rows.length === 0) {
        results.push({ table: tableName, sqliteCount: 0, mysqlCount: 0, status: 'EMPTY' });
        console.log(`  Table "${tableName}": 0 rows (skipped)`);
        continue;
      }

      // Clear existing records in MySQL table
      await sequelize.query(`DELETE FROM \`${tableName}\``);

      // Get columns from MySQL table definition
      const tableDescription = await queryInterface.describeTable(tableName);

      // Sanitize rows for MySQL
      const sanitizedRows = rows.map((row) => {
        const sanitized = {};
        for (const [key, value] of Object.entries(row)) {
          if (!tableDescription[key]) {
            // Column does not exist in MySQL table definition
            continue;
          }

          const colType = (tableDescription[key].type || '').toUpperCase();

          if (value === null || value === undefined) {
            sanitized[key] = null;
          } else if (colType.includes('DATETIME') || colType.includes('TIMESTAMP')) {
            // Ensure valid Date object or ISO string for MySQL
            const d = new Date(value);
            sanitized[key] = isNaN(d.getTime()) ? null : d;
          } else if (colType.includes('JSON')) {
            if (typeof value === 'string') {
              try {
                // If it's valid JSON text, keep as parsed object or valid JSON string
                JSON.parse(value);
                sanitized[key] = value;
              } catch (_) {
                sanitized[key] = JSON.stringify(value);
              }
            } else {
              sanitized[key] = JSON.stringify(value);
            }
          } else if (colType.includes('TINYINT(1)') || colType.includes('BOOLEAN')) {
            sanitized[key] = Boolean(value);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      });

      // Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < sanitizedRows.length; i += batchSize) {
        const batch = sanitizedRows.slice(i, i + batchSize);
        await queryInterface.bulkInsert(tableName, batch);
      }

      // Verify row count in MySQL
      const [mysqlCountResult] = await sequelize.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const mysqlCount = mysqlCountResult[0]?.count || 0;

      const isMatch = Number(mysqlCount) === rows.length;
      results.push({
        table: tableName,
        sqliteCount: rows.length,
        mysqlCount: Number(mysqlCount),
        status: isMatch ? 'SUCCESS' : 'MISMATCH'
      });

      console.log(`  Table "${tableName}": SQLite=${rows.length} -> MySQL=${mysqlCount} [${isMatch ? 'OK' : 'MISMATCH'}]`);
    }

    // Step 4: Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\nRe-enabled MySQL FOREIGN_KEY_CHECKS.');

    // Step 5: Print summary report
    console.log('\n====================================================');
    console.log('TRANSPOSE SUMMARY REPORT');
    console.log('====================================================');
    let totalSqlite = 0;
    let totalMysql = 0;
    let anyMismatch = false;

    for (const r of results) {
      totalSqlite += r.sqliteCount;
      totalMysql += r.mysqlCount;
      if (r.status === 'MISMATCH') anyMismatch = true;
    }

    console.log(`Total Tables Processed: ${results.length}`);
    console.log(`Total Rows Transposed:  ${totalMysql} / ${totalSqlite}`);
    console.log(`Overall Status:         ${anyMismatch ? 'WARNING: Some counts mismatched' : 'ALL DATA TRANSPOSED SUCCESSFULLY 100%'}`);
    console.log('====================================================');

    if (anyMismatch) {
      console.warn('Mismatched tables:', results.filter((r) => r.status === 'MISMATCH'));
    }
  } catch (err) {
    console.error('\n[FATAL ERROR during transposition]:', err);
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (_) {}
    process.exit(1);
  } finally {
    sqliteDb.close();
    await sequelize.close();
  }
}

transpose()
  .then(() => {
    console.log('\nTransposition completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Transposition failed:', err);
    process.exit(1);
  });
