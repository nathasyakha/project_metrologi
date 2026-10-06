export function formatKg(
    value: number | string | null | undefined,
    unit?: "kg" | "g" | "L" | "mL"
) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }


    let kg =
        Number(value);


    if (unit === "g") {

        kg =
            kg / 1000;

    }


    return `${kg} kg`;

}