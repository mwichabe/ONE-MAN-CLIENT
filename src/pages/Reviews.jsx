import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PRIMARY_COLOR = '#ea2e0e';
const REVIEWS_API_URL = 'https://one-man-server.onrender.com/api/reviews';

const StarRating = ({ rating, onChange, interactive = false }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type={interactive ? "button" : ""}
                    onClick={interactive ? () => onChange(star) : undefined}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    disabled={!interactive}
                >
                    <svg
                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

const Reviews = () => {
    const { user, isLoggedIn } = useAuth();

    // Review state management
    const [reviews, setReviews] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({
        name: '',
        rating: 5,
        comment: ''
    });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch reviews from API
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${REVIEWS_API_URL}`);
            setReviews(response.data);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        }
    };

    // Fetch user's reviews from API
    const fetchMyReviews = async () => {
        if (!isLoggedIn) return;

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`${REVIEWS_API_URL}/my-reviews`, config);
            setMyReviews(response.data);
        } catch (err) {
            console.error('Failed to fetch my reviews:', err);
        }
    };

    // Fetch reviews on component mount
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchReviews(), fetchMyReviews()]);
            setLoading(false);
        };
        loadData();
    }, [isLoggedIn]);

    // Update review form name when user logs in
    useEffect(() => {
        if (user && user.name) {
            setReviewForm(prev => ({ ...prev, name: user.name }));
        }
    }, [user]);

    // Handle review form input changes
    const handleReviewInputChange = (e) => {
        const { name, value } = e.target;
        setReviewForm(prev => ({
            ...prev,
            [name]: name === 'rating' ? parseInt(value) : value
        }));
    };

    // Handle review submission
    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            alert('Please log in to submit a review');
            return;
        }

        if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setIsSubmittingReview(true);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            let response;
            if (editingReview) {
                // Update existing review
                response = await axios.put(
                    `${REVIEWS_API_URL}/${editingReview._id}`,
                    {
                        name: reviewForm.name.trim(),
                        rating: reviewForm.rating,
                        comment: reviewForm.comment.trim()
                    },
                    config
                );
            } else {
                // Create new review
                response = await axios.post(
                    `${REVIEWS_API_URL}`,
                    {
                        name: reviewForm.name.trim(),
                        rating: reviewForm.rating,
                        comment: reviewForm.comment.trim()
                    },
                    config
                );
            }

            // Refresh reviews lists
            await Promise.all([fetchReviews(), fetchMyReviews()]);

            // Reset form
            setReviewForm({
                name: user?.name || '',
                rating: 5,
                comment: ''
            });
            setEditingReview(null);

            alert(editingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        } catch (err) {
            console.error('Failed to submit review:', err);
            alert(err.response?.data?.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Handle review deletion
    const handleDeleteReview = async (reviewId) => {
        if (!isLoggedIn) {
            alert('Please log in to delete reviews');
            return;
        }

        if (confirm('Are you sure you want to delete this review?')) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                await axios.delete(`${REVIEWS_API_URL}/${reviewId}`, config);

                // Refresh reviews lists
                await Promise.all([fetchReviews(), fetchMyReviews()]);

                alert('Review deleted successfully!');
            } catch (err) {
                console.error('Failed to delete review:', err);
                alert(err.response?.data?.message || 'Failed to delete review. Please try again.');
            }
        }
    };

    // Handle review editing
    const handleEditReview = (review) => {
        if (!isLoggedIn) {
            alert('Please log in to edit reviews');
            return;
        }

        setEditingReview(review);
        setReviewForm({
            name: review.name,
            rating: review.rating,
            comment: review.comment
        });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingReview(null);
        setReviewForm({
            name: user?.name || '',
            rating: 5,
            comment: ''
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Reviews Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Review Form Section */}
                <div>
                    <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {editingReview ? 'Edit Your Review' : 'Share Your Experience'}
                        </h2>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={reviewForm.name}
                                    onChange={handleReviewInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating
                                </label>
                                <StarRating
                                    rating={reviewForm.rating}
                                    onChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                                    interactive={true}
                                />
                            </div>

                            <div>
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    value={reviewForm.comment}
                                    onChange={handleReviewInputChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Share your experience with ONE MAN..."
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="flex-1 px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    {isSubmittingReview
                                        ? 'Submitting...'
                                        : editingReview
                                            ? 'Update Review'
                                            : 'Submit Review'
                                    }
                                </button>

                                {editingReview && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-6 py-3 text-gray-700 font-medium bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* My Reviews Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Reviews</h2>
                    {myReviews.length === 0 ? (
                        <div className="text-center py-12 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-gray-700 font-medium mb-2">You haven't written any reviews yet</p>
                            <p className="text-sm text-gray-500">Share your first experience with ONE MAN!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myReviews.map((review) => (
                                <div key={review._id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <StarRating rating={review.rating} />
                                            <p className="text-sm text-gray-600 mt-1">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditReview(review)}
                                                className="text-blue-500 hover:text-blue-700"
                                                aria-label="Edit review"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handleDeleteReview(review._id)}
                                                className="text-red-500 hover:text-red-700"
                                                aria-label="Delete review"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* All Reviews Section */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">All Customer Reviews</h2>
                {reviews.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-700 font-medium mb-2">No reviews yet</p>
                        <p className="text-sm text-gray-500">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <div className="flex gap-1 mb-3">
                                    <StarRating rating={review.rating} />
                                </div>

                                <p className="text-gray-700 mb-4 leading-relaxed">
                                    "{review.comment}"
                                </p>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="font-medium text-gray-900">{review.name}</div>
                                    <div className="text-sm text-gray-600">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                        {isLoggedIn && user && review.user && review.user._id === user._id && (
                                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Your Review</span>
                                        )}
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

export default Reviews;
