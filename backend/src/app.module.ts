import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FollowupsModule } from './followups/followups.module';
import { HealthModule } from './health/health.module';
import { PatientsModule } from './patients/patients.module';
import { TemplatesModule } from './templates/templates.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/patient-crm',
    ),
    ScheduleModule.forRoot(),
    PatientsModule,
    VisitsModule,
    FollowupsModule,
    TemplatesModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
