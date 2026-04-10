import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { formatInTimeZone } from 'date-fns-tz';
import { FollowUp, FollowUpDocument } from './schemas/followup.schema';
import { FollowUpStatus } from '../common/enums/follow-up-status.enum';
import { CLINIC_TIMEZONE } from '../common/constants/clinic.constants';

type QueuePatientSnapshot = {
  fullName?: string;
  mobile?: string;
};

type QueueItemRecord = {
  _id: string;
  status: FollowUpStatus;
  followUpDays: number;
  dueAt: Date;
  reminderAt: Date;
  patientId?: QueuePatientSnapshot;
  messageTextSnapshot?: string;
  whatsappUrl?: string;
  reminderAtLabel?: string;
  dueAtLabel?: string;
};

@Injectable()
export class FollowupsService {
  constructor(
    @InjectModel(FollowUp.name)
    private readonly followupModel: Model<FollowUpDocument>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async activateScheduledReminders() {
    await this.followupModel.updateMany(
      {
        status: FollowUpStatus.Scheduled,
        reminderAt: { $lte: new Date() },
      },
      {
        $set: {
          status: FollowUpStatus.Due,
        },
      },
    );
  }

  findAll(status?: FollowUpStatus) {
    return this.followupModel
      .find(status ? { status } : {})
      .populate('patientId', 'fullName mobile')
      .populate('visitId', 'visitAt')
      .sort({ reminderAt: 1 })
      .lean();
  }

  async getQueue(): Promise<QueueItemRecord[]> {
    const items = (await this.followupModel
      .find({
        status: {
          $in: [FollowUpStatus.Due, FollowUpStatus.Opened],
        },
      })
      .populate('patientId', 'fullName mobile')
      .populate('visitId', 'visitAt')
      .sort({ reminderAt: 1 })
      .lean()) as unknown as QueueItemRecord[];

    return items.map((item) => ({
      ...item,
      whatsappUrl: this.buildWhatsappUrl(item),
      reminderAtLabel: formatInTimeZone(
        item.reminderAt,
        CLINIC_TIMEZONE,
        'dd MMM yyyy, hh:mm a',
      ),
      dueAtLabel: formatInTimeZone(
        item.dueAt,
        CLINIC_TIMEZONE,
        'dd MMM yyyy, hh:mm a',
      ),
    }));
  }

  async markOpened(id: string) {
    return this.followupModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: FollowUpStatus.Opened,
            openedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean();
  }

  async markSent(id: string) {
    return this.followupModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: FollowUpStatus.Sent,
            sentAt: new Date(),
          },
        },
        { new: true },
      )
      .lean();
  }

  async markSkipped(id: string) {
    return this.followupModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: FollowUpStatus.Skipped,
            skippedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean();
  }

  private buildWhatsappUrl(item: {
    patientId?: QueuePatientSnapshot;
    dueAt: Date;
    messageTextSnapshot?: string;
  }) {
    const fullName = item.patientId?.fullName ?? 'Patient';
    const mobile = item.patientId?.mobile ?? '';
    const dueDate = formatInTimeZone(
      item.dueAt,
      CLINIC_TIMEZONE,
      'dd MMM yyyy, hh:mm a',
    );
    const message =
      item.messageTextSnapshot ??
      `Hello ${fullName}, this is a gentle reminder from your clinic. Your follow-up is due on ${dueDate}.`;

    return `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
  }
}
