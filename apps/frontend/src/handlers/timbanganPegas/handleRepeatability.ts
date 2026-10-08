import { HandlerContext } from "@/lib/cerapan/types/handler";


export function handleRepeatability({

    key,

    updated

}: HandlerContext) {


    if (
        key !== "penunjukan"
    ) {

        return;

    }


    const p1 =
        updated[0]?.penunjukan;


    const p2 =
        updated[1]?.penunjukan;


    const p3 =
        updated[2]?.penunjukan;



    /*
    =============================
    VALIDASI DATA LENGKAP
    =============================
    */


    const lengkap =

        p1 !== null &&
        p1 !== undefined &&
        p1 !== "" &&

        p2 !== null &&
        p2 !== undefined &&
        p2 !== "" &&

        p3 !== null &&
        p3 !== undefined &&
        p3 !== "";



    if (!lengkap) {

        updated[2].repeat =
            null;


        updated[2].hasil =
            null;


        return;

    }



    const nilai = [

        Number(p1),

        Number(p2),

        Number(p3)

    ];



    /*
    =============================
    HITUNG REPEATABILITY
    =============================
    */


    const repeat =

        Math.max(...nilai)
        -
        Math.min(...nilai);



    updated[2].repeat =
        Number(
            repeat.toFixed(3)
        );



    /*
    =============================
    HASIL
    =============================
    */


    updated[2].hasil =

        repeat <= Number(updated[0].bkd)

            ?

            "SAH"

            :

            "BATAL";


}