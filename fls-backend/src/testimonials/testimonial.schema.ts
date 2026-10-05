import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';
import { Student } from '../students/student.schema.js';

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema(baseSchemaOptions)
export class Testimonial {
  @Prop({ type: Types.ObjectId, ref: Student.name, required: false, index: true })
  student?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  authorName!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ required: true, minlength: 20, maxlength: 500, trim: true })
  message!: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true,
  })
  status!: string;

  @Prop({ required: false })
  reviewedAt?: Date;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
TestimonialSchema.index({ createdAt: -1 });
TestimonialSchema.index({ status: 1, createdAt: -1 });
