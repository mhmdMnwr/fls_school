import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Teacher, TeacherDocument } from './teacher.schema.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { paginate, escapeRegex } from '../common/utils/paginate.js';
import { ActivityService } from '../activity/activity.service.js';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    private activityService: ActivityService,
  ) {}

  async findAll(query: {
    search?: string;
    isActive?: string;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, any> = {};
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }
    if (query.search) {
      const escaped = escapeRegex(query.search);
      const regex = { $regex: escaped, $options: 'i' };
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }
    return paginate(this.teacherModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { lastName: 1, firstName: 1 },
    });
  }

  async findOne(id: string) {
    const teacher = await this.teacherModel.findById(id).exec();
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Include teacher's groups
    const groups = await this.teacherModel.db
      .collection('studygroups')
      .aggregate([
        { $match: { teacher: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subject',
            foreignField: '_id',
            as: 'subject',
          },
        },
        { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'schoolclasses',
            localField: 'subject.schoolClass',
            foreignField: '_id',
            as: 'class',
          },
        },
        { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    const mappedGroups = groups.map((g) => ({
      id: g._id.toString(),
      name: g.name,
      isActive: g.isActive,
      subject: g.subject
        ? { id: g.subject._id.toString(), name: g.subject.name }
        : null,
      class: g.class
        ? { id: g.class._id.toString(), name: g.class.name }
        : null,
    }));

    return {
      ...teacher.toJSON(),
      groups: mappedGroups,
    };
  }

  async create(dto: CreateTeacherDto) {
    const teacher = await this.teacherModel.create(dto);
    await this.activityService.log(
      'TEACHER_CREATED',
      'New teacher created',
      `${dto.firstName} ${dto.lastName}`,
    );
    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.teacherModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher;
  }

  async remove(id: string) {
    const groupCount = await this.teacherModel.db
      .collection('studygroups')
      .countDocuments({ teacher: new Types.ObjectId(id) });
    if (groupCount > 0) {
      throw new ConflictException(
        'Teacher has groups. Consider setting isActive to false instead.',
      );
    }
    const teacher = await this.teacherModel.findByIdAndDelete(id).exec();
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher;
  }
}
