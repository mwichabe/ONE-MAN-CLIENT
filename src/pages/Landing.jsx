import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/Common/productCard';

const PRIMARY_COLOR = '#ea2e0e';
const API_URL = 'https://one-man-server.onrender.com/api/admin/products';
const REVIEWS_API_URL = 'https://one-man-server.onrender.com/api/reviews';

const Logo = () => (
    <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg overflow-hidden">
            <img src={logo} alt="ONE MAN" className="h-full w-full object-cover" />
        </div>
        <span className="text-xl font-semibold text-gray-900">ONE MAN</span>
    </div>
);

const Landing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get user authentication state
    const { user, isLoggedIn } = useAuth();

    // Review state management
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({
        name: '',
        rating: 5,
        comment: ''
    });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    // Fetch reviews from API
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${REVIEWS_API_URL}`);
            setReviews(response.data);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        }
    };

    // Fetch reviews on component mount
    useEffect(() => {
        fetchReviews();
    }, []);

    // Update review form name when user logs in
    useEffect(() => {
        if (user && user.name) {
            setReviewForm(prev => ({ ...prev, name: user.name }));
        }
    }, [user]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}`, {
                    headers: { 'Content-Type': 'application/json' },
                });
                setProducts(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError("Could not load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const renderProductContent = () => {
        if (loading) {
            return (
                <div className="text-center py-16">
                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12 px-4 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            );
        }

        if (products.length === 0) {
            return (
                <div className="text-center py-12 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-700 font-medium">No products available yet</p>
                    <p className="text-sm text-gray-500 mt-2">Check back soon for our latest collection</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        );
    };

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

            // Refresh reviews list
            await fetchReviews();

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

                // Refresh reviews list
                await fetchReviews();

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

    // Star rating component
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

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Navigation */}
            <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Logo />
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/signup"
                                className="text-sm font-medium text-white px-6 py-2.5 rounded-lg transition-all hover:opacity-90"
                                style={{ backgroundColor: PRIMARY_COLOR }}
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <section className="py-16 lg:py-24">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                                Premium Fashion for Modern Styling
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Discover curated collections that elevate your style.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                                <Link
                                    to="/signup"
                                    className="px-8 py-4 text-base font-medium text-white rounded-lg transition-all hover:opacity-90"
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-4 text-base font-medium text-gray-900 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="py-16 border-t border-gray-200">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
                            Why Choose ONE MAN
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                                    <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h3>
                                <p className="text-sm text-gray-600">Handpicked garments from top designers</p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                                    <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Shipping</h3>
                                <p className="text-sm text-gray-600">Worldwide shipping available</p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                                    <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
                                <p className="text-sm text-gray-600">256-bit SSL encryption guaranteed</p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                                    <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer First</h3>
                                <p className="text-sm text-gray-600">24/7 support and easy returns</p>
                            </div>
                        </div>
                    </section>

                    {/* Products */}
                    <section className="py-16 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                    Featured Collection
                                </h2>
                                <p className="text-gray-600">Explore our handpicked selection</p>
                            </div>
                        </div>
                        {renderProductContent()}
                        <div className="text-center mt-12">
                            <p className="text-gray-600 mb-4">
                                Want to see more? Join our community today
                            </p>
                            <Link
                                to="/signup"
                                className="inline-block text-sm font-medium text-white px-8 py-3 rounded-lg transition-all hover:opacity-90"
                                style={{ backgroundColor: PRIMARY_COLOR }}
                            >
                                Sign Up for Full Access
                            </Link>
                        </div>
                    </section>

                    {/* Customer Reviews */}
                    <section className="py-16 border-t border-gray-200">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
                            Customer Reviews
                        </h2>

                        {/* Reviews Display */}
                        <div className="max-w-6xl mx-auto">
                            {reviews.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-gray-700 font-medium mb-2">No reviews yet</p>
                                    <p className="text-sm text-gray-500">
                                        {isLoggedIn
                                            ? "Be the first to share your experience!"
                                            : "Log in to share your experience with ONE MAN!"
                                        }
                                    </p>
                                    {!isLoggedIn && (
                                        <div className="mt-4">
                                            <Link
                                                to="/login"
                                                className="inline-block px-6 py-2 text-white font-medium rounded-lg transition-all hover:opacity-90"
                                                style={{ backgroundColor: PRIMARY_COLOR }}
                                            >
                                                Log In to Review
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative group">
                                            {/* Action buttons for review owner */}
                                            {isLoggedIn && user && review.user && review.user._id === user._id && (
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Edit button */}
                                                    <button
                                                        onClick={() => handleEditReview(review)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        aria-label="Edit review"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>

                                                    {/* Delete button */}
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
                                            )}

                                            {/* Rating */}
                                            <div className="flex gap-1 mb-3">
                                                <StarRating rating={review.rating} />
                                            </div>

                                            {/* Review */}
                                            <p className="text-gray-700 mb-4 leading-relaxed">
                                                "{review.comment}"
                                            </p>

                                            {/* Author info */}
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

                            {/* Call to action for logged in users */}
                            {isLoggedIn && reviews.length > 0 && (
                                <div className="text-center mt-12">
                                    <Link
                                        to="/reviews"
                                        className="inline-block text-sm font-medium text-white px-8 py-3 rounded-lg transition-all hover:opacity-90"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                    >
                                        Manage Your Reviews
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <Logo />
                            <p className="text-sm text-gray-600 mt-2">
                                &copy; {new Date().getFullYear()} ONE MAN. All rights reserved.
                            </p>
                        </div>
                        <div className="flex gap-8">
                            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                About
                            </Link>
                            <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Contact
                            </Link>
                            <Link to="/policy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;