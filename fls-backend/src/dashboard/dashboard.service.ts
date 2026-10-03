import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../students/student.schema.js';
import { Level, LevelDocument } from '../levels/level.schema.js';
import { Subject, SubjectDocument } from '../subjects/subject.schema.js';
import { Teacher, TeacherDocument } from '../teachers/teacher.schema.js';
import { Session, SessionDocument } from '../sessions/session.schema.js';
import {
  ActivityLog,
  ActivityLogDocument,
} from '../activity/activity-log.schema.js';
import { mapLeanDoc } from '../common/utils/paginate.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Level.name) private levelModel: Model<LevelDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(ActivityLog.name)
    private activityModel: Model<ActivityLogDocument>,
  ) {}

  async getStats() {
    const now = new Date();
    const firstOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const [
      totalStudents,
      newThisMonth,
      totalLevels,
      totalSubjects,
      totalTeachers,
    ] = await Promise.all([
      this.studentModel.countDocuments({ isActive: true }),
      this.studentModel.countDocuments({
        isActive: true,
        createdAt: { $gte: firstOfMonth },
      }),
      this.levelModel.countDocuments(),
      this.subjectModel.countDocuments(),
      this.teacherModel.countDocuments({ isActive: true }),
    ]);

    return {
      students: { total: totalStudents, newThisMonth },
      levels: { total: totalLevels },
      subjects: { total: totalSubjects },
      teachers: { total: totalTeachers },
    };
  }

  async getEnrollmentEvolution(year?: number) {
    const currentYear = year ?? new Date().getUTCFullYear();
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
    const now = new Date();
    const currentMonth =
      now.getUTCFullYear() === currentYear ? now.getUTCMonth() + 1 : 12;

    // Count students created before the start of the year
    const beforeYearCount = await this.studentModel.countDocuments({
      createdAt: { $lt: startOfYear },
    });

    // Group by month for the year
    const monthlyData = await this.studentModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lt: new Date(Date.UTC(currentYear + 1, 0, 1)),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthMap = new Map(monthlyData.map((m) => [m._id, m.count]));

    const result: { month: number; total: number }[] = [];
    let cumulative = beforeYearCount;

    for (let m = 1; m <= currentMonth; m++) {
      cumulative += monthMap.get(m) ?? 0;
      result.push({ month: m, total: cumulative });
    }

    return result;
  }

  async getStudentsByLevel() {
    const pipeline = await this.studentModel.db
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
          $lookup: {
            from: 'levels',
            localField: 'cls.level',
            foreignField: '_id',
            as: 'lvl',
          },
        },
        { $unwind: '$lvl' },
        {
          $group: {
            _id: { levelId: '$lvl._id', student: '$student' },
            level: { $first: '$lvl.name' },
          },
        },
        {
          $group: {
            _id: '$_id.levelId',
            level: { $first: '$level' },
            count: { $sum: 1 },
          },
        },
        { $sort: { level: 1 } },
      ])
      .toArray();

    const totalStudents = pipeline.reduce((sum, item) => sum + item.count, 0);

    return pipeline.map((item) => ({
      levelId: item._id.toString(),
      level: item.level,
      count: item.count,
      percentage:
        totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0,
    }));
  }

  async getRecentStudents(limit: number = 5) {
    const students = await this.studentModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    const studentIds = students.map((s: any) => s._id);
    const enrollments = await this.studentModel.db
      .collection('enrollments')
      .aggregate([
        { $match: { student: { $in: studentIds }, isActive: true } },
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
          $lookup: {
            from: 'levels',
            localField: 'cls.level',
            foreignField: '_id',
            as: 'lvl',
          },
        },
        { $unwind: '$lvl' },
      ])
      .toArray();

    const enrollMap = new Map<string, any[]>();
    for (const e of enrollments) {
      const sId = e.student.toString();
      if (!enrollMap.has(sId)) enrollMap.set(sId, []);
      enrollMap.get(sId)!.push(e);
    }

    return students.map((s: any) => {
      const studentEnrolls = enrollMap.get(s._id.toString()) || [];
      const firstEnroll = studentEnrolls[0];
      const className = firstEnroll?.cls?.name ?? '';
      const levelName = firstEnroll?.lvl?.name ?? '';

      return {
        id: s._id.toString(),
        fullName: `${s.firstName} ${s.lastName}`,
        className,
        levelName,
        createdAt: s.createdAt,
        isActive: s.isActive,
      };
    });
  }

  async getUpcomingSessions(limit: number = 4) {
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

  async getRecentActivities(limit: number = 5) {
    const activities = await this.activityModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return activities.map((a: any) => mapLeanDoc(a));
  }
}
