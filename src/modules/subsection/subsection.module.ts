import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SectionSchema } from '../section/schemas/section.schema';
import { WebscraperModule } from '../webscraper/webscraper.module';
import { SubsectionController } from './subsection.controller';
import { SubsectionService } from './subsection.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Section', schema: SectionSchema }]), WebscraperModule],
  providers: [SubsectionService],
  controllers: [SubsectionController],
})
export class SubsectionModule {}
