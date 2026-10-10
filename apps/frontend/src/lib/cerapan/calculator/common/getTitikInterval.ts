interface ParamTitikTengah {

    jenisAlat: string;

    batasBawah: number | null;

    batasAtas: number | null;

    kapasitasMax: number | null;

}



export function hitungTitikTengah({

    jenisAlat,

    batasBawah,

    batasAtas,

    kapasitasMax,

}: ParamTitikTengah): number | null {


    if (
        !jenisAlat ||
        batasAtas === null ||
        batasAtas === undefined
    ) {
        return null;
    }



    const isTimbanganValid = [

        "TIMBANGAN_ELEKTRONIK",

        "TIMBANGAN_PEGAS",

        "TIMBANGAN_SENTISIMAL",

        "TIMBANGAN_BOBOT_INGSUT",

        "TIMBANGAN_JEMBATAN"

    ].includes(jenisAlat);



    if (!isTimbanganValid) {

        return null;

    }



    /*
        Jika batas atas sama dengan kapasitas maksimum

        titik tengah =
        ROUND(
          ((batas bawah + batas atas)/2)
          /10000
        )
        ×10000
    */

    if (
        batasAtas === kapasitasMax
    ) {


        if (
            batasBawah === null ||
            batasBawah === undefined
        ) {
            return null;
        }


        const rataRata =
            (
                batasBawah +
                batasAtas
            )
            /
            2;



        const titik =
            Math.round(
                rataRata / 10000
            )
            *
            10000;



        return titik;

    }



    /*
        Jika batas atas tidak sama dengan kapasitas maksimum
        titik tengah = batas atas
    */

    return batasAtas;

}