import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SiteSettings,
  SiteSettingsDocument,
} from './site-settings.schema.js';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto.js';
import { ActivityService } from '../activity/activity.service.js';

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectModel(SiteSettings.name)
    private siteSettingsModel: Model<SiteSettingsDocument>,
    private activityService: ActivityService,
  ) {}

  async getSettings(): Promise<SiteSettingsDocument> {
    let settings = await this.siteSettingsModel.findOne({ key: 'main' }).exec();
    if (!settings) {
      settings = await this.siteSettingsModel.create({ key: 'main' });
    }
    return settings;
  }

  async updateSettings(
    dto: UpdateSiteSettingsDto,
  ): Promise<SiteSettingsDocument> {
    const updateData: any = { ...dto };
    if (updateData.tagline && !updateData.heroTagline) {
      updateData.heroTagline = updateData.tagline;
    }
    delete updateData.tagline;

    const updated = await this.siteSettingsModel
      .findOneAndUpdate(
        { key: 'main' },
        { $set: updateData },
        { new: true, upsert: true },
      )
      .exec();

    await this.activityService.log(
      'SETTINGS_UPDATED',
      'Paramètres du site mis à jour',
      'Informations générales et contact',
    );

    return updated;
  }
}
