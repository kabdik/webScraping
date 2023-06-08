import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { Section } from '../section/schemas/section.schema';
import type { Track } from '../tracks/interfaces/track.interface';
import { WebscraperService } from '../webscraper/webscraper.service';
import type { Subsection } from './schemas/subsection.schema';

@Injectable()
export class SubsectionService {
  constructor(
    @InjectModel(Section.name)
    private sectionModel: mongoose.Model<Section>,
    private webscraperService: WebscraperService,
  ) {}

  public async tracksScrap(id: string): Promise<Track[]> {
    const objectId = new mongoose.Types.ObjectId(id);
    const section = await this.sectionModel.findOne({ 'subsections._id': objectId });

    const targetSubsection = section!.subsections.find((subsection:Subsection) => subsection._id.equals(objectId));
    if (!targetSubsection) {
      throw new BadRequestException('Wrong subsection id');
    }

    const { error } = await this.webscraperService.login();
    if (error) {
      throw new HttpException('error login rutracker', 500);
    }

    return this.webscraperService.tracks(targetSubsection.title);
  }
}
