import { Track, TrackSchema } from '@/modules/tracks/schemas/track.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Types } from 'mongoose';

@Schema()
export class Subsection {
  _id!:Types.ObjectId;

  @Prop()
  title!: string;

  @Prop({ type: [TrackSchema] })
  tracks!: Track[];
}

export const SubsectionSchema = SchemaFactory.createForClass(Subsection);
