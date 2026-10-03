import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ParentAccount,
  ParentAccountSchema,
} from '../parent-accounts/parent-account.schema.js';
import { Student, StudentSchema } from '../students/student.schema.js';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/enrollment.schema.js';
import {
  AbsenceRecord,
  AbsenceRecordSchema,
} from '../absences/absence-record.schema.js';
import { Payment, PaymentSchema } from '../payments/payment.schema.js';
import { ParentPortalService } from './parent-portal.service.js';
import { ParentPortalController } from './parent-portal.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ParentAccount.name, schema: ParentAccountSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: AbsenceRecord.name, schema: AbsenceRecordSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '7d') as any,
        },
      }),
    }),
  ],
  controllers: [ParentPortalController],
  providers: [ParentPortalService],
})
export class ParentPortalModule {}
