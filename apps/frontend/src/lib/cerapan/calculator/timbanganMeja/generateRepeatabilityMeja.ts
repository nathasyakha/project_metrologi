import {
    hitungBKDMeja
}
    from "./hitungBKDMeja";


interface Input {

    kapasitasMaksimum: number;

}



export function generateRepeatabilityMeja(
    data: Input
) {


    const muatanUji =
        data.kapasitasMaksimum;

    const jumlahPosisi = 3;

    const bkd =
        hitungBKDMeja({

            kapasitasMaksimum:
                data.kapasitasMaksimum,

            muatanUji:
                muatanUji

        });



    return [...Array(jumlahPosisi)].map(

        (_value, index) => {


            return {

                nomor:
                    index + 1,

                lantaiAT:
                    muatanUji,

                tembor:
                    muatanUji,

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