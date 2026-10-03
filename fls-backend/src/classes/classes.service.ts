import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SchoolClass, SchoolClassDocument } from './school-class.schema.js';
import { Level, LevelDocument } from '../levels/level.schema.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import { assertExists } from '../common/utils/assert-exists.js';
import { mapLeanDoc } from '../common/utils/paginate.js';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(SchoolClass.name)
    private classModel: Model<SchoolClassDocument>,
    @InjectModel(Level.name)
    private levelModel: Model<LevelDocument>,
  ) {}

  async findAll(levelId?: string) {
    const filter: Record<string, any> = {};
    if (levelId) {
      filter.level = new Types.ObjectId(levelId);
    }

    const classes = await this.classModel
      .find(filter)
      .populate('level', 'name')
      .lean()
      .exec();

    // Get distinct active students count per class via enrollments
    const studentsCounts = await this.classModel.db
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
          $group: {
            _id: { class: '$sub.schoolClass', student: '$student' },
          },
        },
        {
          $group: {
            _id: '$_id.class',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const studentsMap = new Map(
      studentsCounts.map((s) => [s._id.toString(), s.count]),
    );

    return classes.map((c: any) => {
      const mapped = mapLeanDoc(c);
      return {
        ...mapped,
        studentsCount: studentsMap.get(mapped.id) ?? 0,
      };
    });
  }

  async findOne(id: string) {
    const cls = await this.classModel
      .findById(id)
      .populate('level')
      .lean()
      .exec();
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    return mapLeanDoc(cls);
  }

  async create(dto: CreateClassDto) {
    await assertExists(this.levelModel, dto.levelId, 'Level');
    return this.classModel.create({
      level: new Types.ObjectId(dto.levelId),
      name: dto.name,
    });
  }

  async update(id: string, dto: UpdateClassDto) {
    if (dto.levelId) {
      await assertExists(this.levelModel, dto.levelId, 'Level');
    }
    const update: Record<string, any> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.levelId) update.level = new Types.ObjectId(dto.levelId);

    const cls = await this.classModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    return cls;
  }

  async remove(id: string) {
    const oid = new Types.ObjectId(id);
    const subjectCount = await this.classModel.db
      .collection('subjects')
      .countDocuments({ schoolClass: oid });
    if (subjectCount > 0) {
      throw new ConflictException('Class has subjects');
    }
    const cls = await this.classModel.findByIdAndDelete(id).exec();
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    return cls;
  }
}
