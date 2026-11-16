import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";

export function handleRepeatability({
    key,
    updated,
    index
}: HandlerContext) {

    if (
        key !== "muatanUji" &&
        key !== "penunjukan" &&
        key !== "penunjukan2" &&
        key !== "penunjukanSetelahImbuh" &&
        key !== "penunjukanTambahan1" &&
        key !== "penunjukanTambahan2" &&
        key !== "penunjukanTambahan3"
    ) {
        return;
    }

    if (!Array.isArray(updated) || updated.length < 3) {
        return;
    }

    // =================================
    // HITUNG ULANG BKD
    // =================================

    if (key === "muatanUji") {

        const raw = updated[index]?.muatanUji;

        const valid =
            raw !== null &&
            raw !== undefined &&
            raw !== "" &&
            Number.isFinite(Number(raw));

        const muatanUji = valid
            ? Number(raw)
            : null;

        // Ketiga baris Repeatability menggunakan muatan sama.
        updated.forEach((row: any) => {

            row.muatanUji = muatanUji;

            if (
                muatanUji === null ||
                muatanUji <= 0 ||
                !row.jenisAlat ||
                !row.kelas ||
                !row.nilaiE ||
                !row.layanan
            ) {
                row.bkd = null;
                return;
            }

            const rule = findBKDRule({
                jenisAlat: row.jenisAlat,
                kelas: row.kelas,
                pengujian: "REPEATABILITY"
            });

            if (!rule) {
                row.bkd = null;
                return;
            }

            const bkd = hitungBKD({
                rule,
                titikUji: muatanUji,
                nilaiE: Number(row.nilaiE),
                layanan: row.layanan,
                jenisAlat: row.jenisAlat
            });

            row.bkd =
                bkd !== null &&
                    Number.isFinite(Number(bkd))
                    ? Number(Number(bkd).toFixed(3))
                    : null;

        });
    }



    // =================================
    // EVALUASI IMBUH 0,5e
    // =================================

    updated.forEach((row: any) => {

        if (
            Number.isFinite(Number(row.penunjukan)) &&
            row.penunjukan !== null &&
            row.penunjukan !== "" &&
            Number.isFinite(Number(row.penunjukanSetelahImbuh)) &&
            row.penunjukanSetelahImbuh !== null &&
            row.penunjukanSetelahImbuh !== ""
        ) {
            if (
                Number(row.penunjukan) ===
                Number(row.penunjukanSetelahImbuh)
            ) {
                row.pengamatan05e =
                    "Tetap, +0,5e sampai penunjukan bertambah; angkat 0,5e dari lantai muatan";
            } else {
                row.pengamatan05e =
                    "Berubah; angkat 0,5e dari lantai muatan";
            }
        } else {
            row.pengamatan05e = null;
        }

    });

    // =================================
    // BATAS REPEATABILITY
    // =================================

    if (updated.length < 3) return;

    const batas =
        updated[0].layanan === "TERA"
            ? updated[0].nilaiE
            : updated[0].nilaiE * 2;

    const p1 = updated[0]?.penunjukan2;
    const p2 = updated[1]?.penunjukan2;
    const p3 = updated[2]?.penunjukan2;

    const isValidNumber = (value: any): boolean =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== "" &&
        Number.isFinite(Number(value));

    const valid =
        isValidNumber(p1) &&
        isValidNumber(p2) &&
        isValidNumber(p3);

    if (!valid) {
        updated[2].repeat = null;
        updated[2].hasil = null;
        return;
    }

    const nilai = [p1, p2, p3].map(Number);

    const pMax = Math.max(...nilai);
    const pMin = Math.min(...nilai);

    const repeat = Number(
        (pMax - pMin).toFixed(3)
    );

    updated[2].repeat = repeat;

    updated[2].hasil =
        repeat <= batas ? "SAH" : "BATAL";

    // =================================
    // CEK TAMBAHAN
    // =================================

    const selisih = Math.abs(
        Number(p1) - Number(p2)
    );

    updated[2].selisih = selisih;

    if (selisih === batas) {
        updated[2].perluUjiTambahan = true;
        updated[2].tampilTambahan = true;
    } else {
        updated[2].perluUjiTambahan = false;
        updated[2].tampilTambahan = false;
    }
}
