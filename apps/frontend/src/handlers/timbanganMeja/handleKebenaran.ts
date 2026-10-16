import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKDMeja } from "@/lib/cerapan/calculator/timbanganMeja/hitungBKDMeja";


export function handleKebenaran({
    key,
    updated,
    index
}: HandlerContext) {

    const row = {
        ...updated[index]
    };


    /*
    ==========================
    HITUNG ULANG BKD
    ==========================
    */

    if (
        key === "lantaiAT"
    ) {

        const muatanUji =
            Number(row.lantaiAT);

        const kapasitasMaksimum =
            Number(row.kapasitasMaksimum);

        if (
            !Number.isFinite(muatanUji) ||
            muatanUji <= 0 ||
            !Number.isFinite(kapasitasMaksimum) ||
            kapasitasMaksimum <= 0
        ) {

            row.bkd = null;

        } else {

            const bkd =
                hitungBKDMeja({

                    kapasitasMaksimum:
                        kapasitasMaksimum,

                    muatanUji:
                        muatanUji,

                    layanan:
                        row.layanan

                });


            row.bkd =
                Number(
                    bkd.toFixed(3)
                );
        }
    }


    /*
    ==========================
    PENGAMATAN AWAL
    ==========================
    */

    if (key === "pengamatan") {

        if (row.pengamatan === "CEK") {

            row.perluImbuh = true;

            row.imbuh =
                "Tambah imbuh sebesar BKD";

            row.hasil = null;
        }


        else if (row.pengamatan === "SAH") {

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

        if (row.pengamatan !== "CEK") {

            updated[index] = row;

            return true;
        }


        if (
            row.pengamatanSetelahImbuh === "SAH"
        ) {

            row.hasil = "SAH";
        }


        else if (
            row.pengamatanSetelahImbuh === "BATAL"
        ) {

            row.hasil = "BATAL";
        }
    }


    updated[index] = row;

    return true;
}