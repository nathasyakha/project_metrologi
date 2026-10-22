import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";

export function handleKebenaran({
    key,
    updated,
    index
}: HandlerContext) {
    const keys = [
        "standar",
        "ballast",
        "penunjukan",
        "imbuh"
    ];

    if (!keys.includes(key)) return;
    if (!Array.isArray(updated) || !updated[index]) return;

    const row = updated[index];

    const parseNumber = (value: unknown): number | null => {
        if (
            value === null ||
            value === undefined ||
            value === "" ||
            value === "-"
        ) {
            return null;
        }

        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    };

    const standar = parseNumber(row.standar);
    const ballast = parseNumber(row.ballast);
    const penunjukan = parseNumber(row.penunjukan);
    const imbuh = parseNumber(row.imbuh);
    const nilaiE = Number(row.nilaiE);

    /*
    ==================================
    HITUNG L = STANDAR + BALLAST
    ==================================
    */

    if (standar !== null && ballast !== null) {
        row.standarBallast = Number(
            (standar + ballast).toFixed(4)
        );
    } else if (
        standar !== null &&
        (row.ballast === "-" ||
            row.ballast === null ||
            row.ballast === undefined ||
            row.ballast === "")
    ) {
        row.standarBallast = standar;
    } else {
        row.standarBallast = null;
    }

    const L = parseNumber(row.standarBallast);

    /*
    ==================================
    HITUNG PENUNJUKAN SEBENARNYA
    P = IL + 0,5e - ΔL
    Satuan kg
    ==================================
    */

    const eValid =
        Number.isFinite(nilaiE) && nilaiE > 0;

    if (
        penunjukan === null ||
        imbuh === null ||
        !eValid
    ) {
        row.penunjukanSebenarnya = null;
        row.kesalahan = null;
        row.bkd = null;
        row.hasil = null;
        return;
    }

    const P = Number(
        (
            penunjukan +
            0.5 * nilaiE -
            imbuh
        ).toFixed(6)
    );

    row.penunjukanSebenarnya = P;

    /*
    ==================================
    L KOSONG: P TETAP DITAMPILKAN
    ==================================
    */

    if (L === null) {
        row.kesalahan = null;
        row.bkd = null;
        row.hasil = null;
        return;
    }

    /*
    ==================================
    HITUNG KESALAHAN TIMBANGAN
    E = P - L
    Satuan kg
    ==================================
    */

    const kesalahan = Number(
        (P - L).toFixed(6)
    );

    row.kesalahan = kesalahan;

    /*
    ==================================
    HITUNG BKD
    ==================================
    */

    const rule = findBKDRule({
        jenisAlat: row.jenisAlat,
        kelas: row.kelas,
        pengujian: "KEBENARAN"
    });

    if (!rule) {
        row.bkd = null;
        row.hasil = null;
        return;
    }

    const bkd = hitungBKD({
        rule,
        titikUji: L * 1000,
        nilaiE: nilaiE * 1000,
        layanan: row.layanan,
        jenisAlat: row.jenisAlat
    });

    if (
        bkd === null ||
        !Number.isFinite(Number(bkd))
    ) {
        row.bkd = null;
        row.hasil = null;
        return;
    }

    row.bkd = Number(Number(bkd).toFixed(6));

    /*
    ==================================
    EVALUASI HASIL
    ==================================
    */

    row.hasil =
        Math.abs(kesalahan) <= row.bkd
            ? "SAH"
            : "BATAL";
}
