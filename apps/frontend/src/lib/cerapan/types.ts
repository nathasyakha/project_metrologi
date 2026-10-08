import type { ComponentType } from "react";

export interface CerapanField {
    name: string;
    label: string;
    type:
    | "text"
    | "number"
    | "select"
    | "checkbox";
    readonly?: boolean;
}

export interface CerapanOption {

    value: string;

    label: string;

}

export interface CerapanColumn {
    key: string;
    label: string;
    type:
    | "text"
    | "number"
    | "select";
    readonly?: boolean;
    options?: CerapanOption[];
}

export interface CerapanRow {
    key: string;
    label: string;
    type:
    | "text"
    | "number"
    | "select";
    readonly?: boolean;
    options?: {
        value: string;
        label: string;
    }[];
}

export interface CerapanSection {

    id: string;

    title: string;

    description?: string;


    type:
    | "form"
    | "checklist"
    | "table"
    | "table_custom"
    | "info";


    fields?: CerapanField[];


    summaryRows?: CerapanRow[];


    columns?: CerapanColumn[];


    generator?: CerapanGenerator;


    calculation?:
    | "BKD"
    | "KESALAHAN"
    | "HASIL"
    | null;


    // TAMBAHAN DALAM TABLE
    additionalComponent?:
    ComponentType<any>;


    // TAMBAHAN SETELAH SUMMARY
    summaryComponent?:
    ComponentType<any>;



    items?: {

        parameter: string;

        kondisi?: string;

        keterangan?: string;

    }[];


    rule?: any;

}


export interface CerapanTemplate {
    jenisAlat: string;
    pemeriksaan: CerapanSection[];
    pengujian: CerapanSection[];
    kesimpulan: CerapanField[];
}

export type CerapanGenerator =
    | "KEBENARAN"
    | "EKSENTRISITAS"
    | "KEPEKAAN"
    | "REPEATABILITY"
    | "PENYETELAN_NOL"
    | "PENYETEL_TARA"
    | "REPEATABILITY_PEGAS"
    | "EKSENTRISITAS_PEGAS";


