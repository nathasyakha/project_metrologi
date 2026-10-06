"use client";

import { useMemo } from "react";
import type { CerapanSection as SectionType } from "@/lib/cerapan/types";
import { runCerapanGenerator } from "@/lib/cerapan/runGenerator";
import { CerapanTable } from "./CerapanTable";
import { CerapanChecklist } from "./CerapanChecklist";


interface Props {
    section: SectionType;
    instrument: any;
}

export function CerapanSection({
    section,
    instrument
}: Props) {
    const data = useMemo(() => {
        if (!section.generator) {
            return [];
        }
        return runCerapanGenerator(
            instrument,
            section.generator
        );
    }, [
        section.generator,
        instrument
    ]);
    console.log("SECTION MASUK", section);
    return (
        <div className="space-y-3">

            {
                section.type === "table"
                &&
                (
                    Array.isArray(data)
                        ?
                        data.length > 0
                        :
                        data !== null &&
                        data !== undefined
                )
                &&
                (
                    <>
                        <h3 className="font-semibold text-slate-800">
                            {section.title}
                        </h3>

                        {
                            section.description &&
                            (
                                <p className="text-sm text-slate-500 mt-1">
                                    {section.description}
                                </p>
                            )
                        }

                        <CerapanTable
                            section={{
                                ...section,
                                rule: section.rule
                            }}
                            data={
                                Array.isArray(data)
                                    ?
                                    data
                                    :
                                    [data]
                            }
                        />
                    </>
                )
            }



            {
                section.type === "checklist"
                &&
                (
                    <>
                        <h3 className="font-semibold text-slate-800">
                            {section.title}
                        </h3>

                        {
                            section.description &&
                            (
                                <p className="text-sm text-slate-500 mt-1">
                                    {section.description}
                                </p>
                            )
                        }

                        <CerapanChecklist
                            items={
                                section.items ?? []
                            }
                        />
                    </>
                )
            }


        </div>

    )

}