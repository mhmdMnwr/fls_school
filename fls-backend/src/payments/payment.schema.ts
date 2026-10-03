import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { Student } from '../students/student.schema.js';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema(baseSchemaOptions)
export class Payment {
  @Prop({
    type: Types.ObjectId,
    ref: Student.name,
    required: true,
    index: true,
  })
  student!: Types.ObjectId;

  @Prop({ required: true })
  paidOn!: Date;

  @Prop({ required: true, min: 0.01 })
  amount!: number;

  @Prop({ default: '' })
  description!: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ student: 1, paidOn: -1 });
