import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';

export type LevelDocument = HydratedDocument<Level>;

@Schema(baseSchemaOptions)
export class Level {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ default: 0 })
  position!: number;
}

export const LevelSchema = SchemaFactory.createForClass(Level);
