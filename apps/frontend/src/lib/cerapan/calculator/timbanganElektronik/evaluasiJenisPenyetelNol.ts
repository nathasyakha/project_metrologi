export function evaluasiJenisPenyetelNol(
    pemeriksaan: string
) {

    if (
        pemeriksaan === "BERUBAH"
    ) {

        return {

            jenisPenyetelNol:
                "Otomatis"

        };

    }


    if (
        pemeriksaan === "TIDAK_BERUBAH"
    ) {

        return {

            jenisPenyetelNol:
                "Semi otomatis"

        };

    }


    return {

        jenisPenyetelNol:
            null

    };

}