import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

import { authRoutes } from './routes/auth';
import { ownerRoutes } from './routes/owners';
import { instrumentRoutes } from './routes/instruments';
import { observationRoutes } from './routes/observations';
import { certificateRoutes } from './routes/certificates';
import { qualityDocumentRoutes } from './routes/quality-documents';
import { pengawasanRoutes } from './routes/pengawasan';
import { permohonanRoutes } from './routes/permohonan';


export const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Legal Metrology System API',
          version: '1.0.0',
          description:
            'API untuk Sistem Metrologi Legal: pendaftaran alat ukur, pencatatan serapan pengujian, dan penerbitan sertifikat.',
        },
        tags: [
          { name: 'Permohonan Peneraan', description: 'Pengajuan, penjadwalan, dan tracking permohonan tera' },
          { name: 'Alat Ukur', description: 'Pendaftaran dan manajemen alat ukur' },
          { name: 'Cerapan Pengujian', description: 'Pencatatan hasil pengujian alat ukur' },
          { name: 'Sertifikat', description: 'Penerbitan dan verifikasi sertifikat' },
          { name: 'Data Pemilik Alat', description: 'Data Pemilik Alat' },
          { name: 'Dokumen Mutu', description: 'Dokumen Mutu' },
          { name: 'Pengawasan', description: 'Pengawasan' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
      path: '/docs',
    })
  )
  .get('/', () => ({
    message: 'Welcome to Legal Metrology System API',
    docs: '/docs',
    version: '1.0.0',
  }))
  .use(authRoutes)
  .use(ownerRoutes)
  .use(instrumentRoutes)
  .use(permohonanRoutes)
  .use(observationRoutes)
  .use(certificateRoutes)
  .use(qualityDocumentRoutes)
  .use(pengawasanRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(
  `📚 Swagger docs: http://${app.server?.hostname}:${app.server?.port}/docs`
);
