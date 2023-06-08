import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import type { Track } from '../tracks/interfaces/track.interface';
import { SubsectionService } from './subsection.service';

@Controller('subsection')
export class SubsectionController {
  constructor(
    private readonly subsectionService:SubsectionService,
  ) {}

  @ApiOperation({ summary: 'Scrap tracks of the particular subsection (default id: 647f570cdf393ef5dc771eb9)' })
  @Get('/:id/tracks/scrap')
  public async tracksScrap(@Param('id') id:string):Promise<Track[]> {
    return this.subsectionService.tracksScrap(id);
  }
}
