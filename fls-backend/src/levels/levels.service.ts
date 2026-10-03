import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Level, LevelDocument } from './level.schema.js';
import { CreateLevelDto } from './dto/create-level.dto.js';
import { UpdateLevelDto } from './dto/update-level.dto.js';
import { mapLeanDoc } from '../common/utils/paginate.js';
import { ActivityService } from '../activity/activity.service.js';

@Injectable()
export class LevelsService {
  constructor(
    @InjectModel(Level.name) private levelModel: Model<LevelDocument>,
    private activityService: ActivityService,
  ) {}

  async findAll() {
    const levels = await this.levelModel
      .find()
      .sort({ position: 1 })
      .lean()
      .exec();

    // Get classesCount per level via aggregation
    const classesCounts = await this.levelModel.db
      .collection('schoolclasses')
      .aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }])
      .toArray();

    // Get distinct active studentsCount per level via enrollments
    const studentsCounts = await this.levelModel.db
      .collection('enrollments')
      .aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'studygroups',
            localField: 'group',
            foreignField: '_id',
            as: 'grp',
          },
        },
        { $unwind: '$grp' },
        {
          $lookup: {
            from: 'subjects',
            localField: 'grp.subject',
            foreignField: '_id',
            as: 'sub',
          },
        },
        { $unwind: '$sub' },
        {
          $lookup: {
            from: 'schoolclasses',
            localField: 'sub.schoolClass',
            foreignField: '_id',
            as: 'cls',
          },
        },
        { $unwind: '$cls' },
        {
          $group: {
            _id: { level: '$cls.level', student: '$student' },
          },
        },
        {
          $group: {
            _id: '$_id.level',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const classesMap = new Map(
      classesCounts.map((c) => [c._id.toString(), c.count]),
    );
    const studentsMap = new Map(
      studentsCounts.map((s) => [s._id.toString(), s.count]),
    );

    return levels.map((l) => {
      const mapped = mapLeanDoc(l as any);
      return {
        ...mapped,
        classesCount: classesMap.get(mapped.id) ?? 0,
        studentsCount: studentsMap.get(mapped.id) ?? 0,
      };
    });
  }

  async findOne(id: string) {
    const level = await this.levelModel.findById(id).exec();
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }

  async create(dto: CreateLevelDto) {
    const level = await this.levelModel.create(dto);
    await this.activityService.log(
      'LEVEL_CREATED',
      'New level created',
      dto.name,
    );
    return level;
  }

  async update(id: string, dto: UpdateLevelDto) {
    const level = await this.levelModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }

  async remove(id: string) {
    const classCount = await this.levelModel.db
      .collection('schoolclasses')
      .countDocuments({ level: new Types.ObjectId(id) });
    if (classCount > 0) {
      throw new ConflictException('Level has classes');
    }
    const level = await this.levelModel.findByIdAndDelete(id).exec();
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }
}
