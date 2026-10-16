import {
    hitungBKDMeja
}
    from "./hitungBKDMeja";


interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}



export function generateKepekaanMeja(
    data: Input
) {


    const muatanUji =
        data.kapasitasMaksimum;



    const bkd =
        hitungBKDMeja({
            kapasitasMaksimum: data.kapasitasMaksimum,
            muatanUji: muatanUji,
            layanan: data.layanan
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