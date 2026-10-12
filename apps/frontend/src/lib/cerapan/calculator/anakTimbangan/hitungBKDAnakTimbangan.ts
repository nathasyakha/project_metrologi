export function hitungBKDAnakTimbangan(
    nominal: number
) {


    /*
    =============================
    BKD ANAK TIMBANGAN KELAS M3
    satuan output gram
    =============================
    */


    const rules: any = {


        5000:
            2500 / 1000,


        2000:
            1000 / 1000,


        1000:
            500 / 1000,


        500:
            250 / 1000,


        200:
            100 / 1000,


        100:
            50 / 1000,


        50:
            30 / 1000,


        20:
            25 / 1000,


        10:
            20 / 1000,


        5:
            16 / 1000,


        2:
            12 / 1000,


        1:
            10 / 1000

    };



    return rules[nominal] ?? null;

}