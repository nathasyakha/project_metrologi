import {
    hitungBKDMeja
}
    from "./hitungBKDMeja";


interface Input {

    kapasitasMaksimum: number;

}



export function generateKepekaanMeja(
    data: Input
) {


    const muatanUji =
        data.kapasitasMaksimum;



    const bkd =
        hitungBKDMeja({

            kapasitasMaksimum:
                data.kapasitasMaksimum,

            muatanUji:
                muatanUji

        });



    return [

        {

            lantaiAT:
                muatanUji,

            tembor:
                muatanUji,

            bkd:
                bkd,

            imbuh:
                bkd,

            pengamatan:
                null,

            hasil:
                null

        }

    ];

}