import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      ok: true,
      service: 'patient-crm-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
