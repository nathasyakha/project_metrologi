export function hitungBatasBawah(
    jenisAlat: string,
    kelas: string,
    dayaBaca: number
): number | null {


    if (
        !jenisAlat ||
        !kelas ||
        !dayaBaca ||
        dayaBaca <= 0
    ) {
        return null;
    }


    const alatValid = [
        "TIMBANGAN_ELEKTRONIK",
        "TIMBANGAN_PEGAS",
    ].includes(
        jenisAlat
    );


    if (!alatValid) {

        return null;

    }



    const e =
        Number(dayaBaca);



    let faktor = 0;



    switch (
    kelas
        .toUpperCase()
        .trim()
    ) {

        case "I":
            faktor = 50000;
            break;


        case "II":
            faktor = 5000;
            break;


        case "III":
            faktor = 500;
            break;


        case "IIII":
            faktor = 50;
            break;


        default:
            return null;

    }



    return faktor * e;

}

export function hitungBatasAtas(
    kelas: string,
    dayaBaca: number
) {

    switch (
    kelas.toUpperCase()
    ) {

        case "I":
            return 200000 * dayaBaca;


        case "II":
            return 20000 * dayaBaca;


        case "III":
            return 2000 * dayaBaca;


        case "IIII":
            return 200 * dayaBaca;


        default:
            return null;

    }

}
