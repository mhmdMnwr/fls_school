import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from './activity-log.schema.js';
import { paginate } from '../common/utils/paginate.js';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async log(type: string, title: string, detail?: string): Promise<void> {
    try {
      await this.activityLogModel.create({ type, title, detail: detail ?? '' });
    } catch {
      // Never throw — activity logging is best-effort
    }
  }

  async findAll(options: { page: number; limit: number }) {
    return paginate(
      this.activityLogModel,
      {},
      {
        page: options.page,
        limit: options.limit,
        sort: { createdAt: -1 },
      },
    );
  }
}
