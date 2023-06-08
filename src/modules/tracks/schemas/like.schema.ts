import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Like {
  @Prop()
  username!: string;

  @Prop()
  likeDate!: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
