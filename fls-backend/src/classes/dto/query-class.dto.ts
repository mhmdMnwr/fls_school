import { IsOptional, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryClassDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  levelId?: string;
}
