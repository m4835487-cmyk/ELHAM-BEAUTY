import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { DATA_DIR, readDatabase } from './store.ts';

const SECRET_FILE = path.join(DATA_DIR, 'session.secret');
let cachedSecret: string | null = null;

async function getSessionSecret(): Promise<string> {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16) {
    return process.env.SESSION_SECRET.trim();
  }
  if (cachedSecret) return cachedSecret;

  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const existing = (await fs.readFile(SECRET_FILE, 'utf8')).trim();
    if (existing.length >= 32) {
      cachedSecret = existing;
      return existing;
    }
  } catch {
    // ignore missing file
  }

  const generated = crypto.randomBytes(48).toString('hex');
  await fs.writeFile(SECRET_FILE, generated, 'utf8');
  cachedSecret = generated;
  return generated;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const db = await readDatabase();
  if (db.adminPasswordHash) {
    return verifyPasswordHash(password, db.adminPasswordHash);
  }
  const envPass = process.env.ADMIN_PASSWORD?.trim();
  if (envPass) {
    const a = Buffer.from(password, 'utf8');
    const b = Buffer.from(envPass, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  return false;
}

export async function isPasswordConfigured(): Promise<boolean> {
  const db = await readDatabase();
  if (db.adminPasswordHash) return true;
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0);
}

export async function issueAdminToken(): Promise<string> {
  const secret = await getSessionSecret();
  const payloadObj = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    jti: crypto.randomUUID(),
  };
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const secret = await getSessionSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    if (decoded.role !== 'admin') return false;
    if (!decoded.exp || Date.now() > decoded.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Admin authentication required.' });
      return;
    }
    const valid = await verifyAdminToken(token);
    if (!valid) {
      res.status(401).json({ error: 'Invalid or expired admin session.' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Auth check failed.' });
  }
}
