import { IsArray, ValidateNested, IsMongoId, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AbsenceRecordItem {
  @ApiProperty()
  @IsMongoId()
  studentId!: string;

  @ApiProperty()
  @IsBoolean()
  isPresent!: boolean;
}

export class UpdateAbsencesDto {
  @ApiProperty({ type: [AbsenceRecordItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbsenceRecordItem)
  records!: AbsenceRecordItem[];
}
