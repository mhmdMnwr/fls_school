import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';

export type TeacherDocument = HydratedDocument<Teacher>;

@Schema(baseSchemaOptions)
export class Teacher {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
TeacherSchema.index({ lastName: 1, firstName: 1 });
