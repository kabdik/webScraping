import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type mongoose from 'mongoose';

import type { SectionScrap } from '../webscraper/interfaces/section-scrap.interface';
import { WebscraperService } from '../webscraper/webscraper.service';
import { Section } from './schemas/section.schema';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name)
    private sectionModel: mongoose.Model<Section>,
    private readonly webscraperService: WebscraperService,
  ) {}

  public async findAll(): Promise<Section[]> {
    return this.sectionModel.find();
  }

  public async scrapSections(): Promise<SectionScrap[]> {
    const { error } = await this.webscraperService.login();
    if (error) {
      throw new HttpException('error login rutracker', 500);
    }

    const sectionsData = await this.webscraperService.sections();
    const sections = sectionsData.map((sectionData:SectionScrap) => (new this.sectionModel(sectionData)));

    return this.sectionModel.create(sections);
  }
}
