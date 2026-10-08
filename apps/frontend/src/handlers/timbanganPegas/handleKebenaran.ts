export function handleKebenaran({
    key,
    updated,
    index
}: any) {


    if (
        key !== "pengamatan"
    ) {

        return;

    }


    updated[index].hasil =
        updated[index].pengamatan;


}