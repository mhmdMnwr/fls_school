import { IsOptional, IsMongoId, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryStudentDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  levelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'WEBSITE'] })
  @IsOptional()
  @IsIn(['ADMIN', 'WEBSITE'])
  origin?: 'ADMIN' | 'WEBSITE';
}
