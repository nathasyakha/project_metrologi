import { handler as timbanganElektronik } from "./timbanganElektronik";
import { handler as timbanganPegas } from "./timbanganPegas";
import { handler as timbanganMeja } from "./timbanganMeja";



export function runCerapanHandler(
    context: any
) {

    const jenisAlat =
        context.template?.jenisAlat;


    switch (jenisAlat) {


        case "TIMBANGAN_ELEKTRONIK":

            return timbanganElektronik(
                context
            );


        case "TIMBANGAN_PEGAS":

            return timbanganPegas(
                context
            );

        case "TIMBANGAN_MEJA":

            return timbanganMeja(
                context
            );

        default:

            return false;

    }

}