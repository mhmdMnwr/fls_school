import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { LevelsModule } from './levels/levels.module.js';
import { ClassesModule } from './classes/classes.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { TeachersModule } from './teachers/teachers.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { StudentsModule } from './students/students.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { AbsencesModule } from './absences/absences.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ActivityModule } from './activity/activity.module.js';
import { ParentAccountsModule } from './parent-accounts/parent-accounts.module.js';
import { ParentPortalModule } from './parent-portal/parent-portal.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    AdminModule,
    AuthModule,
    LevelsModule,
    ClassesModule,
    SubjectsModule,
    TeachersModule,
    GroupsModule,
    StudentsModule,
    EnrollmentsModule,
    SessionsModule,
    AbsencesModule,
    PaymentsModule,
    DashboardModule,
    ActivityModule,
    ParentAccountsModule,
    ParentPortalModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
