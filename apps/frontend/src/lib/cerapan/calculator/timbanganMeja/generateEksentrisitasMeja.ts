import { hitungBKDMeja } from "./hitungBKDMeja";


interface Input {

    kapasitasMaksimum: number;

}



export function generateEksentrisitasMeja(
    data: Input
) {
    const muatan =
        Math.ceil(
            (
                data.kapasitasMaksimum / 3
            ) / 1000
        ) * 1000;

    const jumlahPosisi = 4;

    const bkd =
        hitungBKDMeja({

            kapasitasMaksimum:
                data.kapasitasMaksimum,

            muatanUji:
                muatan

        });



    return [...Array(jumlahPosisi)].map(

        (_value, index) => {


            return {

                posisiUji:
                    index + 1,

                lantaiAT:
                    muatan,

                tembor:
                    muatan,

                bkd:
                    bkd !== null
                        ?
                        Number(
                            bkd.toFixed(3)
                        )
                        :
                        null,
                pengamatan:
                    null,


                hasil:
                    null,

                /*
                ======================
                UJI TAMBAHAN
                ======================
                */

                perluImbuh:
                    false,


                imbuh:
                    null,


                pengamatanSetelahImbuh:
                    null,


                hasilSetelahImbuh:
                    null

            };


        }

    );

}