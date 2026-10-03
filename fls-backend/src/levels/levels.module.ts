import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Level, LevelSchema } from './level.schema.js';
import { LevelsController } from './levels.controller.js';
import { LevelsService } from './levels.service.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Level.name, schema: LevelSchema }]),
    ActivityModule,
  ],
  controllers: [LevelsController],
  providers: [LevelsService],
  exports: [MongooseModule],
})
export class LevelsModule {}
