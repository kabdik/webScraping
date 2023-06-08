import { Subsection, SubsectionSchema } from "@/modules/subsection/schemas/subsection.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Section {
    @Prop()
    title!:string

    @Prop({type:[SubsectionSchema]})
    subsections!:Subsection[]

}

export const SectionSchema = SchemaFactory.createForClass(Section)