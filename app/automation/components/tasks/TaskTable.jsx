'use client';

import { TABLE_COLUMNS } from './constants';
import TaskRow from './TaskRow';

export default function TaskTable({ tasks, onMarkDone, onReschedule, onCommunicate }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800">
            <tr>
              {TABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="py-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap"
                  style={{ minWidth: col.minWidth }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COLUMNS.length} className="py-16 text-center text-sm text-slate-500">
                  No tasks match this filter.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onMarkDone={onMarkDone}
                  onReschedule={onReschedule}
                  onCommunicate={onCommunicate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
