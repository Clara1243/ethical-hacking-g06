import React, { useState } from 'react';
import { MessageSquare, AlertTriangle, Stars, ShieldAlert, Terminal, Copy, Check } from 'lucide-react';
import { Review, UserRole } from '../types';

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (content: string, rating: number) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, onAddReview }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddReview(content, rating);
    setContent('');
  };

  const copyPayload = (payload: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedPayload(payload);
    setTimeout(() => setCopiedPayload(null), 2000);
  };

  const samplePayloads = [
    {
      label: 'Image Error Alert',
      code: `<img src="x" onerror="alert('CSS / XSS Execution successful!')">`
    },
    {
      label: 'Custom Styled Banner (Cohesion)',
      code: `<div class="p-3 bg-indigo-900/40 border border-indigo-500/80 rounded-lg text-indigo-200 font-bold shadow-lg animate-pulse">🤝 Student Cooperation Defacement Hooked! 🤝</div>`
    },
    {
      label: 'Marquee Scroll Attack',
      code: `<marquee class="text-rose-500 font-black text-lg py-1 bg-rose-950/20 rounded">⚠️ WARNING: EduUnity Connect Cross-Site Scripting Laboratory! ⚠️</marquee>`
    }
  ];

  return (
    <div id="review-section" className="mt-12 bg-white rounded-xl shadow-xs border border-gray-100 p-6 md:p-8">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <MessageSquare className="text-indigo-600 shrink-0" size={24} />
        <h3 id="review-title" className="text-xl font-bold text-gray-900">Student Cooperation Reviews & Feedback</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: input form */}
        <div id="review-form-column" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label id="rating-label" className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                    title={`${star} Stars`}
                  >
                    <Stars
                      size={24}
                      className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
                <span className="text-sm font-mono text-gray-500 ml-2">({rating} out of 5)</span>
              </div>
            </div>

            <div>
              <label id="review-textarea-label" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="review-textarea"
                rows={4}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                placeholder="Type your review here... Supported formatting: HTML raw tags are rendered directly!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <button
              id="submit-review-button"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Submit Review
            </button>
          </form>
        </div>

        {/* Right column: Exploit Payload Helper */}
        <div id="exploit-helper-sidebar" className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-4 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={16} className="text-rose-500 animate-bounce" />
            <span className="text-sm font-bold text-slate-800">XSS Lab Assistant</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            This workspace renders reviews natively without raw HTML sanitization, showcasing a stored Cross-Site Scripting (XSS) vulnerability. Try clicking the samples below to copy and paste them into the input form:
          </p>

          <div className="space-y-3">
            {samplePayloads.map((payload, idx) => (
              <div key={idx} className="bg-white p-2 border border-slate-200 rounded-lg text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-700">{payload.label}</span>
                  <button
                    type="button"
                    onClick={() => copyPayload(payload.code)}
                    className="p-1 hover:bg-slate-100 rounded text-indigo-600 hover:text-indigo-500 transition-colors"
                    title="Copy payload"
                  >
                    {copiedPayload === payload.code ? (
                      <Check size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>
                <code className="block bg-slate-950 text-emerald-400 p-1.5 rounded font-mono text-[9px] break-all leading-normal overflow-x-auto whitespace-pre-wrap">
                  {payload.code}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Element: Displays submitted reviews by raw unsanitized injection */}
      <div id="submitted-reviews-list-container" className="mt-8 pt-8 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-5">
          Student Community Feedback ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No reviews submitted yet for this course.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-slate-50 rounded-lg border border-gray-100 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-800 mr-2">{rev.author}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700">
                      {rev.authorRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Stars
                        key={i}
                        size={12}
                        className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                      />
                    ))}
                    <span className="text-[11px] font-mono text-gray-500 ml-1">{rev.date}</span>
                  </div>
                </div>

                {/* CRITICAL ATTENTION: UNFILTERED HTML INJECTION TO SUPPORT XSS LABORATORY SPECIFICATIONS */}
                <div
                  className="text-sm text-gray-700 font-mono bg-white p-3 border border-gray-200/50 rounded-md shadow-xs break-words"
                  dangerouslySetInnerHTML={{ __html: rev.content }}
                />

                <div className="flex justify-end">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                    <Terminal size={10} />
                    <span>Raw Render Zone</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
