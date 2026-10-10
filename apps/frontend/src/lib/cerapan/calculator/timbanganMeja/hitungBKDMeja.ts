interface Input {

    kapasitasMaksimum: number;

    muatanUji: number;

}


export function hitungBKDMeja({

    kapasitasMaksimum,

    muatanUji

}: Input) {


    /*
    ============================
    BKD TIMBANGAN MEJA

    BKD = (Max + 3m) / 3000

    Max = kapasitas maksimum
    m   = muatan uji

    ============================
    */


    const bkd =

        (
            kapasitasMaksimum
            +
            (2 * muatanUji)

        )
        /
        3000;



    return Number(
        bkd.toFixed(3)
    );

}