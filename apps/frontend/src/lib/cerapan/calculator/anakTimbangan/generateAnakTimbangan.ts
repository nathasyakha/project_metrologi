import { hitungBKDAnakTimbangan } from "./hitungBKDAnakTimbangan";

interface Input {
    kelas:
    string;
}

export function generateAnakTimbangan(
    data: Input
) {
    const kelasAT = "M3";

    const nominal = [
        1000,
        500,
        200,
        100,
        50

    ];



    return nominal.map(

        (nilai, index) => {


            return {

                nomor:
                    index + 1,

                kelas: data.kelas,
                kelasAT:
                    kelasAT,


                nominal:
                    nilai,


                bkd:
                    hitungBKDAnakTimbangan(
                        nilai
                    ),


                kesalahan:
                    null,


                hasil:
                    null

            };

        }

    );

}