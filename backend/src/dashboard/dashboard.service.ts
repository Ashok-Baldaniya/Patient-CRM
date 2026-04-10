import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { endOfDay, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { Model } from 'mongoose';
import { CLINIC_TIMEZONE } from '../common/constants/clinic.constants';
import { FollowUpStatus } from '../common/enums/follow-up-status.enum';
import {
  FollowUp,
  FollowUpDocument,
} from '../followups/schemas/followup.schema';
import { Visit, VisitDocument } from '../visits/visit.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(FollowUp.name)
    private readonly followupModel: Model<FollowUpDocument>,
    @InjectModel(Visit.name)
    private readonly visitModel: Model<VisitDocument>,
  ) {}

  async getSummary() {
    const now = new Date();
    const zonedNow = toZonedTime(now, CLINIC_TIMEZONE);
    const start = fromZonedTime(startOfDay(zonedNow), CLINIC_TIMEZONE);
    const end = fromZonedTime(endOfDay(zonedNow), CLINIC_TIMEZONE);

    const [dueToday, overdue, sentToday, revisitsToday] = await Promise.all([
      this.followupModel.countDocuments({
        status: { $in: [FollowUpStatus.Due, FollowUpStatus.Opened] },
        reminderAt: { $gte: start, $lte: end },
      }),
      this.followupModel.countDocuments({
        status: { $in: [FollowUpStatus.Due, FollowUpStatus.Opened] },
        reminderAt: { $lt: start },
      }),
      this.followupModel.countDocuments({
        status: FollowUpStatus.Sent,
        sentAt: { $gte: start, $lte: end },
      }),
      this.visitModel.countDocuments({
        visitAt: { $gte: start, $lte: end },
      }),
    ]);

    return {
      dueToday,
      overdue,
      sentToday,
      revisitsToday,
    };
  }
}
