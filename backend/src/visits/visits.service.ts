import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { formatInTimeZone } from 'date-fns-tz';
import { CLINIC_TIMEZONE } from '../common/constants/clinic.constants';
import { buildFollowUpDates } from '../common/utils/followup-date.util';
import { renderReminderTemplate } from '../common/utils/message-template.util';
import { FollowUpStatus } from '../common/enums/follow-up-status.enum';
import {
  FollowUp,
  FollowUpDocument,
} from '../followups/schemas/followup.schema';
import { Patient, PatientDocument } from '../patients/schemas/patient.schema';
import {
  MessageTemplate,
  MessageTemplateDocument,
} from '../templates/schemas/template.schema';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit, VisitDocument } from './visit.schema';

@Injectable()
export class VisitsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Visit.name)
    private readonly visitModel: Model<VisitDocument>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    @InjectModel(FollowUp.name)
    private readonly followupModel: Model<FollowUpDocument>,
    @InjectModel(MessageTemplate.name)
    private readonly templateModel: Model<MessageTemplateDocument>,
  ) {}

  async create(createVisitDto: CreateVisitDto) {
    const patient = await this.patientModel
      .findById(createVisitDto.patientId)
      .lean();

    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }

    const patientId = new Types.ObjectId(createVisitDto.patientId);
    const { dueAt, reminderAt } = buildFollowUpDates(
      new Date(createVisitDto.visitAt),
      createVisitDto.followUpDays,
    );
    const template = createVisitDto.messageTemplateId
      ? await this.templateModel
          .findById(createVisitDto.messageTemplateId)
          .lean()
      : await this.templateModel.findOne({ isDefault: true }).lean();

    if (createVisitDto.messageTemplateId && !template) {
      throw new NotFoundException('Selected template not found.');
    }

    await this.followupModel.updateMany(
      {
        patientId,
        status: {
          $in: [
            FollowUpStatus.Scheduled,
            FollowUpStatus.Due,
            FollowUpStatus.Opened,
            FollowUpStatus.Sent,
            FollowUpStatus.Skipped,
          ],
        },
      },
      {
        $set: {
          status: FollowUpStatus.Cancelled,
          cancelledAt: new Date(),
          cancelReason: 'Superseded by a newer visit.',
        },
      },
    );

    const visit = await this.visitModel.create({
      patientId,
      visitAt: new Date(createVisitDto.visitAt),
      followUpDays: createVisitDto.followUpDays,
      dueAt,
      reminderAt,
      notes: createVisitDto.notes,
    });

    const clinicName =
      this.configService.get<string>('CLINIC_NAME') ?? 'Homeopathy Clinic';
    const visitAtLabel = formatInTimeZone(
      new Date(createVisitDto.visitAt),
      CLINIC_TIMEZONE,
      'dd MMM yyyy, hh:mm a',
    );
    const dueAtLabel = formatInTimeZone(
      dueAt,
      CLINIC_TIMEZONE,
      'dd MMM yyyy, hh:mm a',
    );
    const defaultTemplate =
      'Hello {{patientName}}, this is a reminder from {{clinicName}}. Your follow-up is due on {{dueDate}}. Please contact us if you need to reschedule.';
    const messageTextSnapshot = renderReminderTemplate(
      template?.content ?? defaultTemplate,
      {
        clinicName,
        dueDate: dueAtLabel,
        followUpDays: String(createVisitDto.followUpDays),
        patientName: patient.fullName,
        patientPhone: patient.mobile,
        visitDate: visitAtLabel,
      },
    );

    const followup = await this.followupModel.create({
      patientId,
      visitId: visit._id,
      followUpDays: createVisitDto.followUpDays,
      dueAt,
      reminderAt,
      status:
        reminderAt <= new Date()
          ? FollowUpStatus.Due
          : FollowUpStatus.Scheduled,
      messageTemplateId: template?._id,
      messageTextSnapshot,
    });

    return {
      visit,
      followup,
      template,
    };
  }

  findAll() {
    return this.visitModel
      .find()
      .populate('patientId', 'fullName mobile')
      .sort({ visitAt: -1 })
      .lean();
  }
}
