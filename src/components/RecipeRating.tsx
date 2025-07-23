import React, { useState } from 'react';
import { Star, MessageCircle, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
}

interface RecipeRatingProps {
  recipeId: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  onAddReview: (rating: number, comment: string) => void;
}

export function RecipeRating({ 
  recipeId, 
  averageRating, 
  totalReviews, 
  reviews, 
  onAddReview 
}: RecipeRatingProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleSubmitReview = () => {
    if (userRating > 0) {
      onAddReview(userRating, comment);
      setUserRating(0);
      setComment('');
      setShowReviewForm(false);
    }
  };

  const StarRating = ({ rating, size = 'w-5 h-5', interactive = false, onRate }: any) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} cursor-pointer transition-colors ${
            star <= (interactive ? (hoverRating || rating) : rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Rating Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} />
            <div className="text-sm text-gray-600 mt-1">{totalReviews} reviews</div>
          </div>
        </div>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Star className="h-4 w-4 mr-2" />
          Write Review
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t pt-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRating 
                rating={userRating} 
                size="w-8 h-8" 
                interactive={true} 
                onRate={setUserRating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                placeholder="Share your thoughts about this recipe..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitReview}
                disabled={userRating === 0}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Reviews ({totalReviews})</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet. Be the first to review this recipe!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{review.user_name}</span>
                    <StarRating rating={review.rating} size="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {review.helpful_count}
                </button>
              </div>
              {review.comment && (
                <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}