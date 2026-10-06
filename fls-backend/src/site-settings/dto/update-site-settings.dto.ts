import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  IsEmail,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SocialLinkDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  _id?: any;

  @ApiPropertyOptional()
  @IsOptional()
  id?: any;
}

export class UpdateSiteSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  heroTagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  heroDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  aboutTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  aboutText1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  aboutText2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  googleMapsEmbedUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @ValidateIf((o) => !!o.email && typeof o.email === 'string' && o.email.trim() !== '')
  @IsEmail({}, { message: 'email doit être une adresse email valide' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  scheduleWeekdays?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  scheduleSaturday?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  scheduleSunday?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  facebookUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  instagramUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  linkedinUrl?: string;

  @ApiPropertyOptional({ type: [SocialLinkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];
}
