import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function DataTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-container border-opacity-30 border-white bg-black">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#0A0A0A] border-b border-border">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-black">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/[0.02] transition-colors border-b border-dashed border-border last:border-0 group">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-5 align-middle text-white/50 group-hover:text-white transition-colors">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-20 text-center text-xs font-mono tracking-widest text-[#00E599]/40 italic uppercase">
                &lt; Zero.Data.Nodes.Found /&gt;
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
