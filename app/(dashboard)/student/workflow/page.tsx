'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import WorkflowTimeline, { WorkflowStage } from '@/app/components/WorkflowTimeline';

interface Workflow {
  _id: string;
  title: string;
  status: string;
  currentStage: string;
  stages: WorkflowStage[];
  createdAt: string;
  updatedAt: string;
}

export default function StudentWorkflowPage() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflow() {
      try {
        setLoading(true);
        const res = await fetch('/api/workflows?mine=true', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch workflow');
        const data = await res.json();
        setWorkflow(data.workflows?.[0] || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflow();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Workflow</h2>
        <p className="text-sm text-gray-500">Track your thesis milestones and deadlines</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {workflow ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{workflow.title}</h3>
                <p className="mt-1 text-sm text-gray-500">Current Stage: {workflow.currentStage}</p>
              </div>
              <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium sm:mt-0 ${
                workflow.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                workflow.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {workflow.status}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
            <div className="mt-4">
              <WorkflowTimeline stages={workflow.stages || []} />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-sm text-gray-500">No workflow assigned yet.</p>
          <p className="mt-1 text-xs text-gray-400">Contact your program coordinator to initiate your thesis workflow.</p>
        </div>
      )}
    </div>
  );
}
