export interface InputPenyetelTara {
    nilaiE: number;
    kapasitasMaksimum: number;
    layanan: "TERA" | "TERA_ULANG";
}


export function generatePenyetelTara(
    data: InputPenyetelTara
) {
    console.log(
        "DATA PENYETEL TARA",
        data
    );
    /*
    ==========================
    PENYETEL TARA
    HANYA UNTUK TERA
    ==========================
    */

    if (
        data.layanan !== "TERA"
    ) {
        return [];
    }

    return [

        {

            nilaiE:
                data.nilaiE,


            langkah:
                Number(data.kapasitasMaksimum * 0.20),


            tekanTara:
                0,


            imbuh10e:
                data.nilaiE * 10,


            penunjukan10e:
                null,


            imbuh025e:
                data.nilaiE * 0.25,


            penunjukan025e:
                null,


            pengamatan025e:
                null,


            imbuh05e:
                data.nilaiE * 0.5,


            penunjukan05e:
                null,


            pengamatan05e:
                null,


            hasil:
                null

        }

    ];
}