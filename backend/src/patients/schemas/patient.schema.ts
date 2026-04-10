import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PatientGender } from '../dto/create-patient.dto';

export type PatientDocument = HydratedDocument<Patient>;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  mobile: string;

  @Prop({ enum: PatientGender })
  gender?: PatientGender;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  ageLabel?: string;

  @Prop()
  address?: string;

  @Prop()
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
