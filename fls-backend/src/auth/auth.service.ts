import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from '../admin/admin.schema.js';
import { ActivityService } from '../activity/activity.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
    private activityService: ActivityService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.adminModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin._id.toString(), email: admin.email };
    return {
      accessToken: this.jwtService.sign(payload),
      admin: { id: admin._id.toString(), email: admin.email },
    };
  }

  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const admin = await this.adminModel
      .findById(adminId)
      .select('+passwordHash')
      .exec();

    if (
      !admin ||
      !(await bcrypt.compare(currentPassword, admin.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    await admin.save();
    await this.activityService.log('SETTINGS_UPDATED', 'Password changed');
    return { success: true };
  }
}
