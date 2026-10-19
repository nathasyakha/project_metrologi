
import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";

export function handleKebenaran({
    key,
    updated,
    index
}: HandlerContext) {

    const row = { ...updated[index] };

    /*
    ==========================
    HITUNG ULANG BKD
    ==========================
    */


    if (
        key === "lantaiAT" ||
        key === "piringAT"
    ) {
        const lantaiAT = row.lantaiAT;

        if (
            lantaiAT == null ||
            lantaiAT === "" ||
            !Number.isFinite(Number(lantaiAT)) ||
            Number(lantaiAT) <= 0
        ) {
            row.bkd = null;
        } else {
            const muatanUji = Number(lantaiAT);
            row.piringAT = Number((muatanUji / 100).toFixed(3));
            const kapasitasMaksimum = Number(row.kapasitasMaksimum);
            if (
                !Number.isFinite(kapasitasMaksimum) ||
                kapasitasMaksimum <= 0 ||
                muatanUji > kapasitasMaksimum
            ) {
                row.bkd = null;
            } else {
                const rule = findBKDRule({
                    jenisAlat: row.jenisAlat,
                    kelas: row.kelas,
                    pengujian: "KEBENARAN"
                });
                if (rule) {
                    const bkd = hitungBKD({
                        rule,
                        titikUji: muatanUji,
                        nilaiE: Number(row.nilaiE),
                        layanan: row.layanan
                    });
                    row.bkd = bkd !== null ? Number(bkd.toFixed(3)) : null;
                } else {
                    row.bkd = null;
                }
            }
        }
    }


    /*
    ==========================
    PENGAMATAN AWAL
    ==========================
    */

    if (key === "pengamatan") {
        if (row.pengamatan === "CEK_ATAS") {
            row.perluImbuh = true;

            const bkd = Number(row.bkd);
            const imbuhAtas = bkd / 100;

            row.imbuh =
                `Beri imbuh sebesar ${imbuhAtas} g pada piring Anak Timbangan`;

            row.hasil = null;
        } else if (row.pengamatan === "CEK_BAWAH") {
            row.perluImbuh = true;

            row.imbuh =
                "Beri imbuh sebesar BKD pada lantai muatan";

            row.hasil = null;
        } else if (row.pengamatan === "SAH") {
            row.perluImbuh = false;
            row.imbuh = null;
            row.pengamatanSetelahImbuh = null;
            row.hasil = "SAH";
        }
    }

    /*
    ==========================
    SETELAH IMBUH
    ==========================
    */

    if (key === "pengamatanSetelahImbuh") {
        if (
            row.pengamatan !== "CEK_ATAS" &&
            row.pengamatan !== "CEK_BAWAH"
        ) {
            updated[index] = row;
            return true;
        }

        if (row.pengamatanSetelahImbuh === "SAH") {
            row.hasil = "SAH";
        } else if (row.pengamatanSetelahImbuh === "BATAL") {
            row.hasil = "BATAL";
        }
    }

    updated[index] = row;
    return true;
}
