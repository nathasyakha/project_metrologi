import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";

export function handleRepeatability({
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
            row.piringAT = null;
            row.bkd = null;
        } else {
            const muatanUji = Number(lantaiAT);

            // Piring AT = Lantai AT / 100
            row.piringAT = Number(
                (muatanUji / 100).toFixed(3)
            );

            const kapasitasMaksimum =
                Number(row.kapasitasMaksimum);

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
                    pengujian: "REPEATABILITY"
                });

                if (rule) {
                    const bkd = hitungBKD({
                        rule,
                        titikUji: muatanUji,
                        nilaiE: Number(row.nilaiE),
                        layanan: row.layanan
                    });

                    row.bkd =
                        bkd !== null
                            ? Number(bkd.toFixed(3))
                            : null;
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
            const bkd = row.bkd;
            const imbuhAtas = Number(bkd) / 100;
            row.imbuh = "beri imbuh sebesar " + imbuhAtas + " g pada piring Anak timbangan"
            row.hasil = null;
        }
        else if (row.pengamatan === "CEK_BAWAH") {
            row.perluImbuh = true;
            row.imbuh = "beri imbuh sebesar BKD pada lantai muatan"
            row.hasil = null;
        }
        else if (row.pengamatan === "SAH") {
            row.perluImbuh = false;
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
            return;
        }

        if (row.pengamatanSetelahImbuh === "SAH") {
            row.hasil = "SAH";
        }
        else if (row.pengamatanSetelahImbuh === "BATAL") {
            row.hasil = "BATAL";
        }
    }
    updated[index] = row;
    return true;
}