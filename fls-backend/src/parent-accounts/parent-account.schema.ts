import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { Student } from '../students/student.schema.js';

export type ParentAccountDocument = HydratedDocument<ParentAccount>;

@Schema(baseSchemaOptions)
export class ParentAccount {
  @Prop({
    type: Types.ObjectId,
    ref: Student.name,
    required: true,
    unique: true,
    index: true,
  })
  student!: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username!: string;

  @Prop({ required: true })
  password!: string;
}

export const ParentAccountSchema = SchemaFactory.createForClass(ParentAccount);

