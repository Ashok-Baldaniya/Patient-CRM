import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowUp, FollowUpSchema } from './schemas/followup.schema';
import { FollowupsController } from './followups.controller';
import { FollowupsService } from './followups.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FollowUp.name, schema: FollowUpSchema },
    ]),
  ],
  controllers: [FollowupsController],
  providers: [FollowupsService],
  exports: [FollowupsService, MongooseModule],
})
export class FollowupsModule {}
