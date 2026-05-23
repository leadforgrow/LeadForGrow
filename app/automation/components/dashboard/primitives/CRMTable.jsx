'use client';

export default function CRMTable({ columns = [], rows = [], emptyMessage = 'No records found' }) {
  if (!rows.length) {
    return (
      <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 py-2.5 px-3 first:pl-0"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
          {rows.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-3 first:pl-0 text-slate-700 dark:text-slate-300">
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
