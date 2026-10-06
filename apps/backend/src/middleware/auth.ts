import Elysia, { status as httpError } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer';

import { roles } from '../db/schema';

export type JwtPayload = {
  id: string;
  role: (typeof roles)[number];
  email: string;
};

/**
 * Auth middleware plugin — derive `user` dari JWT Bearer token.
 */
export const authMiddleware = new Elysia({ name: 'middleware/auth' })
  .use(bearer())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'secret',
    })
  )
  .derive({ as: 'global' }, async ({ jwt, bearer }) => {   // <-- ubah di sini
    if (!bearer) throw httpError(401, 'Token tidak ditemukan');
    const payload = await jwt.verify(bearer);
    if (!payload) throw httpError(401, 'Token tidak valid atau sudah kadaluarsa');
    return { user: payload as JwtPayload };
  });

export const requireRole = (allowed: JwtPayload['role'][]) =>
  new Elysia({ name: `guard/role/${allowed.join('-')}` })
    .use(authMiddleware)
    .derive({ as: 'global' }, ({ user }) => {   // <-- ubah di sini juga
      if (!allowed.includes(user!.role)) {
        throw httpError(403, `Akses ditolak. Hanya untuk: ${allowed.join(', ')}`);
      }
      return {};
    });
