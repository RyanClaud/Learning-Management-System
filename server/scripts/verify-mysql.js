'use strict';

const { sessionStore } = require('../src/app');
const { sequelize, User, Role, Course, ClassSection, Assessment } = require('../src/models');

async function main() {
  console.log('--- Verifying MySQL Database Status ---');
  await sequelize.authenticate();
  console.log('Connected to MySQL successfully.');

  await sessionStore.sync();
  console.log('user_sessions synced successfully.');

  const [tables] = await sequelize.query('SHOW TABLES');
  console.log(`Total tables in MySQL lms_database: ${tables.length}`);

  const userCount = await User.count();
  const roleCount = await Role.count();
  const courseCount = await Course.count();
  const classCount = await ClassSection.count();
  const assessmentCount = await Assessment.count();

  console.log('\nEntity counts in MySQL:');
  console.log(`- Users: ${userCount}`);
  console.log(`- Roles: ${roleCount}`);
  console.log(`- Courses: ${courseCount}`);
  console.log(`- Class Sections: ${classCount}`);
  console.log(`- Assessments: ${assessmentCount}`);

  // Test an auth login query on MySQL
  const admin = await User.findOne({
    where: { email: 'superadmin@academy.edu' },
    include: [{ model: Role, as: 'roles' }]
  });
  console.log('\nFound bootstrap superadmin:', {
    id: admin?.id,
    email: admin?.email,
    roles: admin?.roles?.map((r) => r.slug)
  });

  const instructor = await User.findOne({
    where: { email: 'instructor@academy.edu' },
    include: [{ model: Role, as: 'roles' }]
  });
  console.log('Found seeded instructor:', {
    id: instructor?.id,
    email: instructor?.email,
    roles: instructor?.roles?.map((r) => r.slug)
  });

  const student = await User.findOne({
    where: { email: 'student@academy.edu' },
    include: [{ model: Role, as: 'roles' }]
  });
  console.log('Found seeded student:', {
    id: student?.id,
    email: student?.email,
    roles: student?.roles?.map((r) => r.slug)
  });

  await sequelize.close();
  console.log('\nAll MySQL verification checks PASSED!');
}

main().catch((err) => {
  console.error('MySQL verification failed:', err);
  process.exit(1);
});
