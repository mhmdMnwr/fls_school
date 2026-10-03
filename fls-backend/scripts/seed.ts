import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manually without external packages
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment or .env');
  process.exit(1);
}

const isReset = process.argv.includes('--reset') || process.env.RESET === 'true';

async function run() {
  console.log(`Connecting to MongoDB at ${(MONGODB_URI as string).replace(/:([^@]+)@/, ':****@')}...`);
  await mongoose.connect(MONGODB_URI as string);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  if (isReset) {
    console.log('Reset flag provided: dropping collections...');
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      console.log(`Dropping collection ${col.name}...`);
      await db.collection(col.name).drop().catch(() => {});
    }
    console.log('Collections dropped.');
  }

  console.log('Seeding database...');

  // 1. Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@fls.school').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await db.collection('admins').updateOne(
    { email: adminEmail },
    { $set: { email: adminEmail, passwordHash, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );
  console.log(`Admin seeded: ${adminEmail}`);

  // 2. Levels
  const levelsData = [
    { name: 'Primaire', position: 1 },
    { name: 'College', position: 2 },
    { name: 'Lycee', position: 3 },
  ];

  for (const lvl of levelsData) {
    await db.collection('levels').updateOne(
      { name: lvl.name },
      { $set: { name: lvl.name, position: lvl.position, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const levels = await db.collection('levels').find().toArray();
  const levelMap = new Map(levels.map((l) => [l.name, l._id]));
  console.log(`Seeded ${levels.length} levels.`);

  // 3. Classes
  const classesData = [
    { level: levelMap.get('Primaire'), name: 'CP' },
    { level: levelMap.get('Primaire'), name: 'CE1' },
    { level: levelMap.get('College'), name: '6eme' },
    { level: levelMap.get('College'), name: '5eme' },
    { level: levelMap.get('Lycee'), name: '2nde' },
    { level: levelMap.get('Lycee'), name: '1ere' },
  ];

  for (const cls of classesData) {
    await db.collection('schoolclasses').updateOne(
      { level: cls.level, name: cls.name },
      { $set: { level: cls.level, name: cls.name, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const schoolClasses = await db.collection('schoolclasses').find().toArray();
  const classMap = new Map(schoolClasses.map((c) => [c.name, c._id]));
  console.log(`Seeded ${schoolClasses.length} school classes.`);

  // 4. Subjects
  const subjectsData = [
    { schoolClass: classMap.get('6eme'), name: 'Mathematiques' },
    { schoolClass: classMap.get('6eme'), name: 'Francais' },
    { schoolClass: classMap.get('6eme'), name: 'Anglais' },
    { schoolClass: classMap.get('2nde'), name: 'Physique-Chimie' },
    { schoolClass: classMap.get('2nde'), name: 'Mathematiques' },
    { schoolClass: classMap.get('2nde'), name: 'SVT' },
  ];

  for (const subj of subjectsData) {
    await db.collection('subjects').updateOne(
      { schoolClass: subj.schoolClass, name: subj.name },
      { $set: { schoolClass: subj.schoolClass, name: subj.name, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const subjects = await db.collection('subjects').find().toArray();
  console.log(`Seeded ${subjects.length} subjects.`);

  // 5. Teachers
  const teachersData = [
    { firstName: 'Ahmed', lastName: 'Alami', phone: '0611223344', email: 'ahmed.alami@fls.school', isActive: true },
    { firstName: 'Fatima', lastName: 'Zahra', phone: '0622334455', email: 'fatima.zahra@fls.school', isActive: true },
    { firstName: 'Karim', lastName: 'Bennani', phone: '0633445566', email: 'karim.bennani@fls.school', isActive: true },
  ];

  for (const t of teachersData) {
    await db.collection('teachers').updateOne(
      { lastName: t.lastName, firstName: t.firstName },
      { $set: { ...t, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const teachers = await db.collection('teachers').find().toArray();
  const teacherMap = new Map(teachers.map((t) => [`${t.firstName} ${t.lastName}`, t._id]));
  console.log(`Seeded ${teachers.length} teachers.`);

  // 6. Groups
  const math6eme = subjects.find((s) => s.name === 'Mathematiques' && s.schoolClass.equals(classMap.get('6eme')!));
  const fr6eme = subjects.find((s) => s.name === 'Francais' && s.schoolClass.equals(classMap.get('6eme')!));
  const pc2nde = subjects.find((s) => s.name === 'Physique-Chimie' && s.schoolClass.equals(classMap.get('2nde')!));

  const groupsData = [
    { subject: math6eme?._id, teacher: teacherMap.get('Ahmed Alami'), name: 'Groupe Math 6A', isActive: true },
    { subject: fr6eme?._id, teacher: teacherMap.get('Fatima Zahra'), name: 'Groupe Francais 6B', isActive: true },
    { subject: pc2nde?._id, teacher: teacherMap.get('Karim Bennani'), name: 'Groupe PC 2nde', isActive: true },
  ];

  for (const g of groupsData) {
    if (!g.subject || !g.teacher) continue;
    await db.collection('studygroups').updateOne(
      { subject: g.subject, teacher: g.teacher, name: g.name },
      { $set: { ...g, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const groups = await db.collection('studygroups').find().toArray();
  const groupMap = new Map(groups.map((g) => [g.name, g._id]));
  console.log(`Seeded ${groups.length} study groups.`);

  // 7. Students (10 students)
  const class6emeId = classMap.get('6eme')!;
  const class2ndeId = classMap.get('2nde')!;

  const studentsData = [
    { firstName: 'Youssef', lastName: 'Idrissi', birthDate: new Date('2012-04-10T00:00:00.000Z'), phone: '0655001122', email: 'youssef@example.com', isActive: true },
    { firstName: 'Salma', lastName: 'Tazi', birthDate: new Date('2012-07-22T00:00:00.000Z'), phone: '0655001123', email: 'salma@example.com', isActive: true },
    { firstName: 'Amine', lastName: 'Chraibi', birthDate: new Date('2012-01-15T00:00:00.000Z'), phone: '0655001124', email: 'amine@example.com', isActive: true },
    { firstName: 'Nour', lastName: 'Berrada', birthDate: new Date('2012-11-03T00:00:00.000Z'), phone: '0655001125', email: 'nour@example.com', isActive: true },
    { firstName: 'Mehdi', lastName: 'Fassi', birthDate: new Date('2012-09-18T00:00:00.000Z'), phone: '0655001126', email: 'mehdi@example.com', isActive: true },
    { firstName: 'Zineb', lastName: 'Kabbaj', birthDate: new Date('2008-03-12T00:00:00.000Z'), phone: '0655001127', email: 'zineb@example.com', isActive: true },
    { firstName: 'Omar', lastName: 'Benjelloun', birthDate: new Date('2008-08-30T00:00:00.000Z'), phone: '0655001128', email: 'omar@example.com', isActive: true },
    { firstName: 'Lina', lastName: 'Sqalli', birthDate: new Date('2008-05-19T00:00:00.000Z'), phone: '0655001129', email: 'lina@example.com', isActive: true },
    { firstName: 'Hamza', lastName: 'Lahlou', birthDate: new Date('2008-12-01T00:00:00.000Z'), phone: '0655001130', email: 'hamza@example.com', isActive: true },
    { firstName: 'Rania', lastName: 'El Amrani', birthDate: new Date('2008-06-25T00:00:00.000Z'), phone: '0655001131', email: 'rania@example.com', isActive: true },
  ];

  for (const s of studentsData) {
    await db.collection('students').updateOne(
      { lastName: s.lastName, firstName: s.firstName },
      { $set: { ...s, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const students = await db.collection('students').find().toArray();
  console.log(`Seeded ${students.length} students.`);

  // 8. Enrollments
  const groupMath6 = groupMap.get('Groupe Math 6A');
  const groupFr6 = groupMap.get('Groupe Francais 6B');
  const groupPC2 = groupMap.get('Groupe PC 2nde');

  const enrollmentsData: any[] = [];
  if (groupMath6) {
    for (const s of students.slice(0, 4)) {
      enrollmentsData.push({ student: s._id, group: groupMath6, enrolledOn: new Date(), isActive: true });
    }
  }
  if (groupFr6) {
    for (const s of students.slice(2, 6)) {
      enrollmentsData.push({ student: s._id, group: groupFr6, enrolledOn: new Date(), isActive: true });
    }
  }
  if (groupPC2) {
    for (const s of students.slice(5, 9)) {
      enrollmentsData.push({ student: s._id, group: groupPC2, enrolledOn: new Date(), isActive: true });
    }
  }

  for (const e of enrollmentsData) {
    await db.collection('enrollments').updateOne(
      { student: e.student, group: e.group },
      { $set: { ...e, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const enrollments = await db.collection('enrollments').find().toArray();
  console.log(`Seeded ${enrollments.length} enrollments.`);

  // 9. Sessions (past and future)
  const pastDate1 = new Date('2026-09-28T00:00:00.000Z');
  const pastDate2 = new Date('2026-10-01T00:00:00.000Z');
  const futureDate1 = new Date('2026-10-10T00:00:00.000Z');
  const futureDate2 = new Date('2026-10-15T00:00:00.000Z');

  const sessionsData = [
    { group: groupMath6, date: pastDate1, startTime: '09:00', endTime: '10:30', isFreeTrial: false },
    { group: groupFr6, date: pastDate2, startTime: '11:00', endTime: '12:30', isFreeTrial: false },
    { group: groupMath6, date: futureDate1, startTime: '14:00', endTime: '15:30', isFreeTrial: false },
    { group: groupPC2, date: futureDate2, startTime: '16:00', endTime: '17:30', isFreeTrial: true },
  ];

  for (const sess of sessionsData) {
    if (!sess.group) continue;
    await db.collection('sessions').updateOne(
      { group: sess.group, date: sess.date, startTime: sess.startTime },
      { $set: { ...sess, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const sessions = await db.collection('sessions').find().toArray();
  console.log(`Seeded ${sessions.length} sessions.`);

  // 10. Absence records for past sessions
  const pastSessions = sessions.filter((s) => s.date < new Date());
  for (const ps of pastSessions) {
    const groupEnrollments = enrollments.filter((e) => e.group.equals(ps.group));
    let idx = 0;
    for (const ge of groupEnrollments) {
      const isPresent = idx % 2 === 0; // Some present, some absent
      await db.collection('absencerecords').updateOne(
        { session: ps._id, student: ge.student },
        { $set: { session: ps._id, student: ge.student, isPresent, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
      idx++;
    }
  }

  const absenceRecords = await db.collection('absencerecords').find().toArray();
  console.log(`Seeded ${absenceRecords.length} absence records.`);

  // 11. Payments
  const paymentDate = new Date('2026-10-01T00:00:00.000Z');
  const paymentsData = [
    { student: students[0]._id, paidOn: paymentDate, amount: 150.00, description: 'Monthly fee - Math' },
    { student: students[1]._id, paidOn: paymentDate, amount: 200.00, description: 'Monthly fee - Math & FR' },
    { student: students[2]._id, paidOn: paymentDate, amount: 150.00, description: 'Monthly fee - Math' },
    { student: students[5]._id, paidOn: paymentDate, amount: 180.00, description: 'Monthly fee - PC' },
  ];

  for (const p of paymentsData) {
    await db.collection('payments').updateOne(
      { student: p.student, description: p.description },
      { $set: { ...p, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const payments = await db.collection('payments').find().toArray();
  console.log(`Seeded ${payments.length} payments.`);

  // 12. Activity logs
  const activityLogsData = [
    { type: 'STUDENT_CREATED', title: 'New student registered', detail: 'Youssef Idrissi' },
    { type: 'STUDENT_CREATED', title: 'New student registered', detail: 'Salma Tazi' },
    { type: 'TEACHER_CREATED', title: 'New teacher created', detail: 'Ahmed Alami' },
    { type: 'LEVEL_CREATED', title: 'New level created', detail: 'Primaire' },
    { type: 'SUBJECT_CREATED', title: 'New subject created', detail: 'Mathematiques' },
  ];

  for (const a of activityLogsData) {
    await db.collection('activitylogs').updateOne(
      { type: a.type, title: a.title, detail: a.detail },
      { $set: { ...a, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  const activityLogs = await db.collection('activitylogs').find().toArray();
  console.log(`Seeded ${activityLogs.length} activity logs.`);

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
