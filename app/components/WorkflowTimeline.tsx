'use client';

export interface WorkflowStage {
  name: string;
  order: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  dueDate?: string;
  completedAt?: string;
}

interface WorkflowTimelineProps {
  stages: WorkflowStage[];
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Pending' },
  in_progress: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'In Progress' },
  submitted: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Submitted' },
  approved: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Approved' },
  rejected: { color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
};

export default function WorkflowTimeline({ stages }: WorkflowTimelineProps) {
  const sorted = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
      <div className="space-y-6">
        {sorted.map((stage, idx) => {
          const config = statusConfig[stage.status] || statusConfig.pending;
          const isLast = idx === sorted.length - 1;

          return (
            <div key={stage.name} className="relative flex items-start gap-4 pl-1">
              <div
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  stage.status === 'approved'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : stage.status === 'in_progress' || stage.status === 'submitted'
                    ? 'border-blue-800 bg-white text-blue-800'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {stage.status === 'approved' ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{stage.order}</span>
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-semibold text-gray-900">{stage.name}</h4>
                  <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color} sm:mt-0`}>
                    {config.label}
                  </span>
                </div>
                {stage.dueDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    Due: {new Date(stage.dueDate).toLocaleDateString()}
                  </p>
                )}
                {stage.completedAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Completed: {new Date(stage.completedAt).toLocaleDateString()}
                  </p>
                )}
                {!isLast && <div className="mt-4 h-px bg-gray-100" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
