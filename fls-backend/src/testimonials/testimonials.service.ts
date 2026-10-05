import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Testimonial,
  TestimonialDocument,
} from './testimonial.schema.js';
import { Student, StudentDocument } from '../students/student.schema.js';
import { CreateParentTestimonialDto } from './dto/create-parent-testimonial.dto.js';
import { QueryTestimonialDto } from './dto/query-testimonial.dto.js';
import { ActivityService } from '../activity/activity.service.js';
import { paginate, mapLeanDoc } from '../common/utils/paginate.js';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name)
    private testimonialModel: Model<TestimonialDocument>,
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
    private activityService: ActivityService,
  ) {}

  async submitParentTestimonial(
    studentId: string,
    dto: CreateParentTestimonialDto,
  ) {
    const student = await this.studentModel.findById(studentId).lean().exec();
    if (!student) {
      throw new NotFoundException('Élève non trouvé');
    }

    // Use parent's explicitly mentioned name, NEVER put the student's name
    const authorName =
      dto.parentName && dto.parentName.trim().length > 0
        ? dto.parentName.trim()
        : 'Parent d\'élève';

    const testimonial = await this.testimonialModel.create({
      student: new Types.ObjectId(studentId),
      authorName,
      rating: dto.rating,
      message: dto.message,
      status: 'APPROVED',
      reviewedAt: new Date(),
    });

    await this.activityService.log(
      'TESTIMONIAL_SUBMITTED',
      'Nouvel avis publié',
      `${authorName} - ${dto.rating}/5`,
    );

    return mapLeanDoc(testimonial.toJSON());
  }

  async findByStudent(studentId: string) {
    const docs = await this.testimonialModel
      .find({ student: new Types.ObjectId(studentId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return docs.map((d: any) => mapLeanDoc(d));
  }

  async findAllAdmin(query: QueryTestimonialDto) {
    const filter: Record<string, any> = {};
    if (query.status) {
      filter.status = query.status;
    }

    return paginate(this.testimonialModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: -1 },
      populate: {
        path: 'student',
        select: 'firstName lastName schoolClass',
        populate: {
          path: 'schoolClass',
          select: 'name',
        },
      } as any,
    });
  }

  async getCounts() {
    const [pending, approved, rejected, total] = await Promise.all([
      this.testimonialModel.countDocuments({ status: 'PENDING' }),
      this.testimonialModel.countDocuments({ status: 'APPROVED' }),
      this.testimonialModel.countDocuments({ status: 'REJECTED' }),
      this.testimonialModel.countDocuments(),
    ]);

    return { pending, approved, rejected, total };
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const testimonial = await this.testimonialModel.findById(id).exec();
    if (!testimonial) {
      throw new NotFoundException('Avis non trouvé');
    }

    testimonial.status = status;
    testimonial.reviewedAt = new Date();
    await testimonial.save();

    if (status === 'APPROVED') {
      await this.activityService.log(
        'TESTIMONIAL_APPROVED',
        'Avis approuvé',
        `${testimonial.authorName} (${testimonial.rating}/5)`,
      );
    } else {
      await this.activityService.log(
        'TESTIMONIAL_REJECTED',
        'Avis refusé',
        `${testimonial.authorName} (${testimonial.rating}/5)`,
      );
    }

    return mapLeanDoc(testimonial.toJSON());
  }

  async remove(id: string) {
    const deleted = await this.testimonialModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Avis non trouvé');
    }
    return { deleted: true };
  }

  async findApproved(page: number = 1, limit: number = 6) {
    const safeLimit = Math.min(Math.max(limit, 1), 24);
    const filter = { status: 'APPROVED' };

    const result = await paginate(this.testimonialModel, filter, {
      page,
      limit: safeLimit,
      sort: { createdAt: -1 },
    });

    result.data = result.data.map((t: any) => ({
      id: t.id,
      authorName: t.authorName,
      rating: t.rating,
      message: t.message,
      createdAt: t.createdAt,
    })) as any;

    return result;
  }

  async getApprovedSummary() {
    const result = await this.testimonialModel.aggregate([
      { $match: { status: 'APPROVED' } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avg: { $avg: '$rating' },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return { count: 0, average: 0 };
    }

    return {
      count: result[0].count,
      average: Math.round(result[0].avg * 10) / 10,
    };
  }

  async getDashboardTestimonials(limit: number = 3) {
    const safeLimit = Math.min(Math.max(limit, 1), 10);
    const docs = await this.testimonialModel
      .find({ status: 'APPROVED' })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean()
      .exec();

    return docs.map((d: any) => ({
      id: d._id.toString(),
      authorName: d.authorName,
      rating: d.rating,
      message: d.message,
      createdAt: d.createdAt,
    }));
  }
}
