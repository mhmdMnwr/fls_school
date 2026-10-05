import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { SchoolClass } from '../classes/school-class.schema.js';

export type StudentDocument = HydratedDocument<Student>;

@Schema(baseSchemaOptions)
export class Student {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true })
  birthDate!: Date;

  @Prop({ type: String, enum: ['MALE', 'FEMALE'], required: false })
  gender?: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({
    type: Types.ObjectId,
    ref: SchoolClass.name,
    required: false,
    index: true,
  })
  schoolClass?: Types.ObjectId;

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({
    type: String,
    enum: ['ADMIN', 'WEBSITE'],
    default: 'ADMIN',
    index: true,
  })
  origin!: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.index({ lastName: 1, firstName: 1 });
StudentSchema.index({ isActive: 1 });
StudentSchema.index({ createdAt: -1 });
