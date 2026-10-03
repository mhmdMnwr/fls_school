import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema.js';
import { Student, StudentDocument } from '../students/student.schema.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { assertExists } from '../common/utils/assert-exists.js';
import { paginate } from '../common/utils/paginate.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async findAll(query: {
    studentId?: string;
    from?: string;
    to?: string;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, any> = {};
    if (query.studentId) filter.student = new Types.ObjectId(query.studentId);
    if (query.from || query.to) {
      filter.paidOn = {};
      if (query.from)
        filter.paidOn.$gte = new Date(query.from + 'T00:00:00.000Z');
      if (query.to) filter.paidOn.$lte = new Date(query.to + 'T00:00:00.000Z');
    }

    return paginate(this.paymentModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { paidOn: -1 },
      populate: { path: 'student', select: 'firstName lastName' } as any,
    });
  }

  async create(dto: CreatePaymentDto) {
    await assertExists(this.studentModel, dto.studentId, 'Student');
    const amount = Math.round(dto.amount * 100) / 100;
    return this.paymentModel.create({
      student: new Types.ObjectId(dto.studentId),
      paidOn: new Date(dto.paidOn + 'T00:00:00.000Z'),
      amount,
      description: dto.description ?? '',
    });
  }

  async update(id: string, dto: UpdatePaymentDto) {
    if (dto.studentId) {
      await assertExists(this.studentModel, dto.studentId, 'Student');
    }
    const update: Record<string, any> = {};
    if (dto.studentId) update.student = new Types.ObjectId(dto.studentId);
    if (dto.paidOn) update.paidOn = new Date(dto.paidOn + 'T00:00:00.000Z');
    if (dto.amount !== undefined)
      update.amount = Math.round(dto.amount * 100) / 100;
    if (dto.description !== undefined) update.description = dto.description;

    const payment = await this.paymentModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async remove(id: string) {
    const payment = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return { deleted: true };
  }

  async getStudentSummary(studentId: string) {
    const result = await this.paymentModel.aggregate([
      { $match: { student: new Types.ObjectId(studentId) } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amount' },
          count: { $sum: 1 },
          lastPaymentDate: { $max: '$paidOn' },
        },
      },
    ]);

    if (result.length === 0) {
      return { totalPaid: 0, count: 0, lastPaymentDate: null };
    }

    return {
      totalPaid: result[0].totalPaid,
      count: result[0].count,
      lastPaymentDate: result[0].lastPaymentDate,
    };
  }
}
