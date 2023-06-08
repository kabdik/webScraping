import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import type { SectionScrap } from '../webscraper/interfaces/section-scrap.interface';
import type { Section } from './schemas/section.schema';
import { SectionService } from './section.service';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService:SectionService) {}

  @ApiOperation({ summary: 'Get all sections with subsections' })
  @Get()
  public async findAll():Promise<Section[]> {
    return this.sectionService.findAll();
  }

  @ApiOperation({ summary: 'Scrap sections with its subsections ' })
  @Get('scrap')
  public async scrapSections():Promise<SectionScrap[]> {
    return this.sectionService.scrapSections();
  }
}
