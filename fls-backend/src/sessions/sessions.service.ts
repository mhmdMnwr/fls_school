import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from './session.schema.js';
import {
  StudyGroup,
  StudyGroupDocument,
} from '../groups/study-group.schema.js';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/enrollment.schema.js';
import {
  AbsenceRecord,
  AbsenceRecordDocument,
} from '../absences/absence-record.schema.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { UpdateSessionDto } from './dto/update-session.dto.js';
import { assertExists } from '../common/utils/assert-exists.js';
import { paginate } from '../common/utils/paginate.js';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(StudyGroup.name) private groupModel: Model<StudyGroupDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(AbsenceRecord.name)
    private absenceModel: Model<AbsenceRecordDocument>,
  ) {}

  async findAll(query: {
    groupId?: string;
    from?: string;
    to?: string;
    isFreeTrial?: string;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, any> = {};
    if (query.groupId) filter.group = new Types.ObjectId(query.groupId);
    if (query.isFreeTrial !== undefined)
      filter.isFreeTrial = query.isFreeTrial === 'true';
    if (query.from || query.to) {
      filter.date = {};
      if (query.from)
        filter.date.$gte = new Date(query.from + 'T00:00:00.000Z');
      if (query.to) filter.date.$lte = new Date(query.to + 'T00:00:00.000Z');
    }

    return paginate(this.sessionModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { date: -1, startTime: -1 },
      populate: {
        path: 'group',
        populate: [
          { path: 'subject', populate: { path: 'schoolClass' } },
          { path: 'teacher' },
        ],
      } as any,
    });
  }

  async upcoming(limit: number = 5) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const sessions = await this.sessionModel
      .find({ date: { $gte: today } })
      .sort({ date: 1, startTime: 1 })
      .limit(limit)
      .populate({
        path: 'group',
        populate: [
          { path: 'subject', populate: { path: 'schoolClass' } },
          { path: 'teacher' },
        ],
      })
      .lean()
      .exec();

    return sessions.map((s: any) => ({
      id: s._id.toString(),
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      isFreeTrial: s.isFreeTrial,
      subjectName: s.group?.subject?.name ?? '',
      className: s.group?.subject?.schoolClass?.name ?? '',
      teacherName: s.group?.teacher
        ? `${s.group.teacher.firstName} ${s.group.teacher.lastName}`
        : '',
      timeRange: `${s.startTime} - ${s.endTime}`,
    }));
  }

  async findOne(id: string) {
    const session = await this.sessionModel
      .findById(id)
      .populate({
        path: 'group',
        populate: [
          { path: 'subject', populate: { path: 'schoolClass' } },
          { path: 'teacher' },
        ],
      })
      .exec();
    if (!session) throw new NotFoundException('Session not found');

    // Attendance list
    const attendance = await this.absenceModel
      .find({ session: new Types.ObjectId(id) })
      .populate('student')
      .lean()
      .exec();

    return {
      ...session.toJSON(),
      attendance: attendance.map((a: any) => ({
        id: a._id.toString(),
        student: a.student
          ? {
              id: a.student._id.toString(),
              firstName: a.student.firstName,
              lastName: a.student.lastName,
            }
          : null,
        isPresent: a.isPresent,
      })),
    };
  }

  async create(dto: CreateSessionDto) {
    const group = await this.groupModel.findById(dto.groupId).lean().exec();
    if (!group) throw new NotFoundException('Group not found');

    const dateStr = dto.date || new Date().toISOString().slice(0, 10);
    let startTime = dto.startTime;
    let endTime = dto.endTime;

    if (!startTime || !endTime) {
      if (group.studyTime && group.studyTime.length > 0) {
        startTime = startTime || group.studyTime[0].startTime;
        endTime = endTime || group.studyTime[0].endTime;
      }
    }

    startTime = startTime || '09:00';
    endTime = endTime || '10:30';

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const session = await this.sessionModel.create({
      group: new Types.ObjectId(dto.groupId),
      date: new Date(dateStr + 'T00:00:00.000Z'),
      startTime,
      endTime,
      isFreeTrial: dto.isFreeTrial ?? false,
    });

    // Auto-create absence records for all active enrollments
    const enrollments = await this.enrollmentModel
      .find({ group: new Types.ObjectId(dto.groupId), isActive: true })
      .select('student')
      .lean()
      .exec();

    if (enrollments.length > 0) {
      const records = enrollments.map((e: any) => ({
        session: session._id,
        student: e.student,
        isPresent: true,
      }));
      await this.absenceModel.insertMany(records);
    }

    return session;
  }

  async update(id: string, dto: UpdateSessionDto) {
    if (dto.groupId) {
      await assertExists(this.groupModel, dto.groupId, 'Group');
    }
    if (dto.startTime && dto.endTime && dto.endTime <= dto.startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const update: Record<string, any> = {};
    if (dto.groupId) update.group = new Types.ObjectId(dto.groupId);
    if (dto.date) update.date = new Date(dto.date + 'T00:00:00.000Z');
    if (dto.startTime) update.startTime = dto.startTime;
    if (dto.endTime) update.endTime = dto.endTime;
    if (dto.isFreeTrial !== undefined) update.isFreeTrial = dto.isFreeTrial;

    const session = await this.sessionModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async remove(id: string) {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) throw new NotFoundException('Session not found');

    await this.absenceModel
      .deleteMany({ session: new Types.ObjectId(id) })
      .exec();
    await this.sessionModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
