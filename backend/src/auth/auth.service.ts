import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AuthTokenPayload = {
  username: string;
  issuedAt: number;
};

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  login(username: string, password: string) {
    const configuredUsername =
      this.configService.get<string>('ADMIN_USERNAME') ?? 'admin';
    const configuredPassword =
      this.configService.get<string>('ADMIN_PASSWORD') ?? 'admin123';

    if (
      username !== configuredUsername ||
      !this.safeCompare(password, configuredPassword)
    ) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    return {
      accessToken: this.signToken({
        username,
        issuedAt: Date.now(),
      }),
      user: {
        username,
      },
    };
  }

  verifyToken(token: string): AuthTokenPayload {
    const [payloadPart, signaturePart] = token.split('.');

    if (!payloadPart || !signaturePart) {
      throw new UnauthorizedException('Invalid token.');
    }

    const expectedSignature = this.sign(payloadPart);

    if (!this.safeCompare(signaturePart, expectedSignature)) {
      throw new UnauthorizedException('Invalid token signature.');
    }

    try {
      const payloadJson = Buffer.from(payloadPart, 'base64url').toString(
        'utf8',
      );
      return JSON.parse(payloadJson) as AuthTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid token payload.');
    }
  }

  private signToken(payload: AuthTokenPayload) {
    const payloadPart = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signaturePart = this.sign(payloadPart);

    return `${payloadPart}.${signaturePart}`;
  }

  private sign(value: string) {
    const secret =
      this.configService.get<string>('AUTH_SECRET') ?? 'patient-crm-secret';

    return createHmac('sha256', secret).update(value).digest('base64url');
  }

  private safeCompare(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
