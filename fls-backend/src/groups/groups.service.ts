import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyGroup, StudyGroupDocument } from './study-group.schema.js';
import { Subject, SubjectDocument } from '../subjects/subject.schema.js';
import { Teacher, TeacherDocument } from '../teachers/teacher.schema.js';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/enrollment.schema.js';
import { Session, SessionDocument } from '../sessions/session.schema.js';
import {
  AbsenceRecord,
  AbsenceRecordDocument,
} from '../absences/absence-record.schema.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { assertExists } from '../common/utils/assert-exists.js';
import { paginate, mapLeanDoc } from '../common/utils/paginate.js';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(StudyGroup.name)
    private groupModel: Model<StudyGroupDocument>,
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
    @InjectModel(Teacher.name)
    private teacherModel: Model<TeacherDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Session.name)
    private sessionModel: Model<SessionDocument>,
    @InjectModel(AbsenceRecord.name)
    private absenceModel: Model<AbsenceRecordDocument>,
  ) {}

  async findAll(query: {
    subjectId?: string;
    teacherId?: string;
    classId?: string;
    isActive?: string;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, any> = {};

    if (query.subjectId) {
      filter.subject = new Types.ObjectId(query.subjectId);
    }
    if (query.teacherId) {
      filter.teacher = new Types.ObjectId(query.teacherId);
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    // classId filter: find subjects of that class, then filter by subject in
    if (query.classId) {
      const subjects = await this.subjectModel
        .find({ schoolClass: new Types.ObjectId(query.classId) })
        .select('_id')
        .lean()
        .exec();
      const subjectIds = subjects.map((s: any) => s._id);
      filter.subject = { $in: subjectIds };
    }

    const result = await paginate(this.groupModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'subject', populate: { path: 'schoolClass' } },
        { path: 'teacher' },
      ],
    });

    // Get studentsCount for all groups on this page
    const groupIds = result.data.map((g: any) => new Types.ObjectId(g.id));
    const enrollmentCounts = await this.enrollmentModel
      .aggregate([
        { $match: { group: { $in: groupIds }, isActive: true } },
        { $group: { _id: '$group', count: { $sum: 1 } } },
      ])
      .exec();

    const countMap = new Map(
      enrollmentCounts.map((e) => [e._id.toString(), e.count]),
    );

    result.data = result.data.map((g: any) => ({
      ...g,
      studentsCount: countMap.get(g.id) ?? 0,
    }));

    return result;
  }

  async findOne(id: string) {
    const group = await this.groupModel
      .findById(id)
      .populate([
        { path: 'subject', populate: { path: 'schoolClass' } },
        { path: 'teacher' },
      ])
      .exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Include enrolled students
    const enrollments = await this.enrollmentModel
      .find({ group: new Types.ObjectId(id), isActive: true })
      .populate('student')
      .lean()
      .exec();

    const students = enrollments.map((e: any) => ({
      enrollmentId: e._id.toString(),
      ...mapLeanDoc(e.student),
    }));

    return {
      ...group.toJSON(),
      students,
    };
  }

  async create(dto: CreateGroupDto) {
    await assertExists(this.subjectModel, dto.subjectId, 'Subject');
    await assertExists(this.teacherModel, dto.teacherId, 'Teacher');
    return this.groupModel.create({
      subject: new Types.ObjectId(dto.subjectId),
      teacher: new Types.ObjectId(dto.teacherId),
      name: dto.name ?? '',
      isActive: dto.isActive ?? true,
      studyTime: dto.studyTime ?? [],
    });
  }

  async update(id: string, dto: UpdateGroupDto) {
    if (dto.subjectId) {
      await assertExists(this.subjectModel, dto.subjectId, 'Subject');
    }
    if (dto.teacherId) {
      await assertExists(this.teacherModel, dto.teacherId, 'Teacher');
    }
    const update: Record<string, any> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.subjectId) update.subject = new Types.ObjectId(dto.subjectId);
    if (dto.teacherId) update.teacher = new Types.ObjectId(dto.teacherId);
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.studyTime !== undefined) update.studyTime = dto.studyTime;

    const group = await this.groupModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async remove(id: string) {
    const group = await this.groupModel.findById(id).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const oid = new Types.ObjectId(id);

    // Find session ids for this group
    const sessions = await this.sessionModel
      .find({ group: oid })
      .select('_id')
      .lean()
      .exec();
    const sessionIds = sessions.map((s: any) => s._id);

    // Delete absence records for those sessions
    if (sessionIds.length > 0) {
      await this.absenceModel
        .deleteMany({ session: { $in: sessionIds } })
        .exec();
    }

    // Delete sessions
    await this.sessionModel.deleteMany({ group: oid }).exec();

    // Delete enrollments
    await this.enrollmentModel.deleteMany({ group: oid }).exec();

    // Delete group
    await this.groupModel.findByIdAndDelete(id).exec();

    return { deleted: true };
  }

  async findStudents(id: string) {
    await assertExists(this.groupModel, id, 'Group');
    const enrollments = await this.enrollmentModel
      .find({ group: new Types.ObjectId(id), isActive: true })
      .populate('student')
      .lean()
      .exec();
    return enrollments.map((e: any) => ({
      enrollmentId: e._id.toString(),
      ...mapLeanDoc(e.student),
    }));
  }
}
