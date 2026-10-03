import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';

export type StudentDocument = HydratedDocument<Student>;

@Schema(baseSchemaOptions)
export class Student {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true })
  birthDate!: Date;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.index({ lastName: 1, firstName: 1 });
StudentSchema.index({ isActive: 1 });
StudentSchema.index({ createdAt: -1 });
