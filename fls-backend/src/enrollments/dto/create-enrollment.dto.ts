import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsMongoId()
  studentId!: string;

  @ApiProperty()
  @IsMongoId()
  groupId!: string;
}
