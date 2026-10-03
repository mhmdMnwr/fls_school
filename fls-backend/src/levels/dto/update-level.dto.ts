import { PartialType } from '@nestjs/swagger';
import { CreateLevelDto } from './create-level.dto.js';

export class UpdateLevelDto extends PartialType(CreateLevelDto) {}
