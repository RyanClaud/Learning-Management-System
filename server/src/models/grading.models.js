const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GradeCategory = sequelize.define('GradeCategory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    classId: { type: DataTypes.INTEGER, allowNull: false, field: 'class_id' },
    name: { type: DataTypes.STRING(100), allowNull: false },
    categoryType: {
      type: DataTypes.ENUM('quiz', 'assignment', 'laboratory', 'major_exam', 'project', 'other'),
      defaultValue: 'assignment',
      field: 'category_type'
    },
    weightPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'weight_percent' },
    dropLowestCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'drop_lowest_count' },
    orderIndex: { type: DataTypes.INTEGER, defaultValue: 1, field: 'order_index' }
  }, {
    tableName: 'grade_categories',
    indexes: [{ fields: ['class_id'] }]
  });

  const Grade = sequelize.define('Grade', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    classId: { type: DataTypes.INTEGER, allowNull: false, field: 'class_id' },
    gradeCategoryId: { type: DataTypes.INTEGER, allowNull: false, field: 'grade_category_id' },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    sourceType: {
      type: DataTypes.ENUM('assignment', 'assessment', 'manual'),
      allowNull: false,
      field: 'source_type'
    },
    sourceId: { type: DataTypes.INTEGER, allowNull: true, field: 'source_id' },
    itemTitle: { type: DataTypes.STRING(220), allowNull: false, field: 'item_title' },
    score: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    maxScore: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 100.00, field: 'max_score' },
    isExempt: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_exempt' },
    isMissing: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_missing' },
    extraCreditPoints: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00, field: 'extra_credit_points' },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'submitted_final', 'approved_final'),
      defaultValue: 'published'
    },
    gradedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'graded_by' },
    publishedAt: { type: DataTypes.DATE, allowNull: true, field: 'published_at' }
  }, {
    tableName: 'grades',
    indexes: [
      { fields: ['class_id', 'student_id'] },
      { fields: ['grade_category_id'] },
      { fields: ['source_type', 'source_id', 'student_id'] }
    ]
  });

  const GradeHistory = sequelize.define('GradeHistory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    gradeId: { type: DataTypes.INTEGER, allowNull: false, field: 'grade_id' },
    classId: { type: DataTypes.INTEGER, allowNull: false, field: 'class_id' },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    previousScore: { type: DataTypes.DECIMAL(6, 2), allowNull: true, field: 'previous_score' },
    newScore: { type: DataTypes.DECIMAL(6, 2), allowNull: true, field: 'new_score' },
    previousStatus: { type: DataTypes.STRING(40), allowNull: true, field: 'previous_status' },
    newStatus: { type: DataTypes.STRING(40), allowNull: true, field: 'new_status' },
    reason: { type: DataTypes.STRING(500), allowNull: false },
    changedBy: { type: DataTypes.INTEGER, allowNull: false, field: 'changed_by' }
  }, {
    tableName: 'grade_history',
    indexes: [{ fields: ['grade_id'] }, { fields: ['class_id'] }]
  });

  const Certificate = sequelize.define('Certificate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    certificateCode: { type: DataTypes.STRING(80), allowNull: false, unique: true, field: 'certificate_code' },
    verificationHash: { type: DataTypes.STRING(128), allowNull: false, unique: true, field: 'verification_hash' },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    courseId: { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
    classId: { type: DataTypes.INTEGER, allowNull: true, field: 'class_id' },
    recipientName: { type: DataTypes.STRING(200), allowNull: false, field: 'recipient_name' },
    courseTitle: { type: DataTypes.STRING(220), allowNull: false, field: 'course_title' },
    courseCode: { type: DataTypes.STRING(40), allowNull: false, field: 'course_code' },
    finalScore: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'final_score' },
    issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'issued_at' },
    issuedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'issued_by' },
    status: { type: DataTypes.ENUM('active', 'revoked'), defaultValue: 'active' }
  }, {
    tableName: 'certificates',
    indexes: [
      { fields: ['certificate_code'], unique: true },
      { fields: ['student_id'] },
      { fields: ['course_id', 'student_id'] }
    ]
  });

  const Badge = sequelize.define('Badge', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    badgeCode: { type: DataTypes.STRING(80), allowNull: false, unique: true, field: 'badge_code' },
    verificationHash: { type: DataTypes.STRING(128), allowNull: false, unique: true, field: 'verification_hash' },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    icon: { type: DataTypes.STRING(100), defaultValue: 'award' },
    category: { type: DataTypes.STRING(80), defaultValue: 'course_achievement' },
    criteriaType: {
      type: DataTypes.ENUM('course_completion', 'perfect_quiz', 'module_mastery', 'first_attempt_pass', 'participation'),
      defaultValue: 'course_completion',
      field: 'criteria_type'
    },
    criteriaThreshold: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: 'criteria_threshold' },
    courseId: { type: DataTypes.INTEGER, allowNull: true, field: 'course_id' },
    createdBy: { type: DataTypes.INTEGER, allowNull: true, field: 'created_by' },
    status: { type: DataTypes.ENUM('active', 'revoked'), defaultValue: 'active' }
  }, {
    tableName: 'badges',
    indexes: [
      { fields: ['badge_code'], unique: true },
      { fields: ['verification_hash'], unique: true },
      { fields: ['course_id'] }
    ]
  });

  const StudentBadge = sequelize.define('StudentBadge', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    badgeId: { type: DataTypes.INTEGER, allowNull: false, field: 'badge_id' },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    courseId: { type: DataTypes.INTEGER, allowNull: true, field: 'course_id' },
    badgeCode: { type: DataTypes.STRING(80), allowNull: false, unique: true, field: 'badge_code' },
    verificationHash: { type: DataTypes.STRING(128), allowNull: false, unique: true, field: 'verification_hash' },
    earnedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'earned_at' },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
    status: { type: DataTypes.ENUM('active', 'revoked'), defaultValue: 'active' }
  }, {
    tableName: 'student_badges',
    indexes: [
      { fields: ['badge_code'], unique: true },
      { fields: ['verification_hash'], unique: true },
      { fields: ['student_id', 'badge_id', 'course_id'] }
    ]
  });

  // ── Attendance ────────────────────────────────────────────
  const AttendanceSession = sequelize.define('AttendanceSession', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    classId:   { type: DataTypes.INTEGER, allowNull: false, field: 'class_id' },
    sessionDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'session_date' },
    topic:     { type: DataTypes.STRING(255), allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true, field: 'created_by' }
  }, {
    tableName: 'attendance_sessions',
    indexes: [{ fields: ['class_id', 'session_date'] }]
  });

  const AttendanceRecord = sequelize.define('AttendanceRecord', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId:   { type: DataTypes.INTEGER, allowNull: false, field: 'session_id' },
    classId:     { type: DataTypes.INTEGER, allowNull: false, field: 'class_id' },
    studentId:   { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
    status:      { type: DataTypes.ENUM('present','absent','late','excused'), defaultValue: 'present' },
    remarks:     { type: DataTypes.STRING(255), allowNull: true }
  }, {
    tableName: 'attendance_records',
    indexes: [{ fields: ['session_id', 'student_id'], unique: true }]
  });

  return {
    GradeCategory,
    Grade,
    GradeHistory,
    Certificate,
    Badge,
    StudentBadge,
    AttendanceSession,
    AttendanceRecord
  };
};

