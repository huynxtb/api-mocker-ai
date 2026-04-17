import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';

export interface AccessTokenPayload {
  sub: string;
  username: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  username: string;
  type: 'refresh';
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const opts: SignOptions = { expiresIn: config.jwtAccessTtl as SignOptions['expiresIn'] };
  return jwt.sign({ ...payload, type: 'access' }, config.jwtAccessSecret, opts);
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  const opts: SignOptions = { expiresIn: config.jwtRefreshTtl as SignOptions['expiresIn'] };
  return jwt.sign({ ...payload, type: 'refresh' }, config.jwtRefreshSecret, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, config.jwtAccessSecret) as AccessTokenPayload;
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
