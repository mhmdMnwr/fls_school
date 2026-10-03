import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { Subject } from '../subjects/subject.schema.js';
import { Teacher } from '../teachers/teacher.schema.js';

export type StudyGroupDocument = HydratedDocument<StudyGroup>;

@Schema({ _id: false })
export class StudyTimeSlot {
  @Prop({ required: true })
  weekday!: string;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;
}

export const StudyTimeSlotSchema = SchemaFactory.createForClass(StudyTimeSlot);

@Schema(baseSchemaOptions)
export class StudyGroup {
  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subject!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Teacher.name,
    required: true,
    index: true,
  })
  teacher!: Types.ObjectId;

  @Prop({ default: '' })
  name!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: [StudyTimeSlotSchema], default: [] })
  studyTime!: StudyTimeSlot[];
}

export const StudyGroupSchema = SchemaFactory.createForClass(StudyGroup);
StudyGroupSchema.index({ subject: 1, teacher: 1, name: 1 }, { unique: true });
StudyGroupSchema.index({ teacher: 1, isActive: 1 });
