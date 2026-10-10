function renderReadonlyValue(value: any) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    return value;

}

interface Props {

    column: any;

    row: any;

    index: number;

    section: any;

    updateValue: any;

}

export function CerapanCell({
    column,
    row,
    index,
    section,
    updateValue
}: Props) {

    const value =
        row[
        column.key
        ];


    /*
     * =========================
     * NOMOR
     * =========================
     */

    const isNoColumn =
        column.key ===
        "nomor" || column.key ===
        "posisiUji" || column.key === "pengamatan025e" || column.key === "pengamatan05e"


    /*
     * =========================
     * READONLY
     * =========================
     */

    const isReadonly =

        column.readonly ||

        isNoColumn;



    /*
     * =========================
     * READONLY VALUE
     * =========================
     */

    let readonlyValue =
        value;


    let readonlyClass =
        "";


    /*
     * =========================
     * BKD PLACEHOLDER
     * =========================
     */

    if (
        section.generator ===
        "KEBENARAN" &&

        column.key ===
        "bkd" &&

        (
            value === null ||
            value === undefined
        )
    ) {

        readonlyValue =
            row.placeholderBKD;


        readonlyClass =
            "text-slate-400";

    }


    /*
     * =========================
     * WARNA HASIL
     * =========================
     */

    if (
        column.key ===
        "hasil"
    ) {

        if (
            value ===
            "SAH"
        ) {

            readonlyClass =
                "text-green-600 font-semibold";

        }

        else if (
            value ===
            "BATAL"
        ) {

            readonlyClass =
                "text-red-600 font-semibold";

        }

    }



    return (

        <td
            key={
                column.key
            }

            className={`
                                                        px-2
                                                        py-2
                                                        text-center
                                                    `}
        >

            {isNoColumn ? (

                <span
                    className="
                                                                text-slate-700
                                                                font-medium
                                                            "
                >

                    {
                        renderReadonlyValue(
                            value
                        )
                    }

                </span>

            ) : isReadonly ? (

                <div
                    className="
                                                                border
                                                                border-slate-200
                                                                bg-slate-100
                                                                rounded
                                                                px-2
                                                                py-1.5
                                                                w-full
                                                                min-h-[34px]
                                                                flex
                                                                items-center
                                                            "
                >

                    <span
                        className={
                            readonlyClass
                        }
                    >

                        {
                            renderReadonlyValue(
                                readonlyValue
                            )
                        }

                    </span>

                </div>

            ) : (
                column.type === "select" ? (
                    <select className="border border-slate-300 rounded px-2 py-1.5 w-full"
                        value={value ?? ""}
                        disabled={column.disabledWhen ? column.disabledWhen(row) : false}
                        onChange={(e) => {

                            updateValue(
                                index,
                                column.key,
                                e.target.value
                            );

                        }}
                    >

                        <option value="">
                            Pilih
                        </option>

                        {
                            column.options?.map(
                                (
                                    option: {
                                        value: string;
                                        label: string;
                                    }
                                ) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                )
                            )
                        }

                    </select>


                ) : (

                    <input className=" border border-slate-300 rounded px-2 py-1.5 w-full "
                        type={
                            column.type === "number"
                                ?
                                "number"
                                :
                                "text"
                        }
                        value={value ?? ""}
                        onChange={(e) => {
                            const raw = e.target.value;
                            updateValue(index, column.key,
                                column.type === "number"
                                    ? Number(raw)
                                    : raw

                            );

                        }}

                    />

                )

            )}

        </td>
    )
}