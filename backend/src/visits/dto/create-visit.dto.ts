import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateVisitDto {
  @IsMongoId()
  patientId: string;

  @IsDateString()
  visitAt: string;

  @Min(1)
  @Max(365)
  followUpDays: number;

  @IsOptional()
  @IsMongoId()
  messageTemplateId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;
}
