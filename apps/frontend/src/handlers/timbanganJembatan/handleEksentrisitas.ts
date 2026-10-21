import { HandlerContext } from "@/lib/cerapan/types/handler";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";

export function handleEksentrisitas({
    key,
    updated,
    index
}: HandlerContext) {
    if (
        key !== "muatanUji" &&
        key !== "penunjukan" &&
        key !== "imbuh"
    ) {
        return;
    }

    if (!Array.isArray(updated) || updated.length === 0) {
        return;
    }

    /*
    ==================================
    1. SINKRONISASI MUATAN UJI
    Jika satu baris diubah, ketiga baris
    mengikuti nilai muatan uji yang baru.
    ==================================
    */
    if (key === "muatanUji") {
        const nilaiBaru = updated[index]?.muatanUji;

        const valid =
            nilaiBaru !== null &&
            nilaiBaru !== undefined &&
            nilaiBaru !== "" &&
            Number.isFinite(Number(nilaiBaru));

        const muatanUji = valid
            ? Number(nilaiBaru)
            : null;

        updated.forEach((row: any) => {
            row.muatanUji = muatanUji;
        });
    }

    /*
    ==================================
    2. HITUNG ULANG BKD
    Muatan uji dan kapasitas: kg.
    nilaiE: gram.
    hitungBKD menerima titikUji dalam gram.
    Hasil BKD Timbangan Jembatan dalam kg.
    ==================================
    */
    updated.forEach((row: any) => {
        const muatanUji = Number(row.muatanUji);
        const kapasitasMaksimum = Number(
            row.kapasitasMaksimum
        );

        if (
            row.muatanUji == null ||
            row.muatanUji === "" ||
            !Number.isFinite(muatanUji) ||
            muatanUji <= 0 ||
            !Number.isFinite(kapasitasMaksimum) ||
            kapasitasMaksimum <= 0 ||
            muatanUji > kapasitasMaksimum
        ) {
            row.bkd = null;
            row.kesalahanPenunjukan = null;
            row.hasil = null;
            return;
        }

        const rule = findBKDRule({
            jenisAlat:
                row.jenisAlat || "TIMBANGAN_JEMBATAN",
            kelas: row.kelas,
            pengujian: "EKSENTRISITAS"
        });

        if (!rule) {
            row.bkd = null;
            row.hasil = null;
            return;
        }

        const bkd = hitungBKD({
            rule,
            titikUji: muatanUji * 1000,
            nilaiE: Number(row.nilaiE),
            layanan: row.layanan,
            jenisAlat: "TIMBANGAN_JEMBATAN"
        });

        row.bkd =
            bkd !== null &&
                Number.isFinite(Number(bkd))
                ? Number(Number(bkd).toFixed(4))
                : null;
    });

    /*
    ==================================
    3. HITUNG KESALAHAN PENUNJUKAN
    E = IL + 0,5e - ΔL - L

    IL, ΔL, L, dan E: kg.
    nilaiE: gram, dikonversi menjadi kg.
    ==================================
    */
    updated.forEach((row: any) => {
        const ilTerisi =
            row.penunjukan !== null &&
            row.penunjukan !== undefined &&
            row.penunjukan !== "" &&
            Number.isFinite(Number(row.penunjukan));

        const imbuhTerisi =
            row.imbuh !== null &&
            row.imbuh !== undefined &&
            row.imbuh !== "" &&
            Number.isFinite(Number(row.imbuh));

        const muatanTerisi =
            row.muatanUji !== null &&
            row.muatanUji !== undefined &&
            row.muatanUji !== "" &&
            Number.isFinite(Number(row.muatanUji));

        const eGram = Number(row.nilaiE);

        if (
            !ilTerisi ||
            !imbuhTerisi ||
            !muatanTerisi ||
            !Number.isFinite(eGram) ||
            eGram < 0
        ) {
            row.kesalahanPenunjukan = null;
            row.hasil = null;
            return;
        }

        const eKg = eGram / 1000;

        row.kesalahanPenunjukan = Number(
            (
                (Number(row.penunjukan) + 0.5 * eKg -
                    (Number(row.imbuh) + Number(row.muatanUji)))
            ).toFixed(3)
        );

        /*
        ==================================
        4. EVALUASI SAH / BATAL
        BKD dan kesalahan dibandingkan dalam kg.
        ==================================
        */
        if (
            row.bkd === null ||
            row.bkd === undefined ||
            row.bkd === "" ||
            !Number.isFinite(Number(row.bkd))
        ) {
            row.hasil = null;
            return;
        }

        row.hasil =
            Math.abs(row.kesalahanPenunjukan) <=
                Number(row.bkd)
                ? "SAH"
                : "BATAL";
    });
}
