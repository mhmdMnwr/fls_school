import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module.js';
import { MongoExceptionFilter } from '../src/common/filters/mongo-exception.filter.js';

describe('FLS School Backend E2E Flow', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let token: string;

  let levelId: string;
  let classId: string;
  let subjectId: string;
  let teacherId: string;
  let groupId: string;
  let studentId: string;
  let enrollmentId: string;
  let sessionId: string;
  let paymentId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.ADMIN_EMAIL = 'admin@fls.school';
    process.env.ADMIN_PASSWORD = 'ChangeMe123!';

    // Connect and seed admin
    await mongoose.connect(uri);
    const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
    await mongoose.connection.collection('admins').insertOne({
      email: 'admin@fls.school',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new MongoExceptionFilter());

    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('1. Unauthenticated request to /api/levels should return 401', async () => {
    await request(app.getHttpServer()).get('/api/levels').expect(401);
  });

  it('2. POST /api/auth/login with wrong credentials should return 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@fls.school', password: 'WrongPassword' })
      .expect(401);

    expect(res.body.message).toBe('Invalid credentials');
  });

  it('3. POST /api/auth/login with valid credentials should return token and admin info', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@fls.school', password: 'ChangeMe123!' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.admin).toBeDefined();
    expect(res.body.admin.email).toBe('admin@fls.school');
    expect(res.body.admin.id).toBeDefined();
    expect(res.body.admin.passwordHash).toBeUndefined();

    token = res.body.accessToken;
  });

  it('4. GET /api/auth/me with token should return current admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe('admin@fls.school');
    expect(res.body.id).toBeDefined();
  });

  it('5. Invalid ObjectId param should return 400 Bad Request, never 500', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/levels/invalid-object-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.message).toBe('Invalid id');
  });

  it('6. POST /api/levels should create a Level', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/levels')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lycee', position: 1 })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Lycee');
    expect(res.body.position).toBe(1);
    expect(res.body._id).toBeUndefined();

    levelId = res.body.id;
  });

  it('7. GET /api/levels should return levels with classesCount and studentsCount', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].classesCount).toBe(0);
    expect(res.body[0].studentsCount).toBe(0);
  });

  it('8. POST /api/classes should create a Class referencing Level', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/classes')
      .set('Authorization', `Bearer ${token}`)
      .send({ levelId, name: '2nde' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('2nde');
    expect(res.body._id).toBeUndefined();

    classId = res.body.id;
  });

  it('9. Deleting Level when it has classes should return 409 Conflict', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/levels/${levelId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    expect(res.body.message).toBe('Level has classes');
  });

  it('10. POST /api/subjects should create a Subject', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ schoolClassId: classId, name: 'Mathematiques' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Mathematiques');
    expect(res.body._id).toBeUndefined();

    subjectId = res.body.id;
  });

  it('11. POST /api/teachers should create a Teacher', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/teachers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Ahmed',
        lastName: 'Alami',
        phone: '0611223344',
        email: 'ahmed@fls.school',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.firstName).toBe('Ahmed');
    expect(res.body.isActive).toBe(true);

    teacherId = res.body.id;
  });

  it('12. POST /api/groups should create a StudyGroup', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({
        subjectId,
        teacherId,
        name: 'Groupe Math 2nde',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Groupe Math 2nde');

    groupId = res.body.id;
  });

  it('13. POST /api/students should create a Student', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Youssef',
        lastName: 'Idrissi',
        birthDate: '2008-04-10',
        phone: '0655001122',
        email: 'youssef@example.com',
        schoolClassId: classId,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.firstName).toBe('Youssef');
    expect(res.body.isActive).toBe(true);

    studentId = res.body.id;
  });

  it('14. POST /api/enrollments should enroll student in group', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId, groupId })
      .expect(201);

    expect(res.body.id).toBeDefined();
    enrollmentId = res.body.id;
  });

  it('15. Shortcut GET /api/students/:id/enrollments should return enrollments', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/students/${studentId}/enrollments`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('16. Shortcut GET /api/groups/:id/students should return students', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/groups/${groupId}/students`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].firstName).toBe('Youssef');
  });

  it('17. POST /api/sessions should create Session and auto-create AbsenceRecord', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        date: '2025-02-15',
        startTime: '10:00',
        endTime: '11:30',
        isFreeTrial: false,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.startTime).toBe('10:00');
    expect(res.body.endTime).toBe('11:30');

    sessionId = res.body.id;

    // Verify session details include auto-created attendance
    const getRes = await request(app.getHttpServer())
      .get(`/api/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.attendance).toBeDefined();
    expect(getRes.body.attendance.length).toBe(1);
    expect(getRes.body.attendance[0].isPresent).toBe(true);
  });

  it('18. PUT /api/absences/sessions/:sessionId should update attendance', async () => {
    await request(app.getHttpServer())
      .put(`/api/absences/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        records: [{ studentId, isPresent: false }],
      })
      .expect(200);

    // Verify student summary
    const summaryRes = await request(app.getHttpServer())
      .get(`/api/absences/students/${studentId}/summary`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(summaryRes.body.total).toBe(1);
    expect(summaryRes.body.present).toBe(0);
    expect(summaryRes.body.absent).toBe(1);
    expect(summaryRes.body.absenceRate).toBe(100);
  });

  it('19. POST /api/payments should record payment for student', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId,
        paidOn: '2025-02-15',
        amount: 150.0,
        description: 'Monthly tuition',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.amount).toBe(150);

    paymentId = res.body.id;

    // Check payment summary
    const summaryRes = await request(app.getHttpServer())
      .get(`/api/payments/students/${studentId}/summary`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(summaryRes.body.totalPaid).toBe(150);
    expect(summaryRes.body.count).toBe(1);
  });

  it('20. Deleting Student with payments should return 409 Conflict', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/students/${studentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    expect(res.body.message).toContain('Student has payments');
  });

  it('21. Dashboard GET /api/dashboard/stats should return correct statistics', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({
      students: { total: 1, newThisMonth: expect.any(Number) },
      levels: { total: 1 },
      subjects: { total: 1 },
      teachers: { total: 1 },
    });
  });

  it('22. Dashboard GET /api/dashboard/students-by-level should return level distribution', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/students-by-level')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].level).toBe('Lycee');
    expect(res.body[0].count).toBe(1);
    expect(res.body[0].percentage).toBe(100);
  });

  it('23. Dashboard GET /api/dashboard/recent-students should list recent students', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/recent-students?limit=5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].fullName).toBe('Youssef Idrissi');
    expect(res.body[0].className).toBe('2nde');
    expect(res.body[0].levelName).toBe('Lycee');
  });

  it('24. Dashboard GET /api/dashboard/recent-activities should list activity logs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/recent-activities?limit=5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBeDefined();
    expect(res.body[0]._id).toBeUndefined();
  });
});
