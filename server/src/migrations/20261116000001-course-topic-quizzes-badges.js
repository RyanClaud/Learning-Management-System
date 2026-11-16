'use strict';

const models = require('../models');

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const columns = await queryInterface.describeTable(tableName);
  if (!columns[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add duration to courses table
    await addColumnIfMissing(queryInterface, 'courses', 'duration', {
      type: Sequelize.STRING(80),
      allowNull: true
    });

    // 2. Add lesson_id to assessments table
    await addColumnIfMissing(queryInterface, 'assessments', 'lesson_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    try {
      await queryInterface.addIndex('assessments', ['lesson_id'], {
        name: 'assessments_lesson_id_idx'
      });
    } catch (_) {
      // index might already exist
    }

    // 3. Sync Badges table
    if (models.Badge) {
      await models.Badge.sync({ alter: false });
    }

    // 4. Sync StudentBadges table
    if (models.StudentBadge) {
      await models.StudentBadge.sync({ alter: false });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('student_badges')) {
      await queryInterface.dropTable('student_badges');
    }
    if (tables.includes('badges')) {
      await queryInterface.dropTable('badges');
    }
  }
};
