import { HandlerContext } from "@/lib/cerapan/types/handler";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";

export function handleRepeatability({
    key,
    updated,
    index
}: HandlerContext) {
    if (
        key !== "penunjukan" &&
        key !== "imbuh" &&
        key !== "muatanUji"
    ) {
        return;
    }

    if (!Array.isArray(updated) || updated.length === 0) return;

    // Jika satu muatan diubah, samakan ketiga baris.
    if (key === "muatanUji") {
        const raw = updated[index]?.muatanUji;
        const valid =
            raw !== null &&
            raw !== undefined &&
            raw !== "" &&
            Number.isFinite(Number(raw));

        const muatanUji = valid ? Number(raw) : null;

        updated.forEach((row: any) => {
            row.muatanUji = muatanUji;

            const kapasitasMaksimumKg = Number(row.kapasitasMaksimum);
            if (
                muatanUji === null ||
                muatanUji <= 0 ||
                !Number.isFinite(kapasitasMaksimumKg) ||
                kapasitasMaksimumKg <= 0 ||
                muatanUji > kapasitasMaksimumKg
            ) {
                row.bkd = null;
                return;
            }

            const rule = findBKDRule({
                jenisAlat: row.jenisAlat || "TIMBANGAN_JEMBATAN",
                kelas: row.kelas,
                pengujian: "REPEATABILITY"
            });

            if (!rule) {
                row.bkd = null;
                return;
            }

            // Muatan tabel dalam kg, nilaiE dalam gram; hitungBKD
            // mengharapkan keduanya dalam satuan yang sama.
            const bkd = hitungBKD({
                rule,
                titikUji: muatanUji * 1000,
                nilaiE: Number(row.nilaiE),
                layanan: row.layanan,
                jenisAlat: row.jenisAlat
            });

            row.bkd =
                bkd !== null && Number.isFinite(Number(bkd))
                    ? Number(Number(bkd).toFixed(3))
                    : null;
        });
    }

    // P = IL + 0,5e - ΔL; nilaiE gram -> kg.
    updated.forEach((row: any) => {
        const ilValid =
            row.penunjukan !== null &&
            row.penunjukan !== undefined &&
            row.penunjukan !== "" &&
            Number.isFinite(Number(row.penunjukan));
        const imbuhValid =
            row.imbuh !== null &&
            row.imbuh !== undefined &&
            row.imbuh !== "" &&
            Number.isFinite(Number(row.imbuh));
        const eKg = Number(row.nilaiE) / 1000;

        row.penunjukanSebenarnya =
            ilValid && imbuhValid && Number.isFinite(eKg) && eKg >= 0
                ? Number((Number(row.penunjukan) + 0.5 * eKg - Number(row.imbuh)).toFixed(3))
                : null;
    });

    const last = updated[updated.length - 1];
    const complete = updated.every((row: any) =>
        row.penunjukanSebenarnya !== null &&
        row.penunjukanSebenarnya !== undefined &&
        row.penunjukanSebenarnya !== "" &&
        Number.isFinite(Number(row.penunjukanSebenarnya))
    );

    if (!complete) {
        last.repeat = null;
        last.hasil = null;
        return;
    }

    const p = updated.map((row: any) => Number(row.penunjukanSebenarnya));
    const repeat = Number((Math.max(...p) - Math.min(...p)).toFixed(3));
    last.repeat = repeat;

    // BKD disimpan dalam gram, sedangkan repeat dalam kg.
    const bkdGram = Number(updated[0]?.bkd);
    if (
        updated[0]?.bkd === null ||
        updated[0]?.bkd === undefined ||
        updated[0]?.bkd === "" ||
        !Number.isFinite(bkdGram)
    ) {
        last.hasil = null;
    } else {
        last.hasil = repeat * 1000 <= bkdGram ? "SAH" : "BATAL";
    }
}
