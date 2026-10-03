import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';

export type AdminDocument = HydratedDocument<Admin>;

@Schema(baseSchemaOptions)
export class Admin {
  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
