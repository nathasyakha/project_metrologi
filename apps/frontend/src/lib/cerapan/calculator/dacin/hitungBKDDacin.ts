interface Input {
    kapasitasMaksimum: number;
    muatanUji: number;
    layanan: "TERA" | "TERA_ULANG";
}


export function hitungBKDDacin({

    kapasitasMaksimum,
    muatanUji,
    layanan,

}: Input) {


    /*
    ============================
    BKD DACIN

    BKD = (Max + 3m) / 3000

    Max = kapasitas maksimum
    m   = muatan uji

    ============================
    */


    let bkd =

        (
            kapasitasMaksimum
            +
            (2 * muatanUji)

        )
        /
        3000;



    if (layanan === "TERA_ULANG") {
        bkd =
            bkd * 2;
    }

    return Number(
        bkd.toFixed(4)
    );

}