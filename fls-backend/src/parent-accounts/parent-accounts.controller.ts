import { Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ParentAccountsService } from './parent-accounts.service.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';

@ApiTags('Parent Accounts')
@ApiBearerAuth()
@Controller('students')
export class ParentAccountsController {
  constructor(private parentAccountsService: ParentAccountsService) {}

  @Post(':id/parent-account')
  createParentAccount(@Param('id', ParseObjectIdPipe) id: string) {
    return this.parentAccountsService.createForStudent(id);
  }

  @Get(':id/parent-account')
  getParentAccount(@Param('id', ParseObjectIdPipe) id: string) {
    return this.parentAccountsService.findByStudent(id);
  }

  @Post(':id/parent-account/reset-password')
  resetPassword(@Param('id', ParseObjectIdPipe) id: string) {
    return this.parentAccountsService.resetPassword(id);
  }

  @Delete(':id/parent-account')
  deleteParentAccount(@Param('id', ParseObjectIdPipe) id: string) {
    return this.parentAccountsService.removeByStudent(id);
  }
}
