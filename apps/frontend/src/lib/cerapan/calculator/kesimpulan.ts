export function hitungKesimpulan(
    sections: any[]
) {


    const hasil: string[] = [];


    sections.forEach(
        section => {


            if (!section.data) {
                return;
            }


            section.data.forEach(
                (row: any) => {


                    if (
                        row.hasil === "BATAL"
                    ) {

                        hasil.push(
                            "BATAL"
                        );

                    }


                }
            );


        }
    );



    return hasil.includes("BATAL")
        ?
        "BATAL"
        :
        "SAH";

}