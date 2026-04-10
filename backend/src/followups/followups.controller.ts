import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { FollowUpStatus } from '../common/enums/follow-up-status.enum';

@Controller('followups')
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Get()
  findAll(@Query('status') status?: FollowUpStatus) {
    return this.followupsService.findAll(status);
  }

  @Get('queue')
  queue(): Promise<
    ReturnType<FollowupsService['getQueue']> extends Promise<infer T>
      ? T
      : never
  > {
    return this.followupsService.getQueue();
  }

  @Patch(':id/opened')
  markOpened(@Param('id') id: string) {
    return this.followupsService.markOpened(id);
  }

  @Patch(':id/sent')
  markSent(@Param('id') id: string) {
    return this.followupsService.markSent(id);
  }

  @Patch(':id/skipped')
  markSkipped(@Param('id') id: string) {
    return this.followupsService.markSkipped(id);
  }
}
