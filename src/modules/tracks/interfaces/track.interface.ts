import type { Like } from './like.interface';

export interface TrackWithoutTitle {
  description:string;
  releaseDate: string;
  author:string;
  magnetLink:string;
  torrentLink:string;
  likes: Like[];
}

export interface Track extends TrackWithoutTitle {
  title:string;
}
