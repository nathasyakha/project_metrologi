import {
    handler as handlerTimbanganElektronik
}
    from "./timbanganElektronik";



export function runCerapanHandler(
    context: any
) {

    const jenisAlat =
        context.template.jenisAlat;



    if (
        jenisAlat === "TIMBANGAN_ELEKTRONIK"
    ) {

        return handlerTimbanganElektronik(
            context
        );

    }


    return false;

}