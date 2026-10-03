import {
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
  IsArray,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudyTimeSlotDto {
  @ApiProperty({ example: 'lundi' })
  @IsString()
  weekday!: string;

  @ApiProperty({ example: '08:00' })
  @Transform(({ obj, value }) => value || obj.start)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be HH:mm format',
  })
  startTime!: string;

  @ApiProperty({ example: '10:00' })
  @Transform(({ obj, value }) => value || obj.end)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be HH:mm format',
  })
  endTime!: string;
}

export class CreateGroupDto {
  @ApiProperty()
  @IsMongoId()
  subjectId!: string;

  @ApiProperty()
  @IsMongoId()
  teacherId!: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [StudyTimeSlotDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudyTimeSlotDto)
  studyTime?: StudyTimeSlotDto[];
}
