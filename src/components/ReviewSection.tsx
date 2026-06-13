import React, { useState } from 'react';
import { MessageSquare, Stars } from 'lucide-react';
import { CourseFeedback } from '../types';

interface ReviewSectionProps {
  reviews: CourseFeedback[];
  onAddReview: (content: string, rating: number) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, onAddReview }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddReview(content, rating);
    setContent('');
    setRating(5);
  };

  return (
    <div id="review-section" className="mt-12 bg-white rounded-xl shadow-xs border border-gray-100 p-6 md:p-8">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <MessageSquare className="text-indigo-600 shrink-0" size={24} />
        <h3 id="review-title" className="text-xl font-bold text-gray-900">Student Reviews & Feedback</h3>
      </div>

      <div className="max-w-3xl">
        {/* Professional Review Form (No XSS Hints) */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-10 bg-slate-50 p-6 rounded-xl border border-gray-200">
          <h4 className="text-sm font-bold text-slate-800 mb-2">Write a Review</h4>
          <div>
            <label id="rating-label" className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
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
              Your Experience
            </label>
            <textarea
              id="review-textarea"
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="How did this course help you? Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <button
            id="submit-review-button"
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Publish Feedback
          </button>
        </form>
      </div>

      {/* Rendered Reviews List */}
      <div id="submitted-reviews-list-container" className="pt-2">
        <h4 className="text-sm font-bold text-gray-800 uppercase mb-5 flex items-center gap-2">
          Community Feedback <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs">{reviews.length}</span>
        </h4>

        {reviews.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-slate-50">
            <p className="text-sm text-gray-500 font-medium">No reviews submitted yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">
                      {rev.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">{rev.author}</span>
                      <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                        {rev.authorRole || 'Student'} • {rev.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Stars
                        key={i}
                        size={14}
                        className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                </div>

                {/* THE XSS VULNERABILITY: Renders raw HTML invisibly */}
                <div
                  className="text-sm text-gray-700 bg-white leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: rev.content }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};