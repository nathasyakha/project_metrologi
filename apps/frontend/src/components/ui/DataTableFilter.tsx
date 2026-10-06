import type { Column } from "@tanstack/react-table";


interface Props {
    column: Column<any, unknown>;
}


export function DataTableFilter({
    column
}: Props) {


    const meta =
        column.columnDef.meta as {
            filterType?: "text" | "select";
            options?: {
                label: string;
                value: string;
            }[];
        };


    const filterValue =
        column.getFilterValue() ?? "";


    if (meta?.filterType === "select") {

        return (

            <select

                value={filterValue as string}

                onChange={(e) =>
                    column.setFilterValue(
                        e.target.value
                    )
                }

                className="
                w-full
                rounded
                border
                px-2
                py-1
                text-xs
                "

            >

                <option value="">
                    Semua
                </option>


                {
                    meta.options?.map(item => (

                        <option
                            key={item.value}
                            value={item.value}
                        >
                            {item.label}
                        </option>

                    ))
                }


            </select>

        )

    }



    return (

        <input

            value={filterValue as string}

            onChange={(e) =>
                column.setFilterValue(
                    e.target.value
                )
            }

            placeholder="Cari..."

            className="
            w-full
            rounded
            border
            px-2
            py-1
            text-xs
            "

        />

    );

}