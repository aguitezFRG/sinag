'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DocumentUploader from '@/app/components/DocumentUploader';
import Modal from '@/app/components/Modal';

interface Document {
  _id: string;
  title: string;
  type: string;
  versions: { versionNumber: number; uploadedAt: string }[];
  isPublic: boolean;
  updatedAt: string;
}

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  async function fetchDocuments() {
    try {
      setLoading(true);
      const res = await fetch('/api/documents?mine=true', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  const typeColors: Record<string, string> = {
    proposal: 'bg-blue-100 text-blue-700',
    manuscript: 'bg-purple-100 text-purple-700',
    checklist: 'bg-emerald-100 text-emerald-700',
    template: 'bg-gray-100 text-gray-700',
    feedback: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
          <p className="text-sm text-gray-500">Manage your thesis documents and versions</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload New
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      ) : documents.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Versions</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Last Updated</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{doc.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[doc.type] || 'bg-gray-100 text-gray-700'}`}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{doc.versions?.length || 0}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${doc.isPublic ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {doc.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        </div>
      )}

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document">
        <DocumentUploader
          onUpload={async () => {
            setUploadOpen(false);
            await fetchDocuments();
          }}
        />
      </Modal>
    </div>
  );
}
