import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { Level } from '../levels/level.schema.js';

export type SchoolClassDocument = HydratedDocument<SchoolClass>;

@Schema(baseSchemaOptions)
export class SchoolClass {
  @Prop({ type: Types.ObjectId, ref: Level.name, required: true, index: true })
  level!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;
}

export const SchoolClassSchema = SchemaFactory.createForClass(SchoolClass);
SchoolClassSchema.index({ level: 1, name: 1 }, { unique: true });
