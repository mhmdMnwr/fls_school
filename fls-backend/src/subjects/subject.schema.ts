import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { SchoolClass } from '../classes/school-class.schema.js';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema(baseSchemaOptions)
export class Subject {
  @Prop({
    type: Types.ObjectId,
    ref: SchoolClass.name,
    required: true,
    index: true,
  })
  schoolClass!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ schoolClass: 1, name: 1 }, { unique: true });
