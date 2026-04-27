'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import StatsCard from '@/app/components/StatsCard';
import { PendingIcon, ApprovedIcon, DocIcon } from '@/app/components/Icons';

interface DocumentReview {
  _id: string;
  title: string;
  type: string;
  ownerId: string;
  ownerName?: string;
  versions: { versionNumber: number; uploadedAt: string }[];
  updatedAt: string;
  reviewStatus?: string;
}

type ReviewAction = 'approve' | 'reject' | 'feedback';

export default function AdviserReviewsPage() {
  const [documents, setDocuments] = useState<DocumentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentReview | null>(null);
  const [feedback, setFeedback] = useState('');
  const [action, setAction] = useState<ReviewAction>('feedback');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/documents?pendingReview=true', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load reviews';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const submitReview = async () => {
    if (!selectedDoc) return;
    if (action === 'feedback' && !feedback.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/documents/${selectedDoc._id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          feedback: feedback.trim() || `${action === 'approve' ? 'Approved' : 'Rejected'}`,
          status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'reviewed',
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');

      setSelectedDoc(null);
      setFeedback('');
      setSuccessMessage(
        action === 'approve'
          ? 'Document approved successfully.'
          : action === 'reject'
          ? 'Document rejected.'
          : 'Feedback submitted successfully.'
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh
      const refreshRes = await fetch('/api/documents?pendingReview=true', { credentials: 'include' });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setDocuments(data.documents || []);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (doc: DocumentReview, defaultAction: ReviewAction) => {
    setSelectedDoc(doc);
    setAction(defaultAction);
    setFeedback('');
  };

  const typeColors: Record<string, string> = {
    proposal: 'bg-blue-100 text-blue-700',
    manuscript: 'bg-purple-100 text-purple-700',
    checklist: 'bg-emerald-100 text-emerald-700',
    template: 'bg-gray-100 text-gray-700',
    feedback: 'bg-amber-100 text-amber-700',
  };

  const pendingCount = documents.filter((d) => !d.reviewStatus || d.reviewStatus === 'pending').length;
  const approvedCount = documents.filter((d) => d.reviewStatus === 'approved').length;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pending Reviews</h2>
        <p className="text-sm text-gray-500">Review and provide feedback on student submissions</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {successMessage && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Pending" value={pendingCount} icon={<PendingIcon />} />
        <StatsCard title="Approved" value={approvedCount} icon={<ApprovedIcon />} />
        <StatsCard title="Total Documents" value={documents.length} icon={<DocIcon />} />
      </div>

      <DataTable
        columns={[
          { key: 'title', header: 'Document', sortable: true },
          {
            key: 'type',
            header: 'Type',
            sortable: true,
            render: (d: DocumentReview) => (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  typeColors[d.type] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {d.type}
              </span>
            ),
          },
          {
            key: 'ownerName',
            header: 'Student',
            sortable: false,
            render: (d: DocumentReview) => d.ownerName || '—',
          },
          {
            key: 'version',
            header: 'Latest Version',
            sortable: false,
            render: (d: DocumentReview) => d.versions?.[d.versions.length - 1]?.versionNumber || 1,
          },
          {
            key: 'updatedAt',
            header: 'Submitted',
            sortable: true,
            render: (d: DocumentReview) => new Date(d.updatedAt).toLocaleDateString(),
          },
          {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            render: (d: DocumentReview) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(d, 'feedback')}
                  className="text-sm font-medium text-blue-800 hover:underline"
                >
                  Review
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => openModal(d, 'approve')}
                  className="text-sm font-medium text-emerald-700 hover:underline"
                >
                  Approve
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => openModal(d, 'reject')}
                  className="text-sm font-medium text-red-700 hover:underline"
                >
                  Reject
                </button>
              </div>
            ),
          },
        ]}
        data={documents}
        keyExtractor={(d) => d._id}
        emptyMessage="No pending reviews."
      />

      <Modal
        isOpen={!!selectedDoc}
        onClose={() => {
          setSelectedDoc(null);
          setFeedback('');
        }}
        title={
          action === 'approve'
            ? 'Approve Document'
            : action === 'reject'
            ? 'Reject Document'
            : 'Provide Feedback'
        }
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Document</p>
              <p className="text-sm text-gray-900">{selectedDoc.title}</p>
              <p className="text-xs text-gray-500">by {selectedDoc.ownerName || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {action === 'approve'
                  ? 'Approval Notes (optional)'
                  : action === 'reject'
                  ? 'Rejection Reason'
                  : 'Feedback'}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                placeholder={
                  action === 'approve'
                    ? 'Add optional notes...'
                    : action === 'reject'
                    ? 'Enter reason for rejection...'
                    : 'Enter your feedback...'
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setFeedback('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submitting || (action === 'feedback' && !feedback.trim()) || (action === 'reject' && !feedback.trim())}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  action === 'approve'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : action === 'reject'
                    ? 'bg-red-700 hover:bg-red-800'
                    : 'bg-blue-800 hover:bg-blue-900'
                }`}
              >
                {submitting
                  ? 'Submitting...'
                  : action === 'approve'
                  ? 'Approve'
                  : action === 'reject'
                  ? 'Reject'
                  : 'Submit Feedback'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


