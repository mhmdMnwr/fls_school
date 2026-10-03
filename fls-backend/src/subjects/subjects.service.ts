import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject, SubjectDocument } from './subject.schema.js';
import {
  SchoolClass,
  SchoolClassDocument,
} from '../classes/school-class.schema.js';
import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectDto } from './dto/update-subject.dto.js';
import { assertExists } from '../common/utils/assert-exists.js';
import { paginate, escapeRegex } from '../common/utils/paginate.js';
import { ActivityService } from '../activity/activity.service.js';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
    @InjectModel(SchoolClass.name)
    private classModel: Model<SchoolClassDocument>,
    private activityService: ActivityService,
  ) {}

  async findAll(query: {
    classId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, any> = {};
    if (query.classId) {
      filter.schoolClass = new Types.ObjectId(query.classId);
    }
    if (query.search) {
      const escaped = escapeRegex(query.search);
      filter.name = { $regex: escaped, $options: 'i' };
    }
    return paginate(this.subjectModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { name: 1 },
      populate: { path: 'schoolClass', populate: { path: 'level' } } as any,
    });
  }

  async findOne(id: string) {
    const subject = await this.subjectModel
      .findById(id)
      .populate({ path: 'schoolClass', populate: { path: 'level' } })
      .exec();
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }

  async create(dto: CreateSubjectDto) {
    await assertExists(this.classModel, dto.schoolClassId, 'Class');
    const subject = await this.subjectModel.create({
      schoolClass: new Types.ObjectId(dto.schoolClassId),
      name: dto.name,
    });
    await this.activityService.log(
      'SUBJECT_CREATED',
      'New subject created',
      dto.name,
    );
    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    if (dto.schoolClassId) {
      await assertExists(this.classModel, dto.schoolClassId, 'Class');
    }
    const update: Record<string, any> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.schoolClassId)
      update.schoolClass = new Types.ObjectId(dto.schoolClassId);

    const subject = await this.subjectModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    await this.activityService.log(
      'SUBJECT_UPDATED',
      'Subject updated',
      subject.name,
    );
    return subject;
  }

  async remove(id: string) {
    const oid = new Types.ObjectId(id);
    const groupCount = await this.subjectModel.db
      .collection('studygroups')
      .countDocuments({ subject: oid });
    if (groupCount > 0) {
      throw new ConflictException('Subject has groups');
    }
    const subject = await this.subjectModel.findByIdAndDelete(id).exec();
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }
}
