import { IsOptional, IsMongoId, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryGroupDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  teacherId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isActive?: string;
}
