import type { SubsectionScrap } from './subsection-scrap.interface';

export interface SectionScrap {
  title: string;
  subsections: SubsectionScrap[];
}
