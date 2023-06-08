import { Module } from '@nestjs/common';
import { PuppeteerModule } from 'nest-puppeteer';

import { WebscraperService } from './webscraper.service';

@Module({
  imports: [PuppeteerModule.forRoot()],
  providers: [WebscraperService],
  controllers: [],
  exports: [WebscraperService],
})
export class WebscraperModule {}
