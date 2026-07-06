export default function DataTable({ columns, data, emptyMessage = 'No data found' }) {
  if (!data?.length) {
    return (
      <div className="py-16 flex flex-col items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-[40px] opacity-40">table_rows</span>
        <p className="font-body-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-white">
      <table className="min-w-full divide-y divide-outline-variant text-sm">
        <thead className="bg-surface-container-low">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3 text-left font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/50">
          {data.map((row, i) => (
            <tr key={row._id || row.id || i} className="hover:bg-surface-container-low transition-colors duration-100">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3 font-body-md text-on-surface whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
