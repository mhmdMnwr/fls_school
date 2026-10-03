import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AbsenceRecord,
  AbsenceRecordDocument,
} from './absence-record.schema.js';
import { Session, SessionDocument } from '../sessions/session.schema.js';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/enrollment.schema.js';
import { UpdateAbsencesDto } from './dto/update-absences.dto.js';

@Injectable()
export class AbsencesService {
  constructor(
    @InjectModel(AbsenceRecord.name)
    private absenceModel: Model<AbsenceRecordDocument>,
    @InjectModel(Session.name)
    private sessionModel: Model<SessionDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async updateSessionAbsences(sessionId: string, dto: UpdateAbsencesDto) {
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session) throw new NotFoundException('Session not found');

    // Validate all students are enrolled in the session's group
    const enrollments = await this.enrollmentModel
      .find({ group: session.group })
      .select('student')
      .lean()
      .exec();
    const enrolledStudentIds = new Set(
      enrollments.map((e: any) => e.student.toString()),
    );

    for (const record of dto.records) {
      if (!enrolledStudentIds.has(record.studentId)) {
        throw new BadRequestException(
          `Student ${record.studentId} is not enrolled in this group`,
        );
      }
    }

    // BulkWrite with upserts
    const ops = dto.records.map((record) => ({
      updateOne: {
        filter: {
          session: new Types.ObjectId(sessionId),
          student: new Types.ObjectId(record.studentId),
        },
        update: {
          $set: {
            isPresent: record.isPresent,
            session: new Types.ObjectId(sessionId),
            student: new Types.ObjectId(record.studentId),
          },
        },
        upsert: true,
      },
    }));

    await this.absenceModel.bulkWrite(ops);

    return { updated: dto.records.length };
  }

  async getStudentHistory(studentId: string, page: number, limit: number) {
    const studentOid = new Types.ObjectId(studentId);
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      this.absenceModel.countDocuments({ student: studentOid }),
      this.absenceModel.aggregate([
        { $match: { student: studentOid } },
        {
          $lookup: {
            from: 'sessions',
            localField: 'session',
            foreignField: '_id',
            as: 'session',
          },
        },
        { $unwind: '$session' },
        {
          $lookup: {
            from: 'studygroups',
            localField: 'session.group',
            foreignField: '_id',
            as: 'group',
          },
        },
        { $unwind: { path: '$group', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'subjects',
            localField: 'group.subject',
            foreignField: '_id',
            as: 'subject',
          },
        },
        { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
        { $sort: { 'session.date': -1, 'session.startTime': -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
    ]);

    const data = records.map((r: any) => ({
      id: r._id.toString(),
      isPresent: r.isPresent,
      sessionDate: r.session?.date,
      startTime: r.session?.startTime,
      endTime: r.session?.endTime,
      isFreeTrial: r.session?.isFreeTrial,
      subjectName: r.subject?.name ?? '',
      groupName: r.group?.name ?? '',
      session: {
        id: r.session?._id?.toString(),
        date: r.session?.date,
        startTime: r.session?.startTime,
        endTime: r.session?.endTime,
        isFreeTrial: r.session?.isFreeTrial,
        group: {
          name: r.group?.name,
          subject: { name: r.subject?.name },
        },
      },
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getStudentSummary(studentId: string) {
    const filter = { student: new Types.ObjectId(studentId) };
    const total = await this.absenceModel.countDocuments(filter);

    if (total === 0) {
      return { total: 0, present: 0, absent: 0, absenceRate: 0 };
    }

    const present = await this.absenceModel.countDocuments({
      ...filter,
      isPresent: true,
    });
    const absent = total - present;
    const absenceRate = Math.round((absent / total) * 1000) / 10;

    return { total, present, absent, absenceRate };
  }
}
