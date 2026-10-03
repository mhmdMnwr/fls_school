import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { Session } from '../sessions/session.schema.js';
import { Student } from '../students/student.schema.js';

export type AbsenceRecordDocument = HydratedDocument<AbsenceRecord>;

@Schema(baseSchemaOptions)
export class AbsenceRecord {
  @Prop({
    type: Types.ObjectId,
    ref: Session.name,
    required: true,
    index: true,
  })
  session!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Student.name,
    required: true,
    index: true,
  })
  student!: Types.ObjectId;

  @Prop({ default: true })
  isPresent!: boolean;
}

export const AbsenceRecordSchema = SchemaFactory.createForClass(AbsenceRecord);
AbsenceRecordSchema.index({ session: 1, student: 1 }, { unique: true });
AbsenceRecordSchema.index({ student: 1, isPresent: 1 });
