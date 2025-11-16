import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PRIMARY_COLOR = '#ea2e0e';
const HOVER_COLOR = '#c4250c';
const API_URL = 'https://one-man-server.onrender.com/api/admin/products';
const BYPASS_KEY = 'NIVORA_ADMIN_TEST_BYPASS_2025';
import logo from '../assets/logo.png';

// Placeholder logo component
const Logo = () => (
    <div className="flex items-center">
        <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3"
            style={{ backgroundColor: PRIMARY_COLOR }}
        >
            <img src={logo} alt="OM" />
        </div>
        <span className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>ONE MAN</span>
    </div>
);

// Helper component for a single product card
const ProductCard = ({ product }) => {
    const imageUrl = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : `https://placehold.co/600x400/9ca3af/ffffff?text=Image+Missing`;

    console.log(`Product ${product.name} imageUrl:`, imageUrl); // Debug: Check image URL

    return (
        <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
            {/* Image Container with Overlay */}
            <div className="w-full aspect-square overflow-hidden bg-gray-100">
                <img
                    src={imageUrl}
                    alt={`Image of ${product.name}`}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log(`✅ Image loaded: ${product.name}`)}
                    onError={(e) => {
                        console.error(`❌ Image failed to load for ${product.name}:`, imageUrl);
                        e.target.src = `https://placehold.co/600x400/9ca3af/ffffff?text=Image+Missing`;
                    }}
                />
                {/* New Arrival Badge */}
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    New
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <Link
                        to={`/product/${product._id}`}
                        className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-lg hover:shadow-xl"
                        aria-label={`View details for ${product.name}`}
                    >
                        View Details
                    </Link>
                </div>
            </div>
            <div className="p-5 flex flex-col justify-between min-h-[144px]">
                <div>
                    {/* Category Badge */}
                    {product.category && (
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full mb-2">
                            {product.category}
                        </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 truncate mb-1" title={product.name}>
                        {product.name}
                    </h3>
                    {/* Short Description */}
                    {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2" title={product.description}>
                            {product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description}
                        </p>
                    )}
                </div>
                <div className="flex justify-between items-center mt-3">
                    <p className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                        ${product.price ? product.price.toFixed(2) : 'N/A'}
                    </p>
                    {/* Rating */}
                    <div className="flex items-center">
                        <span className="text-yellow-400 text-sm" aria-label="Rating: 4.5 out of 5 stars">★★★★☆</span>
                        <span className="text-gray-500 text-xs ml-1">(4.5)</span>
                    </div>
                </div>
            </div>
        </article>
    );
};

const Landing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log('API Response:', response.data); // Debug: Check what products are returned
                setProducts(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch public products:", err);
                setError("Could not load featured products. Please try again later.");
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
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto"
                        style={{ borderColor: PRIMARY_COLOR }}
                        role="status"
                        aria-label="Loading products"
                    ></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading our exclusive collection...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
                    <p className="text-red-600 font-medium text-lg">⚠️ {error}</p>
                    <p className="text-sm text-red-500 mt-2">Please check back soon.</p>
                </div>
            );
        }

        if (products.length === 0) {
            return (
                <div className="text-center py-10 px-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-700 font-medium text-lg">🎉 Coming Soon!</p>
                    <p className="text-sm text-yellow-600 mt-2">Our exclusive collection is being curated. Check back soon!</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
            {/* Navigation Bar */}
            <nav className="w-full bg-white shadow-md border-b border-gray-200 sticky top-0 z-50" role="navigation">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Logo />
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:bg-gray-100"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                style={{ backgroundColor: PRIMARY_COLOR }}
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                    {/* Hero Section */}
                    <header className="text-center py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-white via-gray-50 to-white rounded-3xl shadow-xl border border-gray-100 mb-12 sm:mb-16">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4 sm:mb-6 px-4">
                            Elevate Your Style with
                            <span className="block mt-2" style={{ color: PRIMARY_COLOR }}>ONE MAN</span>
                        </h1>
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
                            Discover premium fashion curated for the modern gentleman. Join thousands of satisfied customers in our exclusive community.
                        </p>

                        {/* Key Stats */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 px-4">
                            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                                <div className="text-3xl sm:text-4xl font-bold" style={{ color: PRIMARY_COLOR }}>10K+</div>
                                <div className="text-sm sm:text-base text-gray-600 mt-1">Happy Customers</div>
                            </div>
                            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                                <div className="text-3xl sm:text-4xl font-bold" style={{ color: PRIMARY_COLOR }}>500+</div>
                                <div className="text-sm sm:text-base text-gray-600 mt-1">Premium Products</div>
                            </div>
                            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                                <div className="text-3xl sm:text-4xl font-bold" style={{ color: PRIMARY_COLOR }}>99%</div>
                                <div className="text-sm sm:text-base text-gray-600 mt-1">Satisfaction Rate</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 sm:px-6">
                            <Link
                                to="/signup"
                                className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-center"
                                style={{
                                    backgroundColor: PRIMARY_COLOR,
                                    boxShadow: `0 10px 30px rgba(234, 46, 14, 0.4)`
                                }}
                            >
                                Get Started - Sign Up
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-semibold border-2 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 text-center bg-white hover:shadow-xl"
                                style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                            >
                                Already a Member? Log In
                            </Link>
                        </div>
                    </header>

                    {/* Features Section */}
                    <section className="mb-12 sm:mb-16" aria-labelledby="features-heading">
                        <h2 id="features-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
                            Why Choose ONE MAN?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="text-5xl mb-4" role="img" aria-label="Premium Quality">👔</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Quality</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Handpicked garments from top designers, ensuring unmatched style and durability.</p>
                            </div>
                            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="text-5xl mb-4" role="img" aria-label="Fast Shipping">🚚</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Shipping</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Free worldwide shipping with express delivery options for premium members.</p>
                            </div>
                            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="text-5xl mb-4" role="img" aria-label="Secure Payments">🔒</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Payments</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">256-bit SSL encryption and multiple payment methods for peace of mind.</p>
                            </div>
                            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="text-5xl mb-4" role="img" aria-label="Investor Ready">💼</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Investor Ready</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Scalable platform with proven growth metrics and a loyal customer base.</p>
                            </div>
                        </div>
                    </section>

                    {/* Testimonials Section */}
                    <section className="mb-12 sm:mb-16" aria-labelledby="testimonials-heading">
                        <h2 id="testimonials-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
                            What Our Customers Say
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                            <blockquote className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                <div className="text-yellow-400 text-xl mb-3" aria-label="5 out of 5 stars">★★★★★</div>
                                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed italic">"ONE MAN has revolutionized my wardrobe. The quality is exceptional and the style is timeless."</p>
                                <footer className="text-xs sm:text-sm font-semibold text-gray-800">— Alex Johnson, Entrepreneur</footer>
                            </blockquote>
                            <blockquote className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                <div className="text-yellow-400 text-xl mb-3" aria-label="5 out of 5 stars">★★★★★</div>
                                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed italic">"Fast shipping and secure payments. This platform is built for the modern businessman."</p>
                                <footer className="text-xs sm:text-sm font-semibold text-gray-800">— Michael Chen, Investor</footer>
                            </blockquote>
                            <blockquote className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                <div className="text-yellow-400 text-xl mb-3" aria-label="5 out of 5 stars">★★★★★</div>
                                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed italic">"The attention to detail and customer service is unmatched. Highly recommend!"</p>
                                <footer className="text-xs sm:text-sm font-semibold text-gray-800">— David Smith, CEO</footer>
                            </blockquote>
                        </div>
                    </section>

                    {/* Featured Products Section */}
                    <section
                        className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border-t-4 mb-12"
                        style={{ borderColor: PRIMARY_COLOR }}
                        aria-labelledby="products-heading"
                    >
                        <h2 id="products-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 border-b-2 pb-4">
                            Our Exclusive Collection 💎
                        </h2>

                        {renderProductContent()}

                        <div className="text-center mt-8 sm:mt-10">
                            <p className="text-base sm:text-lg text-gray-700 font-medium">
                                <Link
                                    to="/signup"
                                    className="font-bold underline hover:no-underline transition duration-200"
                                    style={{ color: PRIMARY_COLOR }}
                                >
                                    Sign Up
                                </Link>
                                {' '}to browse the full catalog and unlock exclusive deals
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-auto" role="contentinfo">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-sm sm:text-base text-center text-gray-600 mb-4">
                        &copy; {new Date().getFullYear()} ONE MAN Boutique. All rights reserved.
                    </p>
                    <nav className="flex flex-wrap justify-center items-center gap-2 sm:gap-4" aria-label="Footer navigation">
                        <Link
                            to="/about"
                            className="text-sm sm:text-base hover:underline transition duration-200"
                            style={{ color: PRIMARY_COLOR }}
                        >
                            About
                        </Link>
                        <span className="text-gray-400">|</span>
                        <Link
                            to="/contact"
                            className="text-sm sm:text-base hover:underline transition duration-200"
                            style={{ color: PRIMARY_COLOR }}
                        >
                            Contact
                        </Link>
                        <span className="text-gray-400">|</span>
                        <Link
                            to="/policy"
                            className="text-sm sm:text-base hover:underline transition duration-200"
                            style={{ color: PRIMARY_COLOR }}
                        >
                            Privacy Policy
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
};

export default Landing;