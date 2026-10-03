import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from '../../src/enrollments/enrollments.service.js';
import { Types } from 'mongoose';

describe('EnrollmentsService - Class Matching Rule', () => {
  let service: EnrollmentsService;
  let mockEnrollmentModel: any;
  let mockStudentModel: any;
  let mockGroupModel: any;
  let mockSubjectModel: any;

  const classA = new Types.ObjectId();
  const classB = new Types.ObjectId();
  const studentId = new Types.ObjectId().toString();
  const groupId = new Types.ObjectId().toString();
  const subjectId = new Types.ObjectId();

  beforeEach(() => {
    mockEnrollmentModel = {
      create: jest
        .fn()
        .mockImplementation((dto) => Promise.resolve({ id: 'enr1', ...dto })),
    };
    mockStudentModel = {
      findById: jest.fn(),
    };
    mockGroupModel = {
      findById: jest.fn(),
    };
    mockSubjectModel = {
      findById: jest.fn(),
    };

    service = new EnrollmentsService(
      mockEnrollmentModel,
      mockStudentModel,
      mockGroupModel,
      mockSubjectModel,
    );
  });

  it('should throw BadRequestException if group subject does not belong to student class', async () => {
    mockStudentModel.findById.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve({ _id: studentId, schoolClass: classA }),
      }),
    });
    mockGroupModel.findById.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve({ _id: groupId, subject: subjectId }),
      }),
    });
    mockSubjectModel.findById.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve({ _id: subjectId, schoolClass: classB }),
      }),
    });

    await expect(service.create({ studentId, groupId })).rejects.toThrow(
      new BadRequestException("Subject does not belong to the student's class"),
    );
  });

  it('should allow enrollment when group subject belongs to student class', async () => {
    mockStudentModel.findById.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve({ _id: studentId, schoolClass: classA }),
      }),
    });
    mockGroupModel.findById.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve({ _id: groupId, subject: subjectId }),
      }),
    });
    mockSubjectModel.findById.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve({ _id: subjectId, schoolClass: classA }),
      }),
    });

    const result = await service.create({ studentId, groupId });
    expect(result).toBeDefined();
    expect(mockEnrollmentModel.create).toHaveBeenCalledWith({
      student: expect.any(Types.ObjectId),
      group: expect.any(Types.ObjectId),
    });
  });
});
