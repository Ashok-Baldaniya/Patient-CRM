import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VisitDocument = HydratedDocument<Visit>;

@Schema({ timestamps: true })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  visitAt: Date;

  @Prop({ required: true })
  followUpDays: number;

  @Prop({ required: true })
  dueAt: Date;

  @Prop({ required: true })
  reminderAt: Date;

  @Prop()
  notes?: string;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
