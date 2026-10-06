import Elysia, { t, status as httpError } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { db } from '../db';
import { users } from '../db/schema'; // Sesuaikan jika nama tabel Anda berbeda
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth'; // Import dari file middleware di atas

// ─── 1. PUBLIC ROUTES (Login & Register - Tidak butuh token) ───────────────
const publicAuth = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'secret',
    })
  )
  .post('/register', async ({ body }) => {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1);
    if (existing) throw httpError(409, 'Email sudah terdaftar');

    if (body.nip) {
      const [existingNip] = await db.select({ id: users.id }).from(users).where(eq(users.nip, body.nip)).limit(1);
      if (existingNip) throw httpError(409, 'NIP sudah terdaftar dalam sistem');
    }

    const hashedPassword = await Bun.password.hash(body.password, { algorithm: 'bcrypt', cost: 12 });
    const id = crypto.randomUUID();

    await db.insert(users).values({
      id,
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role,
      nip: body.nip ?? null,
    });

    return { message: 'Registrasi berhasil', data: { id, email: body.email } };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
      role: t.Union([
        t.Literal('admin'), t.Literal('petugas_penera'), t.Literal('pemilik_alat'), t.Literal('kepala'), t.Literal('staf'), t.Literal('pengamat_tera'), t.Literal('pengawas')
      ]),
      nip: t.Optional(t.String({ description: 'Nomor Induk Pegawai (Wajib untuk pegawai)' }))
    }),
    detail: {
      summary: 'Registrasi user baru (bisa untuk pemilik alat atau pegawai dengan NIP)'
    }
  })

  .post('/login', async ({ body, jwt }) => {
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user) throw httpError(401, 'Email atau password salah');

    const isValid = await Bun.password.verify(body.password, user.password);
    if (!isValid) throw httpError(401, 'Email atau password salah');

    const token = await jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 hari
    });

    return { message: 'Login berhasil', token, data: { id: user.id, role: user.role } };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  });

// ─── 2. PRIVATE ROUTES (Butuh token, seperti melihat profile) ──────────────
const privateAuth = new Elysia()
  .use(authMiddleware) // Gunakan middleware di sini
  .get('/me', async ({ user }) => {
    const [userData] = await db.select({
      id: users.id, name: users.name, email: users.email, role: users.role, nip: users.nip
    }).from(users).where(eq(users.id, user.id)).limit(1);

    if (!userData) throw httpError(404, 'User tidak ditemukan');
    return { data: userData };
  });

// ─── 3. ADMIN ROUTES (Khusus Admin untuk melihat data user terdaftar) ─────
const adminAuth = new Elysia()
  .use(authMiddleware)
  .get('/users', async ({ user, set }) => {
    // Validasi tambahan: pastikan hanya admin yang bisa akses
    if (user.role !== 'admin') {
      set.status = 403;
      return { message: 'Akses ditolak. Hanya untuk Admin.' };
    }

    // Ambil semua data user dari database (password disembunyikan demi keamanan)
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      nip: users.nip,
      createdAt: users.createdAt,
    }).from(users);

    return {
      message: 'Berhasil mengambil daftar pengguna terdaftar',
      total: allUsers.length,
      data: allUsers
    };
  }, {
    detail: {
      summary: 'List seluruh user terdaftar (Khusus Admin)',
      security: [{ bearerAuth: [] }]
    }
  });

// ─── 4. EXPORT GABUNGAN ────────────────────────────────────────────────     
export const authRoutes = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  .use(publicAuth)
  .use(privateAuth)
  .use(adminAuth); // Daftarkan rute admin di sini