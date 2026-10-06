import type { BKDRule } from "../rules/bkdRules";


export function hitungRentangBKD(
    rule: BKDRule,
    nilaiE: number
) {


    if (
        !rule ||
        !nilaiE ||
        nilaiE <= 0
    ) {
        return {

            batasBawah: null,

            batasAtas: null

        };
    }



    /*
        Ambil interval BKD nomor 2

        contoh kelas III:

        501e - 2000e
    */


    const interval =
        rule.limits[1];


    if (!interval) {

        return {

            batasBawah: null,

            batasAtas: null

        };

    }



    return {

        batasBawah:
            interval.minE *
            nilaiE,


        batasAtas:
            interval.maxE *
            nilaiE

    };

}