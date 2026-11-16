const { sequelize, Sequelize } = require('../models');
const migrations = [
  require('../migrations/20261028000001-create-lms-schema'),
  require('../migrations/20261103000001-add-student-placements'),
  require('../migrations/20261105000001-add-joincodes-and-attendance'),
  require('../migrations/20261105000001-widen-avatar-url'),
  require('../migrations/20261110000001-create-question-sets'),
  require('../migrations/20261116000001-course-topic-quizzes-badges')
];
const seeder = require('../seeders/20261028000001-seed-initial-data');

async function resetDatabase() {
  const queryInterface = sequelize.getQueryInterface();
  const dialect = sequelize.getDialect();
  if (dialect === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = OFF');
  }
  for (const migration of [...migrations].reverse()) {
    await migration.down(queryInterface);
  }
  for (const migration of migrations) {
    await migration.up(queryInterface, Sequelize);
  }
  if (dialect === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = ON');
  }
  await seeder.up();
}

if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('Database reset and re-seeded successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database reset failed:', err);
      process.exit(1);
    });
}

module.exports = resetDatabase;
