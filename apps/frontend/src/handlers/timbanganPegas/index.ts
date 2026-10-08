import {
    handleKebenaran
}
    from "./handleKebenaran";



export function handler(
    context: any
) {

    const {
        section
    } = context;


    switch (section.generator) {


        case "KEBENARAN":

            handleKebenaran(
                context
            );

            break;


    }


    return false;

}