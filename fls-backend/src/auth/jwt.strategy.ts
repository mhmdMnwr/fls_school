import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../admin/admin.schema.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'change-me',
    });
  }

  async validate(payload: {
    sub: string;
    email?: string;
    role?: string;
    studentId?: string;
    username?: string;
  }) {
    if (payload.role === 'parent') {
      return {
        id: payload.sub,
        studentId: payload.studentId,
        role: 'parent',
        username: payload.username,
      };
    }

    const admin = await this.adminModel.findById(payload.sub).exec();
    if (!admin) {
      throw new UnauthorizedException();
    }
    return { id: admin._id.toString(), email: admin.email, role: 'admin' };
  }
}
