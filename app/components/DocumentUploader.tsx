'use client';

import { useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface DocumentUploaderProps {
  onUpload?: (file: File, title: string, type: string) => Promise<void>;
}

export default function DocumentUploader({ onUpload }: DocumentUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('proposal');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      if (onUpload) {
        await onUpload(file, title, docType);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('type', docType);

        const res = await fetch('/api/documents', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
      }
      setSuccess(true);
      setFile(null);
      setTitle('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-blue-800 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <p className="mt-2 text-sm font-medium text-gray-700">
          {file ? file.name : 'Drag and drop a file, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-gray-500">PDF, DOCX, or TXT up to 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Document Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Thesis Proposal Draft v1"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Document Type</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
        >
          <option value="proposal">Proposal</option>
          <option value="manuscript">Manuscript</option>
          <option value="checklist">Checklist</option>
          <option value="template">Template</option>
          <option value="feedback">Feedback</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Document uploaded successfully!</p>}

      <button
        type="submit"
        disabled={uploading || !file || !title.trim()}
        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50"
      >
        {uploading ? <LoadingSpinner size={16} className="text-white" /> : 'Upload Document'}
      </button>
    </form>
  );
}
