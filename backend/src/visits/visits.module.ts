import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowUp, FollowUpSchema } from '../followups/schemas/followup.schema';
import { Patient, PatientSchema } from '../patients/schemas/patient.schema';
import {
  MessageTemplate,
  MessageTemplateSchema,
} from '../templates/schemas/template.schema';
import { Visit, VisitSchema } from './visit.schema';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Visit.name, schema: VisitSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: FollowUp.name, schema: FollowUpSchema },
      { name: MessageTemplate.name, schema: MessageTemplateSchema },
    ]),
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
