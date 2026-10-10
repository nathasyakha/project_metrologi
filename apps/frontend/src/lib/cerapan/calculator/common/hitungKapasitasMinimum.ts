/**
 * Menghitung kapasitas minimum timbangan
 * berdasarkan kelas keakurasian dan nilai e
 *
 * Input:
 * kelas : I, II, III, IIII
 * e     : nilai skala verifikasi
 *
 * Output:
 * kapasitas minimum dalam satuan yang sama dengan e
 */


export function hitungKapasitasMinimum(
    kelas: string,
    e: number
): number | null {


    if (
        !kelas ||
        !e ||
        e <= 0
    ) {
        return null;
    }


    const kelasNormalized =
        kelas
            .toString()
            .trim()
            .toUpperCase();



    switch (kelasNormalized) {


        case "I":
        case "1":

            return (
                e >= 0.001
                    ?
                    100 * e
                    :
                    null
            );



        case "II":
        case "2":


            if (
                e >= 0.001 &&
                e <= 0.05
            ) {

                return 20 * e;

            }


            if (e >= 0.1) {

                return 50 * e;

            }


            return null;




        case "III":
        case "3":


            if (
                (e >= 0.1 && e <= 2) ||
                e >= 5
            ) {

                return 20 * e;

            }


            return null;




        case "IIII":
        case "4":


            if (e >= 5) {

                return 10 * e;

            }


            return null;



        default:

            return null;

    }

}