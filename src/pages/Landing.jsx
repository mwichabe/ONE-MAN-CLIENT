import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import axios from 'axios';

const PRIMARY_COLOR = '#ea2e0e';
const HOVER_COLOR = '#c4250c';

const API_URL = 'https://one-man-server.onrender.com/api'; 
const BYPASS_KEY = 'NIVORA_ADMIN_TEST_BYPASS_2025';

// Helper component for a single product card
const ProductCard = ({ product }) => {
    // Ensure image is available, fallback to placeholder
    const imageUrl = 
        product.imageUrls && product.imageUrls.length > 0 
            ? product.imageUrls[0] 
            : `https://placehold.co/600x400/9ca3af/ffffff?text=Image+Missing`;
            return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
            {/* Image Container - Aspect ratio for visual appeal */}
            <div 
                className="w-full aspect-square bg-gray-200 bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
                aria-label={`Image of ${product.name}`}
            >
            </div>
            <div className="p-4 flex flex-col justify-between h-32"> {/* Fixed height for consistent look */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 truncate" title={product.name}>
                        {product.name}
                    </h3>
                    <p className="text-sm font-semibold mt-1" style={{ color: PRIMARY_COLOR }}>
                        ${product.price ? product.price.toFixed(2) : 'N/A'}
                    </p>
                </div>
                {/* Link to view product details - assuming a route exists */}
                <Link 
                    to={`/product/${product._id}`} 
                    className="mt-2 inline-flex items-center text-sm font-medium transition duration-150" 
                    style={{ color: PRIMARY_COLOR }}
                >
                    View Details &rarr;
                </Link>
            </div>
        </div>
    );
};

const Landing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/admin/products/public-list`, {
                    headers: {
                        'x-debug-bypass': BYPASS_KEY, // The magic header
                    },
                });
                // Take the first 6 products for a clean preview
                setProducts(response.data.slice(0, 6)); 
                setError(null);
            } catch (err) {
                console.error("Failed to fetch public products:", err);
                // Even on error, we still want to show the landing page
                setError("Could not load featured products. Try again later."); 
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);


  const renderProductContent = () => {
        if (loading) {
            return (
                <div className="text-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: PRIMARY_COLOR }}></div>
                    <p className="mt-4 text-gray-600">Loading awesome products...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-medium">⚠️ {error}</p>
                    <p className="text-sm text-red-500 mt-1">Showing placeholder images instead.</p>
                </div>
            );
        }

        if (products.length === 0) {
             return (
                <div className="text-center p-10 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 font-medium">No products available yet!</p>
                    <p className="text-sm text-yellow-500 mt-1">Log in as admin to add products.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            {/* Header and Call to Action */}
            <div className="w-full max-w-7xl text-center pt-8 pb-10">
                <div className="flex justify-center mb-4">
                    <img 
                        src={logo} 
                        alt="ONE MAN Logo" 
                        className="h-12 w-12 object-contain p-1 bg-white border-2 rounded-xl shadow-md transition duration-300" 
                        style={{ borderColor: PRIMARY_COLOR }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/48x48/${PRIMARY_COLOR.substring(1)}/ffffff?text=LOGO`; }}
                    />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-snug">
                    Level Up Your Style with 
                    <span className="ml-1" style={{ color: PRIMARY_COLOR }}>ONE MAN</span>
                </h1>
                <p className="mt-3 text-lg text-gray-600 max-w-xl mx-auto">
                    Explore our premium, curated collection. Log in or register now to unlock exclusive prices and collections.
                </p>

                {/* Action Buttons - Optimized for Mobile Stacking */}
                <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center px-4">
                    <Link 
                        to="/signup" 
                        className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white rounded-lg shadow-xl transition duration-300 transform hover:scale-[1.02] text-center disabled:bg-gray-400"
                        style={{ backgroundColor: PRIMARY_COLOR, boxShadow: `0 4px 15px rgba(234, 46, 14, 0.4)` }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = HOVER_COLOR}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = PRIMARY_COLOR}
                    >
                        Get Started - Sign Up
                    </Link>
                    <Link 
                        to="/login" 
                        className="w-full sm:w-auto px-6 py-3 text-base font-semibold border-2 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] text-center hover:bg-white"
                        style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                    >
                        Already a Member? Log In
                    </Link>
                </div>
            </div>
            
            {/* --- FEATURED PRODUCT PREVIEW SECTION --- */}
            <div className="w-full max-w-7xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 mb-12" style={{ borderColor: PRIMARY_COLOR }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left border-b pb-2">
                    Latest Arrivals 🛍️
                </h2>
                
                {renderProductContent()}
                
                <div className="text-center mt-8">
                    <p className="text-base text-gray-700 font-medium">
                        SignUp to <Link to="/app" className="font-bold underline transition duration-150" style={{ color: PRIMARY_COLOR }}>Browse the Full Catalog</Link>
                    </p>
                </div>
            </div>


            {/* Footer Links */}
            <footer className="mt-auto mb-4 text-center text-gray-500 w-full max-w-7xl border-t pt-4">
                <p className="text-sm">&copy; {new Date().getFullYear()} ONE MAN Boutique. All rights reserved.</p>
                <div className="mt-2 space-x-4">
                    <Link to="/about" className="text-sm hover:underline transition duration-150" style={{ color: PRIMARY_COLOR }}>About</Link>
                    <span className="text-gray-400">|</span>
                    <Link to="/contact" className="text-sm hover:underline transition duration-150" style={{ color: PRIMARY_COLOR }}>Contact</Link>
                    <span className="text-gray-400">|</span>
                    <Link to="/policy" className="text-sm hover:underline transition duration-150" style={{ color: PRIMARY_COLOR }}>Privacy</Link>
                </div>
            </footer>
        </div>
    );
};

export default Landing;