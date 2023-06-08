import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectPage } from 'nest-puppeteer';
import type { ElementHandle, Page } from 'puppeteer';

import { ConsoleLogger } from '@/common/logger/console-logger';

import type { TrackWithoutTitle, Track } from '../tracks/interfaces/track.interface';
import type { Like } from '../tracks/schemas/like.schema';
import type { SectionScrap } from './interfaces/section-scrap.interface';

@Injectable()
export class WebscraperService {
  constructor(@InjectPage() private readonly page: Page, private logger: ConsoleLogger) {}

  public async sections(): Promise<SectionScrap[]> {
    await this.page.goto('https://rutracker.org/forum/tracker.php', { waitUntil: 'domcontentloaded' });

    return this.page.evaluate(() => {
      const optgroups = Array.from(document.querySelectorAll('optgroup'));

      return optgroups.map((optgroup: HTMLOptGroupElement) => {
        const title = <string>optgroup.getAttribute('label')?.trim();
        const options = Array.from(optgroup.querySelectorAll('option'));

        const subsections = options.map((option: HTMLOptionElement) => ({
          title: option.textContent!.replace('|-', '').trim(),
        }));

        return {
          title,
          subsections,
        };
      });
    });
  }

  public async login(): Promise<{ error: unknown | null }> {
    try {
      await this.page.goto('https://rutracker.org/forum/index.php', { waitUntil: 'domcontentloaded' });
      const loginElement = await this.page.$('a[onclick="BB.toggle_top_login(); return false;"]');
      if (!loginElement) {
        return { error: null };
      }
      await loginElement.click();
      await this.page.waitForSelector('#top-login-uname');

      const loginField = await this.page.$('#top-login-uname');
      const passwordField = await this.page.$('#top-login-pwd');
      if (!loginField || !passwordField) {
        return { error: null };
      }

      await loginField.type('testAns');
      await passwordField.type('testAns');

      await Promise.all([this.page.click('#top-login-btn'), this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })]);
      console.log('finish login');

      return { error: null };
    } catch (error: unknown) {
      this.logger.error('Error logining rutracker', error);
      return { error };
    }
  }

  public async tracks(subsectionTitle: string): Promise<Track[]> {
    await this.page.goto('https://rutracker.org/forum/tracker.php', { waitUntil: 'domcontentloaded' });
    console.log('startTrack');

    const subsections = <string[]>(
      await this.page.$$eval('optgroup option', (options: HTMLOptionElement[]) => options.map((option: HTMLOptionElement) => option.textContent))
    );

    // find the index of subsection which has subsectionTitle as a text
    const targetIndex = subsections.findIndex((option: string) => option.includes(subsectionTitle));
    if (targetIndex === -1) {
      throw new BadRequestException('Tracker page error');
    }

    const targetElement = await this.page.$$('optgroup option').then((options: ElementHandle<HTMLOptionElement>[]) => options[targetIndex]);
    if (!targetElement) {
      throw new BadRequestException('Target element not found');
    }

    // click on the subsection we need
    await targetElement.click();
    await Promise.all([this.page.click('#tr-submit-btn'), this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })]);

    const tracks: Track[] = [];
    await this.extractFromSearchPage(tracks);
    return tracks;
  }

  private async extractFromSearchPage(tracks: Track[]): Promise<void> {
    if (tracks.length >= 100) {
      // get only 100 tracks
      return;
    }
    if (!(await this.page.$('.tCenter.hl-tr'))) {
      // if no more rows, then return
      return;
    }

    // here from the main search page, I need to get name of the track and link to the track page
    const rows = await this.page.$$eval('.tCenter.hl-tr', (searchRows: Element[]) => searchRows.map((searchRow: Element) => {
      const titleElement = searchRow.querySelector('.t-title a');

      const title = titleElement ? titleElement.textContent!.trim() : '';
      const link = titleElement ? `https://rutracker.org/forum/${titleElement.getAttribute('href')}`! : '';

      return { title, link }; // extract the title and the link of each row in search table
    }));

    // index of the link to the next page
    const pageLinks = <string[]>(
      await this.page.$$eval('.pg', (pageLinkElements: Element[]) => pageLinkElements.map((pageLinkElement: Element) => pageLinkElement.textContent))
    );
    const pageLinkIndex = pageLinks.findIndex((pageLink: string) => pageLink.includes('След.'));
    if (pageLinkIndex === -1) {
      return;
    }

    // next page link
    const nextPageLink = await this.page.$$eval(
      '.pg',
      (pageLinkElements: Element[], index: number) => pageLinkElements[index].getAttribute('href'),
      pageLinkIndex,
    );

    for (const row of rows) {
      // go to the link of each track and extract its information
      const data = <Track>{ title: row.title, ...(await this.extractData(row.link)) };
      console.log(data);

      tracks.push(data);
    }

    // go to the next search page
    try {
      await this.page.goto(`https://rutracker.org/forum/${nextPageLink}`, { waitUntil: 'domcontentloaded' });
    } catch (error) {
      this.logger.error('Error navigating to the next page', error);
      return;
    }

    await this.extractFromSearchPage(tracks);
  }

  private async extractData(trackLink: string): Promise<TrackWithoutTitle> {
    try {
      await this.page.goto(trackLink, { waitUntil: 'domcontentloaded' });
      const data = await this.page.evaluate(() => {
        const authorElement = document.querySelector('.poster_info .nick');

        const elements = Array.from(document.querySelectorAll('.post-b'));
        const descriptionElement = <Element>elements.find((element: Element) => element.textContent!.includes('Описание'));
        let description: string;
        if (descriptionElement.nextElementSibling?.tagName === 'BR') {
          description = descriptionElement.nextElementSibling.nextSibling!.textContent!;
        } else if (descriptionElement.nextElementSibling?.classList.contains('p-color')) {
          description = descriptionElement.nextElementSibling.textContent!;
        } else {
          description = descriptionElement.nextSibling!.textContent!;
        }

        description = description.replace(/^:/, '').trim();
        const downloadTable = document.querySelector('.attach.bordered.med');
        const releaseDateElement = downloadTable!.querySelector('tr:nth-child(2)  td:nth-child(2) li');
        const magnetLinkElement = downloadTable!.querySelector('tr:nth-child(5) td:nth-child(2) li:nth-child(2) > a');
        const torrentLinkElement = downloadTable!.querySelector('tr:nth-child(2) a');

        const author = authorElement ? authorElement.textContent!.trim() : '';
        const releaseDate = releaseDateElement ? releaseDateElement.textContent!.trim() : '';
        const magnetLink = magnetLinkElement ? `https://rutracker.org/forum/${magnetLinkElement.getAttribute('href')!.trim()}` : '';
        const torrentLink = torrentLinkElement ? `https://rutracker.org/forum/${torrentLinkElement.getAttribute('href')!.trim()}` : '';
        return <TrackWithoutTitle>{ description, author, releaseDate, magnetLink, torrentLink };
      });
      data.likes = await this.getLikes();
      return data;
    } catch (error) {
      this.logger.error('Error extracting from track page', error);
      return <TrackWithoutTitle>{};
    }
  }

  private async getLikes(): Promise<Like[]> {
    try {
      await Promise.all([
        this.page.click('.sp-no-auto-open span'),
        new Promise((resolve) => setTimeout(resolve, 500)),
        this.page.waitForSelector('#thx-list a'),
      ]);

      return await this.page.evaluate(() => {
        const likeElements = Array.from(document.querySelectorAll('#thx-list a'));
        return likeElements.map((likeElement: Element) => {
          const likeDateElement = likeElement.querySelector('i');

          const likeDate = likeDateElement ? likeDateElement.textContent!.trim() : '';
          const username = likeDateElement ? likeDateElement.previousSibling!.textContent!.trim() : '';
          return <Like>{ username, likeDate };
        });
      });
    } catch (error) {
      this.logger.error('Error extracting likes', error);
      return <Like[]>[];
    }
  }
}
