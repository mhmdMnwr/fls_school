import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './admin.schema.js';

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    try {
      const count = await this.adminModel.countDocuments();
      if (count === 0) {
        const email = this.configService
          .get<string>('ADMIN_EMAIL', 'admin@fls.school')
          .toLowerCase();
        const rawPassword = this.configService.get<string>(
          'ADMIN_PASSWORD',
          'ChangeMe123!',
        );
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        await this.adminModel.create({ email, passwordHash });
        console.log(`[BOOTSTRAP] Compte administrateur initial créé : ${email}`);
      }
    } catch (err: any) {
      console.warn('[BOOTSTRAP] Erreur lors de l\'initialisation du compte admin :', err?.message);
    }
  }
}
