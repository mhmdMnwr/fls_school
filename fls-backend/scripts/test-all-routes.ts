import process from 'process';

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  route: string;
  method: string;
  status: number;
  expectedStatus: number;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

async function request(
  method: string,
  path: string,
  options: {
    token?: string;
    body?: any;
    expectedStatus: number;
    description: string;
  },
) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  const passed = res.status === options.expectedStatus;
  results.push({
    route: path,
    method,
    status: res.status,
    expectedStatus: options.expectedStatus,
    passed,
    notes: options.description + (passed ? '' : ` (Got ${res.status}: ${JSON.stringify(data)})`),
  });

  return { status: res.status, body: data };
}

async function run() {
  console.log('=== STARTING LIVE API ROUTE TESTS ===\n');

  // 1. Swagger Docs
  console.log('--- 1. Swagger Documentation ---');
  await request('GET', 'http://localhost:3000/api/docs', {
    expectedStatus: 200,
    description: 'Swagger UI is accessible',
  });

  // 2. Auth Routes
  console.log('--- 2. Auth Routes ---');
  await request('GET', '/levels', {
    expectedStatus: 401,
    description: 'Unauthenticated access to protected route returns 401',
  });

  await request('POST', '/auth/login', {
    body: { email: 'admin@fls.school', password: 'WrongPassword' },
    expectedStatus: 401,
    description: 'Login with invalid credentials returns 401',
  });

  const loginRes = await request('POST', '/auth/login', {
    body: { email: 'admin@fls.school', password: 'ChangeMe123!' },
    expectedStatus: 201,
    description: 'Login with valid credentials returns 201 and token',
  });

  const token = loginRes.body?.accessToken;
  if (!token) {
    console.error('Fatal: Failed to obtain token from login');
    process.exit(1);
  }

  await request('GET', '/auth/me', {
    token,
    expectedStatus: 200,
    description: 'GET /auth/me returns admin profile',
  });

  await request('PATCH', '/auth/password', {
    token,
    body: { currentPassword: 'WrongPassword', newPassword: 'NewPassword123!' },
    expectedStatus: 401,
    description: 'PATCH /auth/password with wrong current password returns 401',
  });

  await request('PATCH', '/auth/password', {
    token,
    body: { currentPassword: 'ChangeMe123!', newPassword: 'NewPassword123!' },
    expectedStatus: 200,
    description: 'PATCH /auth/password updates password',
  });

  // Restore password
  await request('PATCH', '/auth/password', {
    token,
    body: { currentPassword: 'NewPassword123!', newPassword: 'ChangeMe123!' },
    expectedStatus: 200,
    description: 'Restore password back to original',
  });

  // 3. Levels
  console.log('--- 3. Levels Routes ---');
  const levelsRes = await request('GET', '/levels', {
    token,
    expectedStatus: 200,
    description: 'GET /levels returns all levels with classesCount and studentsCount',
  });

  const levelWithClasses = levelsRes.body.find((l: any) => l.classesCount > 0);

  const newLevelRes = await request('POST', '/levels', {
    token,
    body: { name: 'Maternelle Temp', position: 0 },
    expectedStatus: 201,
    description: 'POST /levels creates a new level',
  });

  const tempLevelId = newLevelRes.body?.id;

  await request('GET', `/levels/${tempLevelId}`, {
    token,
    expectedStatus: 200,
    description: 'GET /levels/:id retrieves single level',
  });

  await request('PATCH', `/levels/${tempLevelId}`, {
    token,
    body: { position: 4 },
    expectedStatus: 200,
    description: 'PATCH /levels/:id updates level',
  });

  await request('DELETE', `/levels/${levelWithClasses.id}`, {
    token,
    expectedStatus: 409,
    description: 'DELETE /levels/:id blocked (409) when level has classes',
  });

  await request('DELETE', `/levels/${tempLevelId}`, {
    token,
    expectedStatus: 200,
    description: 'DELETE /levels/:id removes unused level',
  });

  // 4. Classes
  console.log('--- 4. Classes Routes ---');
  const classesRes = await request('GET', '/classes', {
    token,
    expectedStatus: 200,
    description: 'GET /classes returns all classes',
  });

  const classWithRelations = classesRes.body.find((c: any) => c.name === '6eme');

  await request('GET', `/classes?levelId=${levelWithClasses.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /classes?levelId= filters classes by level',
  });

  const newClassRes = await request('POST', '/classes', {
    token,
    body: { levelId: levelWithClasses.id, name: 'Classe Temp' },
    expectedStatus: 201,
    description: 'POST /classes creates new class',
  });

  const tempClassId = newClassRes.body?.id;

  await request('GET', `/classes/${tempClassId}`, {
    token,
    expectedStatus: 200,
    description: 'GET /classes/:id retrieves single class',
  });

  await request('PATCH', `/classes/${tempClassId}`, {
    token,
    body: { name: 'Classe Temp Updated' },
    expectedStatus: 200,
    description: 'PATCH /classes/:id updates class',
  });

  await request('DELETE', `/classes/${classWithRelations.id}`, {
    token,
    expectedStatus: 409,
    description: 'DELETE /classes/:id blocked (409) when class has subjects/students',
  });

  await request('DELETE', `/classes/${tempClassId}`, {
    token,
    expectedStatus: 200,
    description: 'DELETE /classes/:id removes unused class',
  });

  // 5. Subjects
  console.log('--- 5. Subjects Routes ---');
  const subjectsRes = await request('GET', '/subjects?page=1&limit=10', {
    token,
    expectedStatus: 200,
    description: 'GET /subjects returns paginated subjects with meta',
  });

  const subjectWithGroups = subjectsRes.body.data.find((s: any) => s.name === 'Mathematiques');

  await request('GET', `/subjects?classId=${classWithRelations.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /subjects?classId= filters subjects by class',
  });

  await request('GET', `/subjects?search=Math`, {
    token,
    expectedStatus: 200,
    description: 'GET /subjects?search= searches subjects by name',
  });

  const newSubjRes = await request('POST', '/subjects', {
    token,
    body: { schoolClassId: classWithRelations.id, name: 'Musique Temp' },
    expectedStatus: 201,
    description: 'POST /subjects creates subject',
  });

  const tempSubjectId = newSubjRes.body?.id;

  await request('GET', `/subjects/${tempSubjectId}`, {
    token,
    expectedStatus: 200,
    description: 'GET /subjects/:id retrieves subject',
  });

  await request('PATCH', `/subjects/${tempSubjectId}`, {
    token,
    body: { name: 'Musique Temp Updated' },
    expectedStatus: 200,
    description: 'PATCH /subjects/:id updates subject',
  });

  await request('DELETE', `/subjects/${subjectWithGroups.id}`, {
    token,
    expectedStatus: 409,
    description: 'DELETE /subjects/:id blocked (409) when referenced by groups',
  });

  await request('DELETE', `/subjects/${tempSubjectId}`, {
    token,
    expectedStatus: 200,
    description: 'DELETE /subjects/:id removes unused subject',
  });

  // 6. Teachers
  console.log('--- 6. Teachers Routes ---');
  const teachersRes = await request('GET', '/teachers?page=1&limit=5', {
    token,
    expectedStatus: 200,
    description: 'GET /teachers returns paginated teachers',
  });

  const teacherWithGroups = teachersRes.body.data.find((t: any) => t.firstName === 'Ahmed');

  await request('GET', `/teachers?search=Ahmed`, {
    token,
    expectedStatus: 200,
    description: 'GET /teachers?search= filters teachers by keyword',
  });

  await request('GET', `/teachers?isActive=true`, {
    token,
    expectedStatus: 200,
    description: 'GET /teachers?isActive= filters active teachers',
  });

  const newTeacherRes = await request('POST', '/teachers', {
    token,
    body: {
      firstName: 'Professeur',
      lastName: 'Temporaire',
      email: 'prof.temp@fls.school',
      phone: '0699887766',
    },
    expectedStatus: 201,
    description: 'POST /teachers creates new teacher',
  });

  const tempTeacherId = newTeacherRes.body?.id;

  await request('GET', `/teachers/${teacherWithGroups.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /teachers/:id returns teacher with groups',
  });

  await request('PATCH', `/teachers/${tempTeacherId}`, {
    token,
    body: { phone: '0600000000' },
    expectedStatus: 200,
    description: 'PATCH /teachers/:id updates teacher',
  });

  await request('DELETE', `/teachers/${teacherWithGroups.id}`, {
    token,
    expectedStatus: 409,
    description: 'DELETE /teachers/:id blocked (409) when teacher has groups',
  });

  await request('DELETE', `/teachers/${tempTeacherId}`, {
    token,
    expectedStatus: 200,
    description: 'DELETE /teachers/:id removes unused teacher',
  });

  // 7. Groups
  console.log('--- 7. Study Groups Routes ---');
  const groupsRes = await request('GET', '/groups?page=1&limit=5', {
    token,
    expectedStatus: 200,
    description: 'GET /groups returns paginated groups with studentsCount',
  });

  const seededGroup = groupsRes.body.data[0];

  await request('GET', `/groups?subjectId=${subjectWithGroups.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /groups?subjectId= filters groups by subject',
  });

  await request('GET', `/groups?teacherId=${teacherWithGroups.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /groups?teacherId= filters groups by teacher',
  });

  await request('GET', `/groups/${seededGroup.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /groups/:id returns group with enrolled students',
  });

  await request('GET', `/groups/${seededGroup.id}/students`, {
    token,
    expectedStatus: 200,
    description: 'Shortcut GET /groups/:id/students returns enrolled students',
  });

  const newGroupRes = await request('POST', '/groups', {
    token,
    body: {
      subjectId: subjectWithGroups.id,
      teacherId: teacherWithGroups.id,
      name: 'Groupe Math Temp',
    },
    expectedStatus: 201,
    description: 'POST /groups creates a new group',
  });

  const tempGroupId = newGroupRes.body?.id;

  await request('PATCH', `/groups/${tempGroupId}`, {
    token,
    body: { name: 'Groupe Math Temp Updated' },
    expectedStatus: 200,
    description: 'PATCH /groups/:id updates group',
  });

  await request('DELETE', `/groups/${tempGroupId}`, {
    token,
    expectedStatus: 200,
    description: 'DELETE /groups/:id cascades and removes group',
  });

  // 8. Students
  console.log('--- 8. Students Routes ---');
  const studentsRes = await request('GET', '/students?page=1&limit=10', {
    token,
    expectedStatus: 200,
    description: 'GET /students returns paginated students with class and level',
  });

  const studentWithPayments = studentsRes.body.data.find((s: any) => s.firstName === 'Youssef');

  await request('GET', `/students?search=Youssef`, {
    token,
    expectedStatus: 200,
    description: 'GET /students?search= filters students',
  });

  await request('GET', `/students?classId=${classWithRelations.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /students?classId= filters students by class',
  });

  await request('GET', `/students/${studentWithPayments.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /students/:id returns student with enrollments and totalPaid',
  });

  await request('GET', `/students/${studentWithPayments.id}/enrollments`, {
    token,
    expectedStatus: 200,
    description: 'Shortcut GET /students/:id/enrollments returns student enrollments',
  });

  const newStudentRes = await request('POST', '/students', {
    token,
    body: {
      firstName: 'Eleve',
      lastName: 'Temporaire',
      birthDate: '2010-01-01',
      schoolClassId: classWithRelations.id,
    },
    expectedStatus: 201,
    description: 'POST /students registers new student',
  });

  const tempStudentId = newStudentRes.body?.id;

  await request('PATCH', `/students/${tempStudentId}`, {
    token,
    body: { phone: '0612345678' },
    expectedStatus: 200,
    description: 'PATCH /students/:id updates student',
  });

  await request('DELETE', `/students/${studentWithPayments.id}`, {
    token,
    expectedStatus: 409,
    description: 'DELETE /students/:id blocked (409) when student has payments',
  });

  await request('DELETE', `/students/${tempStudentId}`, {
    token,
    expectedStatus: 200,
    description: 'DELETE /students/:id removes student without payments',
  });

  // 9. Enrollments
  console.log('--- 9. Enrollments Routes ---');
  const enrollmentsRes = await request('GET', '/enrollments', {
    token,
    expectedStatus: 200,
    description: 'GET /enrollments lists enrollments',
  });

  const seededEnrollment = enrollmentsRes.body[0];

  await request('GET', `/enrollments?groupId=${seededGroup.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /enrollments?groupId= filters enrollments by group',
  });

  await request('GET', `/enrollments?studentId=${studentWithPayments.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /enrollments?studentId= filters enrollments by student',
  });

  await request('PATCH', `/enrollments/${seededEnrollment.id}`, {
    token,
    body: { isActive: true },
    expectedStatus: 200,
    description: 'PATCH /enrollments/:id updates active status',
  });

  // 10. Sessions
  console.log('--- 10. Sessions Routes ---');
  const sessionsRes = await request('GET', '/sessions?page=1&limit=5', {
    token,
    expectedStatus: 200,
    description: 'GET /sessions returns paginated sessions',
  });

  const seededSession = sessionsRes.body.data[0];

  await request('GET', '/sessions/upcoming?limit=5', {
    token,
    expectedStatus: 200,
    description: 'GET /sessions/upcoming returns future sessions',
  });

  const sessionDetail = await request('GET', `/sessions/${seededSession.id}`, {
    token,
    expectedStatus: 200,
    description: 'GET /sessions/:id returns session with attendance list',
  });

  const newSessionRes = await request('POST', '/sessions', {
    token,
    body: {
      groupId: seededGroup.id,
      date: '2026-11-01',
      startTime: '08:00',
      endTime: '09:30',
      isFreeTrial: false,
    },
    expectedStatus: 201,
    description: 'POST /sessions creates session and auto-generates absence records',
  });

  const tempSessionId = newSessionRes.body?.id;

  await request('PATCH', `/sessions/${tempSessionId}`, {
    token,
    body: { startTime: '08:30' },
    expectedStatus: 200,
    description: 'PATCH /sessions/:id updates session',
  });

  await request('DELETE', `/sessions/${tempSessionId}`, {
    token,
    expectedStatus: 200,
    description: 'DELETE /sessions/:id removes session and its absence records',
  });

  // 11. Absences
  console.log('--- 11. Absences Routes ---');
  const enrolledStudent = sessionDetail.body?.attendance?.[0]?.student;
  if (enrolledStudent) {
    await request('PUT', `/absences/sessions/${seededSession.id}`, {
      token,
      body: {
        records: [{ studentId: enrolledStudent.id, isPresent: true }],
      },
      expectedStatus: 200,
      description: 'PUT /absences/sessions/:id bulk updates attendance for enrolled student',
    });

    await request('GET', `/absences/students/${enrolledStudent.id}`, {
      token,
      expectedStatus: 200,
      description: 'GET /absences/students/:id returns attendance history newest first',
    });

    await request('GET', `/absences/students/${enrolledStudent.id}/summary`, {
      token,
      expectedStatus: 200,
      description: 'GET /absences/students/:id/summary returns attendance rate and counts',
    });
  }

  // 12. Payments
  console.log('--- 12. Payments Routes ---');
  await request('GET', '/payments?page=1&limit=5', {
    token,
    expectedStatus: 200,
    description: 'GET /payments returns paginated payments newest first',
  });

  const newPaymentRes = await request('POST', '/payments', {
    token,
    body: {
      studentId: studentWithPayments.id,
      paidOn: '2026-10-02',
      amount: 120.50,
      description: 'Test tuition payment',
    },
    expectedStatus: 201,
    description: 'POST /payments records student payment',
  });

  const tempPaymentId = newPaymentRes.body?.id;

  await request('PATCH', `/payments/${tempPaymentId}`, {
    token,
    body: { amount: 130.00 },
    expectedStatus: 200,
    description: 'PATCH /payments/:id updates payment',
  });

  await request('GET', `/payments/students/${studentWithPayments.id}/summary`, {
    token,
    expectedStatus: 200,
    description: 'GET /payments/students/:id/summary aggregates totalPaid and count',
  });

  await request('DELETE', `/payments/${tempPaymentId}`, {
    token,
    expectedStatus: 200,
    description: 'DELETE /payments/:id removes payment',
  });

  // 13. Dashboard
  console.log('--- 13. Dashboard Routes ---');
  await request('GET', '/dashboard/stats', {
    token,
    expectedStatus: 200,
    description: 'GET /dashboard/stats returns student, level, subject, teacher metrics',
  });

  await request('GET', '/dashboard/enrollment-evolution?year=2026', {
    token,
    expectedStatus: 200,
    description: 'GET /dashboard/enrollment-evolution returns monthly cumulative totals',
  });

  await request('GET', '/dashboard/students-by-level', {
    token,
    expectedStatus: 200,
    description: 'GET /dashboard/students-by-level returns distribution by academic level',
  });

  await request('GET', '/dashboard/recent-students?limit=5', {
    token,
    expectedStatus: 200,
    description: 'GET /dashboard/recent-students lists newest students',
  });

  await request('GET', '/dashboard/upcoming-sessions?limit=4', {
    token,
    expectedStatus: 200,
    description: 'GET /dashboard/upcoming-sessions lists next upcoming sessions',
  });

  await request('GET', '/dashboard/recent-activities?limit=5', {
    token,
    expectedStatus: 200,
    description: 'GET /dashboard/recent-activities lists latest system activity logs',
  });

  // 14. Activity Log
  console.log('--- 14. Activity Log Routes ---');
  await request('GET', '/activity?page=1&limit=5', {
    token,
    expectedStatus: 200,
    description: 'GET /activity returns paginated activity log events',
  });

  // 15. Error Handling / Validation
  console.log('--- 15. Error Handling & Validation ---');
  await request('GET', '/levels/not-a-valid-id', {
    token,
    expectedStatus: 400,
    description: 'Invalid ObjectId in path parameter returns 400',
  });

  await request('POST', '/levels', {
    token,
    body: { name: 'Test Level', unknownField: 'not allowed' },
    expectedStatus: 400,
    description: 'Unknown property in request body rejected with 400',
  });

  // Print Summary
  console.log('\n========================================');
  console.log('            TEST RESULTS SUMMARY        ');
  console.log('========================================');
  let passedCount = 0;
  let failedCount = 0;

  for (const r of results) {
    if (r.passed) {
      passedCount++;
      console.log(`[PASS] ${r.method.padEnd(6)} ${r.route.padEnd(45)} -> ${r.notes}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${r.method.padEnd(6)} ${r.route.padEnd(45)} -> ${r.notes}`);
    }
  }

  console.log(`\nTotal: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('\nALL ROUTES VERIFIED SUCCESSFULLY! ✨');
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
