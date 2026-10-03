import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './enrollment.schema.js';
import { Student, StudentDocument } from '../students/student.schema.js';
import {
  StudyGroup,
  StudyGroupDocument,
} from '../groups/study-group.schema.js';
import { Subject, SubjectDocument } from '../subjects/subject.schema.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { mapLeanDoc } from '../common/utils/paginate.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
    @InjectModel(StudyGroup.name)
    private groupModel: Model<StudyGroupDocument>,
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
  ) {}

  async create(dto: CreateEnrollmentDto) {
    const student = await this.studentModel
      .findById(dto.studentId)
      .lean()
      .exec();
    if (!student) throw new NotFoundException('Student not found');

    const group = await this.groupModel.findById(dto.groupId).lean().exec();
    if (!group) throw new NotFoundException('Group not found');

    return this.enrollmentModel.create({
      student: new Types.ObjectId(dto.studentId),
      group: new Types.ObjectId(dto.groupId),
    });
  }

  async findAll(query: { groupId?: string; studentId?: string }) {
    const filter: Record<string, any> = {};
    if (query.groupId) filter.group = new Types.ObjectId(query.groupId);
    if (query.studentId) filter.student = new Types.ObjectId(query.studentId);

    const docs = await this.enrollmentModel
      .find(filter)
      .populate('student')
      .populate({
        path: 'group',
        populate: [{ path: 'subject' }, { path: 'teacher' }],
      })
      .lean()
      .exec();

    return docs.map((d: any) => mapLeanDoc(d));
  }

  async update(id: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.enrollmentModel
      .findByIdAndUpdate(id, { isActive: dto.isActive }, { new: true })
      .exec();
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async remove(id: string) {
    const enrollment = await this.enrollmentModel.findByIdAndDelete(id).exec();
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return { deleted: true };
  }

  async findByStudent(studentId: string) {
    return this.findAll({ studentId });
  }

  async findByGroup(groupId: string) {
    const enrollments = await this.enrollmentModel
      .find({ group: new Types.ObjectId(groupId), isActive: true })
      .populate('student')
      .lean()
      .exec();
    return enrollments.map((e: any) => mapLeanDoc(e));
  }
}
