import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ParentAccount,
  ParentAccountDocument,
} from './parent-account.schema.js';
import { Student, StudentDocument } from '../students/student.schema.js';

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sanitizeUsername(firstName: string, lastName: string): string {
  const first = removeAccents(firstName.trim().toLowerCase()).replace(
    /[^a-z0-9]/g,
    '',
  );
  const last = removeAccents(lastName.trim().toLowerCase()).replace(
    /[^a-z0-9]/g,
    '',
  );
  const base = `${first}.${last}`;
  return base.length > 1 ? base : `parent.${Date.now() % 10000}`;
}

function generateRandomPassword(length = 8): string {
  const chars =
    '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

@Injectable()
export class ParentAccountsService {
  constructor(
    @InjectModel(ParentAccount.name)
    private parentAccountModel: Model<ParentAccountDocument>,
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
  ) {}

  async createForStudent(studentId: string) {
    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new NotFoundException('Élève introuvable');
    }

    const existing = await this.parentAccountModel
      .findOne({ student: new Types.ObjectId(studentId) })
      .exec();
    if (existing) {
      throw new ConflictException(
        'Un compte parent existe déjà pour cet élève',
      );
    }

    let username = sanitizeUsername(student.firstName, student.lastName);

    // Ensure username uniqueness
    let counter = 1;
    let candidate = username;
    while (await this.parentAccountModel.findOne({ username: candidate }).exec()) {
      counter++;
      candidate = `${username}${counter}`;
    }
    username = candidate;

    const password = generateRandomPassword(8);

    const account = await this.parentAccountModel.create({
      student: new Types.ObjectId(studentId),
      username,
      password,
    });

    return {
      id: account._id.toString(),
      username: account.username,
      password: account.password,
      studentId,
      createdAt: (account as any).createdAt,
    };
  }

  async findByStudent(studentId: string) {
    const account = await this.parentAccountModel
      .findOne({ student: new Types.ObjectId(studentId) })
      .exec();
    if (!account) {
      return null;
    }
    return {
      id: account._id.toString(),
      username: account.username,
      password: account.password,
      studentId: account.student.toString(),
      createdAt: (account as any).createdAt,
    };
  }

  async resetPassword(studentId: string) {
    const newPassword = generateRandomPassword(8);
    const account = await this.parentAccountModel
      .findOneAndUpdate(
        { student: new Types.ObjectId(studentId) },
        { password: newPassword },
        { new: true },
      )
      .exec();

    if (!account) {
      throw new NotFoundException('Compte parent introuvable');
    }

    return {
      id: account._id.toString(),
      username: account.username,
      password: account.password,
      studentId,
      createdAt: (account as any).createdAt,
    };
  }

  async removeByStudent(studentId: string) {
    const account = await this.parentAccountModel
      .findOneAndDelete({ student: new Types.ObjectId(studentId) })
      .exec();
    if (!account) {
      throw new NotFoundException('Compte parent introuvable');
    }
    return { deleted: true };
  }
}
