import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FollowUpStatus } from '../../common/enums/follow-up-status.enum';

export type FollowUpDocument = HydratedDocument<FollowUp>;

@Schema({ timestamps: true })
export class FollowUp {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Visit', required: true, index: true })
  visitId: Types.ObjectId;

  @Prop({
    required: true,
    enum: FollowUpStatus,
    default: FollowUpStatus.Scheduled,
  })
  status: FollowUpStatus;

  @Prop({ required: true })
  followUpDays: number;

  @Prop({ required: true })
  dueAt: Date;

  @Prop({ required: true, index: true })
  reminderAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'MessageTemplate' })
  messageTemplateId?: Types.ObjectId;

  @Prop()
  messageTextSnapshot?: string;

  @Prop()
  openedAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  skippedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancelReason?: string;
}

export const FollowUpSchema = SchemaFactory.createForClass(FollowUp);
