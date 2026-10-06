"use client";

import { formatJenisAlat } from "@/lib/utils/formatText";
import { formatKg } from "@/lib/utils/formatSatuan";


interface Props {
    instrument: any;
    application: any;
}


export function CerapanIdentity({
    instrument,
    application
}: Props) {

    return (
        <div className="space-y-6 text-sm text-slate-800">
            {/* Bagian I. PEMERIKSAAN */}
            <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-base">I. PEMERIKSAAN</h3>

                {/* Pengujian Untuk */}
                <div className="flex items-center gap-2 text-slate-600">
                    <span>Pengujian untuk</span>
                    <span>:</span>
                    <span className="font-medium text-slate-900">
                        {formatJenisAlat(application.layanan)}
                    </span>
                </div>

                {/* Tabel Pemilik & Tanggal */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-slate-200">
                            <tr>
                                <td className="px-4 py-2.5 w-1/3 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">
                                    Pemilik
                                </td>
                                <td className="px-4 py-2.5 text-slate-900">
                                    {application.companyName}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2.5 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">
                                    Tanggal Pengujian
                                </td>
                                <td className="px-4 py-2.5 text-slate-900">
                                    {
                                        application.jadwalTanggal
                                            ?
                                            new Date(application.jadwalTanggal)
                                                .toLocaleDateString("id-ID")
                                            :
                                            "-"
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2.5 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">
                                    Pegawai Berhak
                                </td>
                                <td className="px-4 py-2.5 text-slate-900">
                                    {application.petugasName} / {application.nipPetugas}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bagian Data UTTP */}
            <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-base">Data UTTP</h3>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-slate-200">
                            <tr>
                                <td className="px-4 py-2.5 w-1/3 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">
                                    Kelas Keakurasian
                                </td>
                                <td className="px-4 py-2.5 text-slate-900">
                                    {instrument.kelas}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2.5 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">
                                    Kapasitas Maksimum (Max)
                                </td>
                                <td className="px-4 py-2.5 text-slate-900">
                                    {formatKg(
                                        instrument.kapasitasMaksimum,
                                        instrument.kapasitasUnit
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2.5 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">
                                    Kapasitas Minimum (Min)
                                </td>
                                <td className="px-4 py-2.5 text-slate-900">
                                    {formatKg(
                                        instrument.kapasitasMinimum,
                                        instrument.kapasitasUnit
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2.5 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">
                                    Interval skala verifikasi (e)
                                </td>
                                <td className="px-4 py-2.5 text-slate-900">
                                    {formatKg(
                                        instrument.nilaiE,
                                        instrument.dayabacaUnit
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2.5 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">
                                    Merek / Type / No. Seri
                                </td>
                                <td className="px-4 py-2.5 text-slate-900">
                                    {instrument.merek} / {instrument.model} / {instrument.nomorSeri}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}