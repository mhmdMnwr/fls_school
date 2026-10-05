import {
  Controller,
  Get,
  Patch,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service.js';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto.js';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SiteSettingsController {
  constructor(private siteSettingsService: SiteSettingsService) {}

  @Get('site')
  getSettings() {
    return this.siteSettingsService.getSettings();
  }

  @Patch('site')
  updateSettings(@Body() dto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.updateSettings(dto);
  }
}
