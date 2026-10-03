import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolClass, SchoolClassSchema } from './school-class.schema.js';
import { Level, LevelSchema } from '../levels/level.schema.js';
import { ClassesController } from './classes.controller.js';
import { ClassesService } from './classes.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchoolClass.name, schema: SchoolClassSchema },
      { name: Level.name, schema: LevelSchema },
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [MongooseModule],
})
export class ClassesModule {}
