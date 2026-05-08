'use client';

import { useState } from 'react';
import { MessageSquare, Send, Sparkles, Star, X } from 'lucide-react';

interface RatingModalProps {
  sessionId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function RatingModal({ sessionId, onClose, onSubmitted }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/sessions/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId, rating, feedback: feedback.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed to submit rating');
      }
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: 'Not helpful',
    2: 'Slightly helpful',
    3: 'Somewhat helpful',
    4: 'Very helpful',
    5: 'Extremely helpful',
  };

  const displayStar = hovered || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0C0B5D] px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close without rating"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Rate your conversation</h2>
              <p className="text-xs text-white/70">Help us improve SINAG for everyone</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Conversation summary icon */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600">How helpful was SINAG in this conversation?</p>
          </div>

          {/* Star rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= displayStar
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-100'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className={`text-sm font-medium transition-colors ${displayStar ? 'text-amber-700' : 'text-gray-400'}`}>
              {displayStar ? ratingLabels[displayStar] : 'Tap to rate'}
            </p>
          </div>

          {/* Optional feedback */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Feedback <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What could SINAG do better? Or what worked well?"
              rows={3}
              maxLength={500}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 resize-none text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D]/15 transition"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">{feedback.length}/500</p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0C0B5D] rounded-xl hover:bg-[#0a0949] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
