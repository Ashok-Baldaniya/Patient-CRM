import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageTemplateDocument = HydratedDocument<MessageTemplate>;

@Schema({ timestamps: true })
export class MessageTemplate {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  language: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export const MessageTemplateSchema =
  SchemaFactory.createForClass(MessageTemplate);
