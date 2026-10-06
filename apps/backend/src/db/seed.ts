import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('🌱 Memulai proses seeding data...');

    const adminEmail = 'admin@metrologi.com';

    // 1. Cek apakah admin default sudah ada
    const [existingAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.email, adminEmail))
        .limit(1);

    if (existingAdmin) {
        console.log('⚠️ Akun Admin sudah ada di database. Seeding dilewati.');
        process.exit(0);
    }

    // 2. Buat password hash untuk admin default (Password: "admin12345")
    const hashedPassword = await Bun.password.hash('admin12345', {
        algorithm: 'bcrypt',
        cost: 12,
    });

    // 3. Insert data admin ke tabel users
    await db.insert(users).values({
        id: crypto.randomUUID(),
        name: 'Super Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        nip: '199001012020011001', // Contoh NIP dummy untuk admin
    });

    console.log('✅ Seeding berhasil! Akun Admin dibuat:');
    console.log(`   Email   : ${adminEmail}`);
    console.log(`   Password: admin12345`);
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Terjadi kesalahan saat seeding:', err);
    process.exit(1);
});