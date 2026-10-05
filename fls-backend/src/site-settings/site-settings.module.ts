import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SiteSettings,
  SiteSettingsSchema,
} from './site-settings.schema.js';
import { SiteSettingsService } from './site-settings.service.js';
import { SiteSettingsController } from './site-settings.controller.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SiteSettings.name, schema: SiteSettingsSchema },
    ]),
    ActivityModule,
  ],
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService],
  exports: [MongooseModule, SiteSettingsService],
})
export class SiteSettingsModule {}
