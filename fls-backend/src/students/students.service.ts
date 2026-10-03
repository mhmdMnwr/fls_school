import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './student.schema.js';
import {
  SchoolClass,
  SchoolClassDocument,
} from '../classes/school-class.schema.js';
import { Level, LevelDocument } from '../levels/level.schema.js';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/enrollment.schema.js';
import {
  AbsenceRecord,
  AbsenceRecordDocument,
} from '../absences/absence-record.schema.js';
import { Payment, PaymentDocument } from '../payments/payment.schema.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { assertExists } from '../common/utils/assert-exists.js';
import { paginate, escapeRegex, mapLeanDoc } from '../common/utils/paginate.js';
import { ActivityService } from '../activity/activity.service.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(SchoolClass.name)
    private classModel: Model<SchoolClassDocument>,
    @InjectModel(Level.name) private levelModel: Model<LevelDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(AbsenceRecord.name)
    private absenceModel: Model<AbsenceRecordDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private activityService: ActivityService,
  ) {}

  async findAll(query: {
    search?: string;
    classId?: string;
    levelId?: string;
    isActive?: string;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, any> = {};

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }
    if (query.classId) {
      const subjects = await this.classModel.db
        .collection('subjects')
        .find({ schoolClass: new Types.ObjectId(query.classId) })
        .project({ _id: 1 })
        .toArray();
      const groups = await this.classModel.db
        .collection('studygroups')
        .find({ subject: { $in: subjects.map((s) => s._id) } })
        .project({ _id: 1 })
        .toArray();
      const enrollments = await this.enrollmentModel
        .find({ group: { $in: groups.map((g) => g._id) }, isActive: true })
        .select('student')
        .lean()
        .exec();
      const studentIds = enrollments.map((e: any) => e.student);
      filter._id = { $in: studentIds };
    }
    if (query.levelId) {
      const classes = await this.classModel
        .find({ level: new Types.ObjectId(query.levelId) })
        .select('_id')
        .lean()
        .exec();
      const subjects = await this.classModel.db
        .collection('subjects')
        .find({ schoolClass: { $in: classes.map((c: any) => c._id) } })
        .project({ _id: 1 })
        .toArray();
      const groups = await this.classModel.db
        .collection('studygroups')
        .find({ subject: { $in: subjects.map((s) => s._id) } })
        .project({ _id: 1 })
        .toArray();
      const enrollments = await this.enrollmentModel
        .find({ group: { $in: groups.map((g) => g._id) }, isActive: true })
        .select('student')
        .lean()
        .exec();
      const studentIds = enrollments.map((e: any) => e.student);
      filter._id = { $in: studentIds };
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

    const result = await paginate(this.studentModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: -1 },
    });

    const studentIds = result.data.map((s: any) => new Types.ObjectId(s.id));
    const enrollCounts = await this.enrollmentModel.aggregate([
      { $match: { student: { $in: studentIds }, isActive: true } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      enrollCounts.map((e: any) => [e._id.toString(), e.count]),
    );

    result.data = result.data.map((s: any) => ({
      ...s,
      groupsCount: countMap.get(s.id) ?? 0,
    }));

    return result;
  }

  async findOne(id: string) {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Active enrollments
    const enrollments = await this.enrollmentModel
      .find({ student: new Types.ObjectId(id), isActive: true })
      .populate({
        path: 'group',
        populate: [
          { path: 'subject', populate: { path: 'schoolClass' } },
          { path: 'teacher' },
        ],
      })
      .lean()
      .exec();

    // Total paid
    const paymentAgg = await this.paymentModel.aggregate([
      { $match: { student: new Types.ObjectId(id) } },
      { $group: { _id: null, totalPaid: { $sum: '$amount' } } },
    ]);
    const totalPaid = paymentAgg.length > 0 ? paymentAgg[0].totalPaid : 0;

    return {
      ...student.toJSON(),
      enrollments: enrollments.map((e: any) => mapLeanDoc(e)),
      totalPaid,
    };
  }

  async create(dto: CreateStudentDto) {
    const student = await this.studentModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      birthDate: new Date(dto.birthDate + 'T00:00:00.000Z'),
      phone: dto.phone,
      email: dto.email,
      isActive: dto.isActive ?? true,
    });
    await this.activityService.log(
      'STUDENT_CREATED',
      'New student registered',
      `${dto.firstName} ${dto.lastName}`,
    );
    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    const update: Record<string, any> = {};
    if (dto.firstName !== undefined) update.firstName = dto.firstName;
    if (dto.lastName !== undefined) update.lastName = dto.lastName;
    if (dto.birthDate !== undefined)
      update.birthDate = new Date(dto.birthDate + 'T00:00:00.000Z');
    if (dto.phone !== undefined) update.phone = dto.phone;
    if (dto.email !== undefined) update.email = dto.email;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;

    const student = await this.studentModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async remove(id: string) {
    const oid = new Types.ObjectId(id);
    const paymentCount = await this.paymentModel.countDocuments({
      student: oid,
    });
    if (paymentCount > 0) {
      throw new ConflictException(
        'Student has payments. Consider deactivating instead.',
      );
    }

    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Delete enrollments and absence records
    await this.absenceModel.deleteMany({ student: oid }).exec();
    await this.enrollmentModel.deleteMany({ student: oid }).exec();
    await this.studentModel.findByIdAndDelete(id).exec();

    return { deleted: true };
  }

  async findEnrollments(id: string) {
    await assertExists(this.studentModel, id, 'Student');
    const enrollments = await this.enrollmentModel
      .find({ student: new Types.ObjectId(id) })
      .populate({
        path: 'group',
        populate: [
          { path: 'subject', populate: { path: 'schoolClass' } },
          { path: 'teacher' },
        ],
      })
      .lean()
      .exec();
    return enrollments.map((e: any) => mapLeanDoc(e));
  }
}
