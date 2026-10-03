import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { Student } from '../students/student.schema.js';
import { StudyGroup } from '../groups/study-group.schema.js';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema(baseSchemaOptions)
export class Enrollment {
  @Prop({
    type: Types.ObjectId,
    ref: Student.name,
    required: true,
    index: true,
  })
  student!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: StudyGroup.name,
    required: true,
    index: true,
  })
  group!: Types.ObjectId;

  @Prop({ default: () => new Date() })
  enrolledOn!: Date;

  @Prop({ default: true })
  isActive!: boolean;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
EnrollmentSchema.index({ student: 1, group: 1 }, { unique: true });
EnrollmentSchema.index({ group: 1, isActive: 1 });
