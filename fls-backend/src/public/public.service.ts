import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Level, LevelDocument } from '../levels/level.schema.js';
import {
  SchoolClass,
  SchoolClassDocument,
} from '../classes/school-class.schema.js';
import { Subject, SubjectDocument } from '../subjects/subject.schema.js';
import { Teacher, TeacherDocument } from '../teachers/teacher.schema.js';
import {
  StudyGroup,
  StudyGroupDocument,
} from '../groups/study-group.schema.js';
import { Student, StudentDocument } from '../students/student.schema.js';
import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { TestimonialsService } from '../testimonials/testimonials.service.js';
import { ActivityService } from '../activity/activity.service.js';
import { CreatePublicRegistrationDto } from './dto/create-public-registration.dto.js';
import { escapeRegex, mapLeanDoc } from '../common/utils/paginate.js';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Level.name) private levelModel: Model<LevelDocument>,
    @InjectModel(SchoolClass.name)
    private classModel: Model<SchoolClassDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(StudyGroup.name)
    private groupModel: Model<StudyGroupDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private siteSettingsService: SiteSettingsService,
    private testimonialsService: TestimonialsService,
    private activityService: ActivityService,
  ) {}

  async getSiteInfo() {
    const [levels, classes, subjects, teachers] = await Promise.all([
      this.levelModel.countDocuments(),
      this.classModel.countDocuments(),
      this.subjectModel.countDocuments(),
      this.teacherModel.countDocuments({ isActive: true }),
    ]);

    return {
      levels,
      classes,
      subjects,
      teachers,
      levelsCount: levels,
      classesCount: classes,
      subjectsCount: subjects,
      teachersCount: teachers,
    };
  }

  async getLevels() {
    const [levels, classes, subjects] = await Promise.all([
      this.levelModel.find().sort({ position: 1 }).lean().exec(),
      this.classModel.find().sort({ name: 1 }).lean().exec(),
      this.subjectModel.find().sort({ name: 1 }).lean().exec(),
    ]);

    const subjectsByClass = new Map<string, Array<{ id: string; name: string }>>();
    for (const sub of subjects) {
      const classId = sub.schoolClass.toString();
      if (!subjectsByClass.has(classId)) {
        subjectsByClass.set(classId, []);
      }
      subjectsByClass.get(classId)!.push({
        id: sub._id.toString(),
        name: sub.name,
      });
    }

    const classesByLevel = new Map<string, any[]>();
    for (const cls of classes) {
      const levelId = cls.level.toString();
      if (!classesByLevel.has(levelId)) {
        classesByLevel.set(levelId, []);
      }
      classesByLevel.get(levelId)!.push({
        id: cls._id.toString(),
        name: cls.name,
        subjects: subjectsByClass.get(cls._id.toString()) || [],
      });
    }

    return levels.map((lvl) => ({
      id: lvl._id.toString(),
      name: lvl.name,
      position: lvl.position,
      classes: classesByLevel.get(lvl._id.toString()) || [],
    }));
  }

  async getTeachers() {
    const [teachers, activeGroups] = await Promise.all([
      this.teacherModel
        .find({ isActive: true })
        .sort({ lastName: 1, firstName: 1 })
        .lean()
        .exec(),
      this.groupModel
        .find({ isActive: true })
        .populate('subject', 'name')
        .lean()
        .exec(),
    ]);

    const subjectsByTeacher = new Map<string, Set<string>>();
    for (const group of activeGroups) {
      const teacherId = group.teacher.toString();
      const subjectName = (group.subject as any)?.name;
      if (subjectName) {
        if (!subjectsByTeacher.has(teacherId)) {
          subjectsByTeacher.set(teacherId, new Set());
        }
        subjectsByTeacher.get(teacherId)!.add(subjectName);
      }
    }

    return teachers.map((t) => ({
      id: t._id.toString(),
      firstName: t.firstName,
      lastName: t.lastName,
      subjects: Array.from(subjectsByTeacher.get(t._id.toString()) || []).sort(),
    }));
  }

  async getSiteSettings() {
    const settings = await this.siteSettingsService.getSettings();

    const mapsUrl = settings.address
      ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`
      : '';

    const autoEmbedUrl =
      settings.googleMapsEmbedUrl ||
      (settings.address
        ? `https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
        : '');

    return {
      heroTagline: settings.heroTagline || '',
      tagline: settings.heroTagline || '',
      heroDescription: settings.heroDescription || '',
      aboutTitle: settings.aboutTitle || '',
      aboutText1: settings.aboutText1 || '',
      aboutText2: settings.aboutText2 || '',
      address: settings.address || '',
      googleMapsEmbedUrl: autoEmbedUrl,
      mapsEmbedUrl: autoEmbedUrl,
      mapsUrl,
      phone: settings.phone || '',
      whatsapp: settings.whatsapp || '',
      email: settings.email || '',
      socialLinks: settings.socialLinks || [],
      facebookUrl: settings.facebookUrl || '',
      instagramUrl: settings.instagramUrl || '',
      linkedinUrl: settings.linkedinUrl || '',
      youtubeUrl: '',
      tiktokUrl: '',
    };
  }


  async getTestimonials(page: number, limit: number) {
    return this.testimonialsService.findApproved(page, limit);
  }

  async getTestimonialsSummary() {
    return this.testimonialsService.getApprovedSummary();
  }

  async register(dto: CreatePublicRegistrationDto) {
    // Honeypot check
    if (dto.website && dto.website.trim().length > 0) {
      return {
        success: true,
        message:
          "Votre pré-inscription a été enregistrée. L'école vous contactera pour finaliser l'inscription.",
      };
    }

    // Duplicate check: same firstName + lastName + phone
    const existing = await this.studentModel
      .findOne({
        firstName: { $regex: new RegExp(`^${escapeRegex(dto.firstName)}$`, 'i') },
        lastName: { $regex: new RegExp(`^${escapeRegex(dto.lastName)}$`, 'i') },
        phone: dto.phone,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        'Une pré-inscription avec ce nom et numéro existe déjà',
      );
    }

    const student = await this.studentModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      birthDate: new Date(dto.birthDate + 'T00:00:00.000Z'),
      gender: dto.gender,
      phone: dto.phone,
      email: dto.email || undefined,
      origin: 'WEBSITE',
      isActive: false,
    });

    await this.activityService.log(
      'STUDENT_PREREGISTERED',
      'Nouvelle pré-inscription en ligne',
      `${dto.firstName} ${dto.lastName} (${dto.phone})`,
    );

    return {
      success: true,
      message:
        "Votre pré-inscription a été enregistrée. L'école vous contactera pour finaliser l'inscription.",
      studentId: student._id.toString(),
    };
  }
}
