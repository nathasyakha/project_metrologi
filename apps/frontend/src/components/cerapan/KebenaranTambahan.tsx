interface Props {

    section: any;

    row: any;

    index: number;

    jumlahKolom: number;

    updateValue:
    (
        index: number,
        key: string,
        value: any
    ) => void;

}

export function CerapanKebenaranTambahan({
    section,
    row,
    index,
    jumlahKolom,
    updateValue
}: Props) {


    return (

        <>

            {
                (section.generator === "KEBENARAN" ||
                    section.generator === "EKSENTRISITAS") &&
                row.perluUjiTambahan &&
                (

                    <tr
                        className="
                            bg-amber-50
                        "
                    >

                        <td
                            colSpan={
                                jumlahKolom
                            }

                            className="
                                px-4
                                py-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-6
                                    flex-wrap
                                "
                            >

                                <div>

                                    <div
                                        className="
                                            text-sm
                                            font-semibold
                                            text-amber-900
                                        "
                                    >
                                        Uji tambahan 0,5e
                                    </div>


                                    <div
                                        className="
                                            mt-1
                                            text-sm
                                            text-slate-600
                                        "
                                    >

                                        Tambahkan imbuh sebesar{" "}

                                        <strong
                                            className="
                                                text-slate-800
                                            "
                                        >

                                            {
                                                Number(
                                                    (
                                                        Number(row.nilaiE)
                                                        *
                                                        0.5
                                                    ).toFixed(3)
                                                )
                                            } g

                                        </strong>

                                        {" "}kemudian catat
                                        penunjukan alat.

                                    </div>


                                    <div
                                        className="
                                            mt-1
                                            text-xs
                                            text-slate-500
                                        "
                                    >

                                        Kondisi:{" "}

                                        <strong>

                                            {
                                                row.arahUjiTambahan === "PLUS"
                                                    ?
                                                    "Penunjukan = ATS + 1e"
                                                    :
                                                    "Penunjukan = ATS - 1e"
                                            }

                                        </strong>

                                        {" • "}

                                        Penunjukan awal:

                                        {" "}

                                        <strong>
                                            {
                                                row.penunjukan
                                            } g
                                        </strong>

                                    </div>

                                </div>



                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <label
                                        className="
                                            text-sm
                                            font-medium
                                            text-slate-700
                                        "
                                    >
                                        Penunjukan setelah imbuh:
                                    </label>


                                    <input

                                        type="number"

                                        className="
                                            border
                                            border-slate-300
                                            rounded
                                            px-3
                                            py-2
                                            w-40
                                            bg-white
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-blue-500
                                        "

                                        value={
                                            row.penunjukanSetelahImbuh ?? ""
                                        }

                                        onChange={
                                            (e) => {

                                                const rawValue =
                                                    e.target.value;


                                                updateValue(
                                                    index,
                                                    "penunjukanSetelahImbuh",
                                                    rawValue === ""
                                                        ?
                                                        null
                                                        :
                                                        Number(rawValue)
                                                );

                                            }
                                        }

                                    />


                                    <span
                                        className="
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        g
                                    </span>


                                </div>


                            </div>


                        </td>


                    </tr>

                )

            }

        </>

    );

}