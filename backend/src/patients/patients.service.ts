import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FollowUp,
  FollowUpDocument,
} from '../followups/schemas/followup.schema';
import { Visit, VisitDocument } from '../visits/visit.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient, PatientDocument } from './schemas/patient.schema';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    @InjectModel(Visit.name)
    private readonly visitModel: Model<VisitDocument>,
    @InjectModel(FollowUp.name)
    private readonly followupModel: Model<FollowUpDocument>,
  ) {}

  create(createPatientDto: CreatePatientDto) {
    return this.patientModel.create({
      ...createPatientDto,
      dateOfBirth: createPatientDto.dateOfBirth
        ? new Date(createPatientDto.dateOfBirth)
        : undefined,
    });
  }

  findAll() {
    return this.patientModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const patient = await this.patientModel.findById(id).lean();

    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.patientModel
      .findByIdAndUpdate(
        id,
        {
          ...updatePatientDto,
          dateOfBirth: updatePatientDto.dateOfBirth
            ? new Date(updatePatientDto.dateOfBirth)
            : undefined,
        },
        { new: true, runValidators: true },
      )
      .lean();

    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }

    return patient;
  }

  async getHistory(id: string) {
    const patient = await this.findOne(id);
    const patientObjectId = new Types.ObjectId(id);

    const [visits, followups] = await Promise.all([
      this.visitModel
        .find({ patientId: patientObjectId })
        .sort({ visitAt: -1 })
        .lean(),
      this.followupModel
        .find({ patientId: patientObjectId })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return {
      patient,
      history: {
        visits,
        followups,
      },
    };
  }
}
