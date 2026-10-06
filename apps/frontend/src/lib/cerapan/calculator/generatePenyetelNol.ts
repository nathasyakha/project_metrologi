export interface InputPenyetelanNol {

    nilaiE: number;
    kapasitasMaksimum: number;

}



export function generatePenyetelanNol(
    data: InputPenyetelanNol
) {


    return [

        {

            /*
            =========================
            IDENTITAS
            =========================
            */

            nilaiE:
                data.nilaiE,



            /*
            =========================
            IDENTIFIKASI JENIS
            =========================
            */

            langkah:
                "Nolkan timbangan, naikkan muatan 5e, nolkan timbangan, turunkan muatan",


            pemeriksaan:
                null,


            jenisPenyetelNol:
                null,


            /*
            =====================
            OTOMATIS
            =====================
            */

            langkahOtomatis:
                data.kapasitasMaksimum * 0.02,
            penyetelBekerja:
                0,
            imbuhOtomatis10e:
                data.nilaiE * 10,
            penunjukanOtomatis10e:
                null,
            imbuhOtomatis025e:
                data.nilaiE * 0.25,

            penunjukanOtomatis025e:
                null,
            imbuhOtomatis05e:
                data.nilaiE * 0.5,
            penunjukanOtomatis05e:
                null,

            /*
        =====================
        SEMI OTOMATIS
        =====================
        */
            tambah10e:
                data.nilaiE * 10,
            penunjukanSM10e:
                null,
            tambah025e:
                data.nilaiE * 0.25,
            penunjukanSM025e:
                null,
            tambah05e:
                data.nilaiE * 0.5,
            penunjukanSM05e:
                null,
            hasil:
                null

        }

    ];

}