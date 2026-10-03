import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  ParentAccount,
  ParentAccountDocument,
} from '../parent-accounts/parent-account.schema.js';
import { Student, StudentDocument } from '../students/student.schema.js';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/enrollment.schema.js';
import {
  AbsenceRecord,
  AbsenceRecordDocument,
} from '../absences/absence-record.schema.js';
import { Payment, PaymentDocument } from '../payments/payment.schema.js';

const WEEKDAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

@Injectable()
export class ParentPortalService {
  constructor(
    @InjectModel(ParentAccount.name)
    private parentAccountModel: Model<ParentAccountDocument>,
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(AbsenceRecord.name)
    private absenceModel: Model<AbsenceRecordDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const account = await this.parentAccountModel
      .findOne({ username: username.toLowerCase().trim() })
      .populate('student')
      .exec();

    if (!account || account.password !== password) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const student = account.student as any;
    if (!student) {
      throw new NotFoundException('Élève associé introuvable');
    }

    const payload = {
      sub: account._id.toString(),
      studentId: student._id ? student._id.toString() : student.toString(),
      role: 'parent',
      username: account.username,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      student: {
        id: student._id ? student._id.toString() : student.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
      },
    };
  }

  async getProfile(studentId: string) {
    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new NotFoundException('Élève introuvable');
    }

    const enrollments = await this.enrollmentModel
      .find({ student: new Types.ObjectId(studentId), isActive: true })
      .populate({
        path: 'group',
        populate: [
          { path: 'subject', populate: { path: 'schoolClass' } },
          { path: 'teacher' },
        ],
      })
      .lean()
      .exec();

    return {
      id: student._id.toString(),
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
      phone: student.phone,
      email: student.email,
      isActive: student.isActive,
      groups: enrollments.map((e: any) => {
        const g = e.group;
        return {
          id: g._id.toString(),
          name: g.name || 'Principal',
          subjectName: g.subject?.name ?? '',
          className: g.subject?.schoolClass?.name ?? '',
          teacherName: g.teacher
            ? `${g.teacher.firstName} ${g.teacher.lastName}`
            : '',
          studyTime: g.studyTime ?? [],
        };
      }),
    };
  }

  async getTimetable(studentId: string) {
    const enrollments = await this.enrollmentModel
      .find({ student: new Types.ObjectId(studentId), isActive: true })
      .populate({
        path: 'group',
        populate: [
          { path: 'subject', populate: { path: 'schoolClass' } },
          { path: 'teacher' },
        ],
      })
      .lean()
      .exec();

    const timetable: Record<string, any[]> = {};
    for (const day of WEEKDAYS) {
      timetable[day] = [];
    }

    for (const e of enrollments as any[]) {
      const g = e.group;
      if (!g || !g.isActive || !Array.isArray(g.studyTime)) continue;

      for (const slot of g.studyTime) {
        if (!slot.weekday || !slot.startTime || !slot.endTime) continue;
        const rawDay = slot.weekday.trim().toLowerCase();
        const day = rawDay.charAt(0).toUpperCase() + rawDay.slice(1);
        const entry = {
          weekday: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subjectName: g.subject?.name ?? '',
          className: g.subject?.schoolClass?.name ?? '',
          teacherName: g.teacher
            ? `${g.teacher.firstName} ${g.teacher.lastName}`
            : '',
          groupName: g.name || 'Principal',
        };

        if (timetable[day]) {
          timetable[day].push(entry);
        } else {
          timetable[day] = [entry];
        }
      }
    }

    // Sort slots by startTime inside each day
    for (const day of Object.keys(timetable)) {
      timetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return timetable;
  }

  async getAttendance(studentId: string, page = 1, limit = 10) {
    const studentOid = new Types.ObjectId(studentId);
    const skip = (page - 1) * limit;

    const [total, records, summaryAgg] = await Promise.all([
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
      this.absenceModel.aggregate([
        { $match: { student: studentOid } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$isPresent', true] }, 1, 0] },
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$isPresent', false] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summary =
      summaryAgg.length > 0
        ? {
            total: summaryAgg[0].total,
            present: summaryAgg[0].present,
            absent: summaryAgg[0].absent,
            absenceRate:
              summaryAgg[0].total > 0
                ? Math.round(
                    (summaryAgg[0].absent / summaryAgg[0].total) * 1000,
                  ) / 10
                : 0,
          }
        : { total: 0, present: 0, absent: 0, absenceRate: 0 };

    const data = records.map((r: any) => ({
      id: r._id.toString(),
      isPresent: r.isPresent,
      sessionDate: r.session?.date,
      startTime: r.session?.startTime,
      endTime: r.session?.endTime,
      isFreeTrial: Boolean(r.session?.isFreeTrial),
      subjectName: r.subject?.name ?? '',
      groupName: r.group?.name ?? '',
    }));

    return {
      data,
      summary,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getPayments(studentId: string) {
    const studentOid = new Types.ObjectId(studentId);
    const payments = await this.paymentModel
      .find({ student: studentOid })
      .sort({ paidOn: -1 })
      .lean()
      .exec();

    const totalPaid = payments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0,
    );

    return {
      totalPaid,
      count: payments.length,
      payments: payments.map((p: any) => ({
        id: p._id.toString(),
        paidOn: p.paidOn,
        amount: p.amount,
        description: p.description ?? '',
      })),
    };
  }
}
