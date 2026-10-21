import { handler as timbanganElektronik } from "./timbanganElektronik";
import { handler as timbanganPegas } from "./timbanganPegas";
import { handler as timbanganMeja } from "./timbanganMeja";
import { handler as timbanganSentisimal } from "./timbanganSentisimal";
import { handler as timbanganBobotIngsut } from "./timbanganBobotIngsut";
import { handler as dacin } from "./dacin";
import { handler as timbanganJembatan } from "./timbanganJembatan";


export function runCerapanHandler(
    context: any
) {

    const jenisAlat = context.template?.jenisAlat;

    switch (jenisAlat) {

        case "TIMBANGAN_ELEKTRONIK":
            return timbanganElektronik(context);
        case "TIMBANGAN_PEGAS":
            return timbanganPegas(context);
        case "TIMBANGAN_MEJA":
            return timbanganMeja(context);
        case "TIMBANGAN_SENTISIMAL":
            return timbanganSentisimal(context);
        case "TIMBANGAN_BOBOT_INGSUT":
            return timbanganBobotIngsut(context);
        case "DACIN":
            return dacin(context);
        case "TIMBANGAN_JEMBATAN":
            return timbanganJembatan(context);
        default:
            return false;
    }
}