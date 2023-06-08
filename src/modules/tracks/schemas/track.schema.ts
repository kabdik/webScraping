import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Like, LikeSchema } from "./like.schema";

@Schema()
export class Track{
    @Prop()
    title!:string
    
    @Prop()
    description!:string

    @Prop()
    releaseDate!: Date

    @Prop()
    author!:string

    @Prop()
    magnetLink!:string

    @Prop()
    torrentLink!:string

    @Prop({type:[LikeSchema], default:[]})
    likes?: Like[]
}

export const TrackSchema = SchemaFactory.createForClass(Track)