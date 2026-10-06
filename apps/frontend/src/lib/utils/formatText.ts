export function formatJenisAlat(
    value?: string
) {

    if (!value) return "-";


    return value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );

}