import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from './teacher.schema.js';
import { TeachersController } from './teachers.controller.js';
import { TeachersService } from './teachers.service.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
    ActivityModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [MongooseModule],
})
export class TeachersModule {}
