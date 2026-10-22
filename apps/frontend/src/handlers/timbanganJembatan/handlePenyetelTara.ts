
import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handlePenyetelTara({
    key,
    updated,
    index
}: HandlerContext) {
    if (
        key !== "penunjukan10e" &&
        key !== "penunjukan025e" &&
        key !== "penunjukan05e"
    ) {
        return;
    }

    if (!Array.isArray(updated) || !updated[index]) {
        return;
    }

    const row = updated[index];

    /*
    ==================================
    VALIDASI NILAI E DAN PENUNJUKAN
    Semua satuan menggunakan kg.
    ==================================
    */

    const e = Number(row.nilaiE);

    const acuanTerisi =
        row.penunjukan10e !== null &&
        row.penunjukan10e !== undefined &&
        row.penunjukan10e !== "" &&
        Number.isFinite(Number(row.penunjukan10e));

    if (!acuanTerisi || !Number.isFinite(e) || e <= 0) {
        row.hasil = null;
        return;
    }

    const acuan = Number(row.penunjukan10e);

    /*
    ==================================
    LANGKAH 5: IMBUH 0,25e
    ==================================

    Jika tidak berubah, lanjut ke 0,5e.
    Jika berubah stabil sebesar +1e dari
    penunjukan acuan, hasil BATAL.
    */

    const penunjukan025Terisi =
        row.penunjukan025e !== null &&
        row.penunjukan025e !== undefined &&
        row.penunjukan025e !== "" &&
        Number.isFinite(Number(row.penunjukan025e));

    if (!penunjukan025Terisi) {
        row.hasil = null;
        return;
    }

    const penunjukan025 = Number(row.penunjukan025e);
    const selisih025 = penunjukan025 - acuan;

    const toleransi = Math.max(1e-9, e * 1e-6);

    if (Math.abs(selisih025 - e) <= toleransi) {
        row.hasil = "BATAL";
        return;
    }

    // Tidak berubah: lanjutkan evaluasi pada 0,5e.
    if (Math.abs(selisih025) <= toleransi) {
        const penunjukan05Terisi =
            row.penunjukan05e !== null &&
            row.penunjukan05e !== undefined &&
            row.penunjukan05e !== "" &&
            Number.isFinite(Number(row.penunjukan05e));

        if (!penunjukan05Terisi) {
            row.hasil = null;
            return;
        }

        /*
        ==================================
        LANGKAH 6: IMBUH 0,5e
        ==================================
        */

        const penunjukan05 = Number(row.penunjukan05e);
        const selisih05 = penunjukan05 - acuan;

        if (Math.abs(selisih05 - e) <= toleransi) {
            row.hasil = "SAH";
        } else if (Math.abs(selisih05) <= toleransi) {
            row.hasil = "BATAL";
        } else {
            row.hasil = null;
        }

        return;
    }

    // Perubahan lain tidak cukup untuk menetapkan hasil.
    row.hasil = null;
}
