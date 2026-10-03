import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ParentAccount,
  ParentAccountSchema,
} from './parent-account.schema.js';
import { Student, StudentSchema } from '../students/student.schema.js';
import { ParentAccountsService } from './parent-accounts.service.js';
import { ParentAccountsController } from './parent-accounts.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ParentAccount.name, schema: ParentAccountSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [ParentAccountsController],
  providers: [ParentAccountsService],
  exports: [MongooseModule, ParentAccountsService],
})
export class ParentAccountsModule {}
