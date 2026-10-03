import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { StudyGroup } from '../groups/study-group.schema.js';

export type SessionDocument = HydratedDocument<Session>;

@Schema(baseSchemaOptions)
export class Session {
  @Prop({
    type: Types.ObjectId,
    ref: StudyGroup.name,
    required: true,
    index: true,
  })
  group!: Types.ObjectId;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop({ default: false })
  isFreeTrial!: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ group: 1, date: 1, startTime: 1 }, { unique: true });
SessionSchema.index({ date: 1 });
