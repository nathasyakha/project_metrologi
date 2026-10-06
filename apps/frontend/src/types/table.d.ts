import "@tanstack/react-table";

declare module "@tanstack/react-table" {

    interface ColumnMeta<TData, TValue> {

        /**
         * Jenis filter pada header tabel
         */
        filterType?:
        | "text"
        | "select";


        /**
         * Data dropdown filter
         */
        options?: {
            value: string;
            label: string;
        }[];


        /**
         * Class untuk header
         */
        headerClassName?: string;


        /**
         * Class untuk cell
         */
        cellClassName?: string;

    }

}