import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
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
    origin?: string;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, any> = {};

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }
    if (query.origin) {
      filter.origin = query.origin;
    }
    if (query.classId) {
      filter.schoolClass = new Types.ObjectId(query.classId);
    }
    if (query.levelId) {
      const classes = await this.classModel
        .find({ level: new Types.ObjectId(query.levelId) })
        .select('_id')
        .lean()
        .exec();
      filter.schoolClass = { $in: classes.map((c: any) => c._id) };
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
      populate: { path: 'schoolClass', populate: { path: 'level' } } as any,
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
      schoolClass: s.schoolClass ?? null,
      groupsCount: countMap.get(s.id) ?? 0,
    }));

    return result;
  }

  async findOne(id: string) {
    const student = await this.studentModel
      .findById(id)
      .populate({ path: 'schoolClass', populate: { path: 'level' } })
      .exec();
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
      schoolClass: student.schoolClass ?? null,
      enrollments: enrollments.map((e: any) => mapLeanDoc(e)),
      totalPaid,
    };
  }

  async create(dto: CreateStudentDto) {
    if (dto.schoolClassId) {
      await assertExists(this.classModel, dto.schoolClassId, 'Class');
    }
    const isActive = dto.isActive ?? false;
    const schoolClass = dto.schoolClassId
      ? new Types.ObjectId(dto.schoolClassId)
      : null;

    const student = await this.studentModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      birthDate: new Date(dto.birthDate + 'T00:00:00.000Z'),
      gender: dto.gender,
      phone: dto.phone,
      email: dto.email,
      schoolClass: schoolClass ?? undefined,
      isActive,
      origin: 'ADMIN',
    });

    await this.activityService.log(
      'STUDENT_CREATED',
      'New student registered',
      `${dto.firstName} ${dto.lastName}`,
    );
    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (dto.schoolClassId !== undefined && dto.schoolClassId) {
      await assertExists(this.classModel, dto.schoolClassId, 'Class');
    }

    const update: Record<string, any> = {};

    if (dto.firstName !== undefined) update.firstName = dto.firstName;
    if (dto.lastName !== undefined) update.lastName = dto.lastName;
    if (dto.birthDate !== undefined)
      update.birthDate = new Date(dto.birthDate + 'T00:00:00.000Z');
    if (dto.gender !== undefined) update.gender = dto.gender;
    if (dto.phone !== undefined) update.phone = dto.phone;
    if (dto.email !== undefined) update.email = dto.email;
    if (dto.schoolClassId !== undefined) {
      update.schoolClass = dto.schoolClassId
        ? new Types.ObjectId(dto.schoolClassId)
        : null;
    }
    if (dto.isActive !== undefined) update.isActive = dto.isActive;

    const updated = await this.studentModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate({ path: 'schoolClass', populate: { path: 'level' } })
      .exec();

    return updated;
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
