import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { baseSchemaOptions } from '../common/utils/schema-options.js';

export type SiteSettingsDocument = HydratedDocument<SiteSettings>;

@Schema({ _id: false })
export class SocialLinkItem {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  url!: string;
}

@Schema(baseSchemaOptions)
export class SiteSettings {
  @Prop({ required: true, unique: true, default: 'main' })
  key!: string;

  @Prop({ default: '' })
  heroTagline!: string;

  @Prop({ default: '' })
  heroDescription!: string;

  @Prop({ default: '' })
  aboutTitle!: string;

  @Prop({ default: '' })
  aboutText1!: string;

  @Prop({ default: '' })
  aboutText2!: string;

  @Prop({ default: '' })
  address!: string;

  @Prop({ type: Number, default: 36.8065 })
  mapLatitude!: number;

  @Prop({ type: Number, default: 10.1815 })
  mapLongitude!: number;

  @Prop({ type: Number, default: 15 })
  mapZoom!: number;

  @Prop({ default: '' })
  googleMapsEmbedUrl!: string;

  @Prop({ default: '' })
  mapsUrl!: string;

  @Prop({ default: '' })
  phone!: string;

  @Prop({ default: '' })
  whatsapp!: string;

  @Prop({ default: '' })
  email!: string;

  @Prop({ default: '' })
  scheduleWeekdays!: string;

  @Prop({ default: '' })
  scheduleSaturday!: string;

  @Prop({ default: '' })
  scheduleSunday!: string;

  @Prop({ default: '' })
  facebookUrl!: string;

  @Prop({ default: '' })
  instagramUrl!: string;

  @Prop({ default: '' })
  linkedinUrl!: string;

  @Prop({ type: [{ name: String, url: String }], default: [] })
  socialLinks!: { name: string; url: string }[];
}

export const SiteSettingsSchema = SchemaFactory.createForClass(SiteSettings);
