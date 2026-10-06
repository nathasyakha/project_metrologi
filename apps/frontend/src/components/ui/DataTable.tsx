"use client";
import { useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type PaginationState,
} from "@tanstack/react-table";
import {
    Table,
    Thead,
    Th,
    Tr,
    Td,
} from "@/components/ui/Table";
import { DataTableFilter } from "@/components/ui/DataTableFilter";
import { exportToExcel } from "@/lib/exportExcel";
import { FileDown } from "lucide-react";


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    loading?: boolean;
    emptyMessage?: string;
}


export function DataTable<TData, TValue>({
    columns,
    data,
    loading,
    emptyMessage = "Tidak ada data"
}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] =
        useState<SortingState>([]);

    const [pagination, setPagination] =
        useState<PaginationState>({
            pageIndex: 0,
            pageSize: 10,
        });
    const [
        columnFilters,
        setColumnFilters
    ] = useState<ColumnFiltersState>([]);

    const table =
        useReactTable({
            data,
            columns,
            state: {
                sorting,
                columnFilters,
                pagination,
            },
            onSortingChange: setSorting,
            onColumnFiltersChange: setColumnFilters,
            onPaginationChange: setPagination,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
        });

    if (loading) {
        return (
            <div className="p-6 text-center text-sm text-slate-500">
                Memuat data...
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-end mb-3">

                <button
                    className="
        flex
        items-center
        gap-2
        rounded-md
        border
        px-3
        py-2
        text-sm
        hover:bg-slate-50
        "
                    onClick={() => {

                        const exportData =
                            table
                                .getFilteredRowModel()
                                .rows
                                .map(row => {

                                    const obj: any = {};

                                    row.getVisibleCells()
                                        .forEach(cell => {

                                            obj[
                                                cell.column.columnDef.header as string
                                            ] =
                                                cell.getValue();

                                        });

                                    return obj;

                                });


                        exportToExcel(
                            exportData,
                            "data-peneraan"
                        );

                    }}
                >

                    <FileDown size={16} />

                    Export Excel

                </button>

            </div>
            <Table>
                <Thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <Th
                                    key={header.id}
                                    className={header.column.columnDef.meta?.headerClassName}
                                >
                                    <div className={`space-y-2`}>
                                        <div className={`flex items-center cursor-pointer select-none ${header.column.columnDef.meta?.headerClassName === "text-center" ? "justify-center" : ""}`}
                                            onClick={
                                                header.column.getToggleSortingHandler()
                                            }
                                        >
                                            {
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            }
                                            {
                                                {
                                                    asc: " ↑",
                                                    desc: " ↓"
                                                }[
                                                header.column.getIsSorted() as string
                                                ]
                                            }
                                        </div>
                                        {
                                            header.column.getCanFilter()
                                            &&
                                            <DataTableFilter
                                                column={header.column}
                                            />
                                        }
                                    </div>
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>

                <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                        <Tr>
                            <Td
                                colSpan={columns.length}
                                className="text-center py-8 text-slate-500"
                            >
                                {emptyMessage}
                            </Td>
                        </Tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <Td key={cell.id} className={
                                        (cell.column.columnDef.meta as any)
                                            ?.cellClassName ?? ""
                                    }>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Td>
                                ))}
                            </Tr>
                        ))
                    )}
                </tbody>
            </Table>
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                <div className="text-slate-500">
                    Menampilkan{" "}
                    {
                        table.getRowModel().rows.length
                    }
                    {" "}
                    {" "}dari{" "}
                    {
                        table.getFilteredRowModel().rows.length
                    }
                </div>
                <select className="rounded-md border px-2 py-1 text-xs" value={table.getState().pagination.pageSize}
                    onChange={(e) =>
                        table.setPageSize(
                            Number(e.target.value)
                        )
                    }
                >
                    <option value={10}>
                        10
                    </option>
                    <option value={25}>
                        25
                    </option>
                    <option value={50}>
                        50
                    </option>
                    <option value={100}>
                        100
                    </option>
                </select>
                <div className="flex items-center gap-2">
                    <button className="rounded-md border px-3 py-1 disabled:opacity-50" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</button>
                    <span className="text-xs">
                        Halaman{" "}
                        {
                            table.getState()
                                .pagination.pageIndex + 1
                        }
                        {" "}dari{" "}
                        {
                            table.getPageCount()
                        }
                    </span>
                    <button className="rounded-md border px-3 py-1 disabled:opacity-50" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</button>
                </div>
            </div>
        </div>
    );
}
