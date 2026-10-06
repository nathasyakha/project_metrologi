import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { type Certificate, type PermohonanPeneraan } from "@/lib/peneraan";
import { Printer, X, ShieldCheck, Scale, Award } from "lucide-react";

interface CertificateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  permohonan?: PermohonanPeneraan | null;
}

export function CertificateViewModal({
  isOpen,
  onClose,
  certificate,
  permohonan,
}: CertificateViewModalProps) {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const company = permohonan?.companyName || certificate.companyName || "Pemilik Alat";
  const address = permohonan?.companyAddress || "-";
  const brand = permohonan?.instrumentBrand || certificate.instrumentBrand || "-";
  const type = permohonan?.instrumentType || certificate.instrumentType || "-";
  const serial = permohonan?.instrumentSerial || certificate.instrumentSerial || "-";
  const capacity = permohonan?.capacityValue
    ? `${permohonan.capacityValue} ${permohonan.capacityUnit}`
    : "-";
  const dayabaca = permohonan?.dayabaca
    ? `${permohonan.dayabaca} ${permohonan.dayabacaUnit}`
    : "-";
  const instrumentClass = permohonan?.class ? `Kelas ${permohonan.class}` : "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl my-6 print:border-0 print:shadow-none print:my-0">
        {/* ACTION BAR (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-brass-500" />
            <span className="text-sm font-semibold text-slate-800">
              Pratinjau Sertifikat Peneraan (SKHP)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} size="sm" className="gap-1.5">
              <Printer className="h-4 w-4" /> Cetak / Unduh PDF
            </Button>
            <Button onClick={onClose} variant="secondary" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL CERTIFICATE DOCUMENT */}
        <div className="p-8 sm:p-12 text-slate-900 space-y-6 font-sans">
          {/* HEADER RESMI KOP SURAT */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="flex justify-center items-center gap-3 mb-1">
              <Scale className="h-8 w-8 text-navy-950" strokeWidth={2} />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  REPUBLIK INDONESIA
                </p>
                <p className="text-base font-extrabold uppercase text-navy-950 tracking-wider">
                  UNIT PELAKSANA TEKNIS METROLOGI LEGAL
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Pelayanan Tera dan Tera Ulang Alat-alat Ukur, Takar, Timbang dan Perlengkapannya (UTTP)
            </p>
          </div>

          {/* JUDUL SERTIFIKAT */}
          <div className="text-center space-y-1">
            <h1 className="text-lg font-bold tracking-wide uppercase underline underline-offset-4 text-navy-950">
              SURAT KETERANGAN HASIL PENGUJIAN (SKHP)
            </h1>
            <p className="text-xs font-mono text-slate-600">
              Nomor: <strong className="text-slate-900">{certificate.certificateNumber}</strong>
            </p>
          </div>

          <p className="text-xs text-justify leading-relaxed text-slate-700">
            Berdasarkan Undang-Undang Republik Indonesia Nomor 2 Tahun 1981 tentang Metrologi Legal,
            telah dilakukan pengujian dan verifikasi terhadap alat ukur, takar, timbang dan perlengkapannya dengan rincian sebagai berikut:
          </p>

          {/* TABEL DATA PEMILIK & ALAT */}
          <div className="rounded border border-slate-300 divide-y divide-slate-200 text-xs">
            <div className="bg-slate-50/80 px-4 py-2 font-semibold text-slate-800">
              A. IDENTITAS PEMILIK
            </div>
            <div className="grid grid-cols-3 px-4 py-2">
              <span className="text-slate-500 font-medium">Nama Perusahaan / Pemilik</span>
              <span className="col-span-2 font-semibold text-slate-900">: {company}</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2">
              <span className="text-slate-500 font-medium">Alamat</span>
              <span className="col-span-2 text-slate-800">: {address}</span>
            </div>

            <div className="bg-slate-50/80 px-4 py-2 font-semibold text-slate-800">
              B. SPESIFIKASI ALAT UKUR (UTTP)
            </div>
            <div className="grid grid-cols-3 px-4 py-2">
              <span className="text-slate-500 font-medium">Jenis / Tipe Alat</span>
              <span className="col-span-2 text-slate-900">: {type}</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2">
              <span className="text-slate-500 font-medium">Merek / Pabrik Pembuat</span>
              <span className="col-span-2 text-slate-900">: {brand}</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2">
              <span className="text-slate-500 font-medium">Nomor Seri</span>
              <span className="col-span-2 font-mono text-slate-900">: {serial}</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2">
              <span className="text-slate-500 font-medium">Kapasitas Maksimum</span>
              <span className="col-span-2 text-slate-900">: {capacity}</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2">
              <span className="text-slate-500 font-medium">Daya Baca (e / d)</span>
              <span className="col-span-2 text-slate-900">: {dayabaca}</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2">
              <span className="text-slate-500 font-medium">Kelas Ketelitian</span>
              <span className="col-span-2 text-slate-900">: {instrumentClass}</span>
            </div>
          </div>

          {/* KESIMPULAN HASIL UJI */}
          <div className="rounded-lg border-2 border-emerald-600/30 bg-emerald-50/50 p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                KESIMPULAN HASIL PENGUJIAN:
              </p>
              <p className="text-sm font-bold text-emerald-950">
                SAH DITERA SESUAI SYARAT TEKNIS METROLOGI LEGAL
              </p>
              <p className="text-[11px] text-emerald-800">
                Tanda Tera Sah telah dibubuhkan pada bagian alat yang telah ditentukan.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block">Masa Berlaku Hingga:</span>
              <span className="text-xs font-bold text-slate-900 bg-white border border-emerald-200 px-2.5 py-1 rounded inline-block mt-0.5">
                {formatDate(certificate.expiryDate)}
              </span>
            </div>
          </div>

          {/* TANDA TANGAN RESMI */}
          <div className="pt-6 flex justify-between items-end text-xs">
            <div className="space-y-1">
              <p className="text-slate-500">Diterbitkan pada:</p>
              <p className="font-semibold text-slate-800">{formatDate(certificate.issueDate)}</p>
              <div className="mt-3 p-2 border border-slate-200 rounded w-28 text-center bg-slate-50">
                <div className="text-[9px] text-slate-400 font-mono uppercase">Verifikasi Digital</div>
                <div className="text-[10px] font-bold text-navy-950 mt-0.5">TERDAFTAR</div>
              </div>
            </div>

            <div className="text-center space-y-12">
              <div>
                <p className="text-slate-500">Kepala UPTD Metrologi Legal /</p>
                <p className="font-semibold text-slate-800">Pejabat Berwenang</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900">KEPALA DINAS METROLOGI</p>
                <p className="text-[11px] text-slate-500">NIP. 19780512 200501 1 002</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
