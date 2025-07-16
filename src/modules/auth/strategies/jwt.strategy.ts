import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { AdminUserDocument } from '../schemas/admin-user.schema';
import { config } from 'dotenv';

config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.jwt;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret', // TODO: Use a strong secret from environment variables
    });
  }

  async validate(payload: any): Promise<AdminUserDocument> {
    const user = await this.authService.findByUid(payload.uid);
    if (!user) {
      // You might throw an UnauthorizedException here
      return null; // Or throw new UnauthorizedException();
    }
    return user; // The user object will be attached to the request (req.user)
  }
}
