import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WebscraperModule } from '../webscraper/webscraper.module';
import { SectionSchema } from './schemas/section.schema';
import { SectionController } from './section.controller';
import { SectionService } from './section.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Section', schema: SectionSchema }]), WebscraperModule],
  providers: [SectionService],
  controllers: [SectionController],
})
export class SectionModule {}
