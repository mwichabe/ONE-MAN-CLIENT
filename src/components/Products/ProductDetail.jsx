import React, { useState, useEffect, useContext, createContext } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

// --- API Endpoints ---
const PRODUCT_API_BASE_URL = 'https://one-man-server.onrender.com/api/admin/products';
const CART_API_URL = 'https://one-man-server.onrender.com/api/cart';
// --- End API Endpoints ---

// Define a universal placeholder image for robustness
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/CCCCCC/666666?text=No+Image';

const CheckIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ProductDetail = () => {
  // Destructuring isLoggedIn from the context stub
  const { isLoggedIn } = useAuth();
  const { refreshCart } = useCart();
  const { id } = useParams(); // Get product ID from URL

  // Check if user is logged in - if not, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="bg-gray-100 min-h-screen py-12 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-10 bg-white shadow-2xl rounded-xl text-center border-t-4 border-[#ea2e0e]">
          <div className="mb-6">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view product details and make purchases.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full block px-6 py-3 bg-[#ea2e0e] text-white font-semibold rounded-lg shadow-md hover:bg-[#c4250c] transition duration-200"
            >
              Login to Continue
            </Link>
            <Link
              to="/signup"
              className="w-full block px-6 py-3 border-2 border-[#ea2e0e] text-[#ea2e0e] font-semibold rounded-lg hover:bg-[#ea2e0e] hover:text-white transition duration-200"
            >
              Don't have an account? Sign Up
            </Link>
            <Link
              to="/"
              className="block text-sm text-gray-500 hover:text-gray-700 transition duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // New state for add to cart loading

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages


  // Function to fetch specific product
  useEffect(() => {
    const fetchProduct = async () => {
      console.log('Fetching product with ID:', id);

      let productId = id;

      // If no ID provided, fetch a random product
      if (!id) {
        console.log('No ID provided, fetching random product');
        try {
          const randomResponse = await fetch(`${PRODUCT_API_BASE_URL}/random`);
          if (randomResponse.ok) {
            const randomProduct = await randomResponse.json();
            productId = randomProduct._id;
            console.log('Fetched random product with ID:', productId);
          } else {
            throw new Error('Could not fetch random product');
          }
        } catch (err) {
          console.error('Failed to fetch random product:', err);
          setLoading(false);
          setError('Unable to load a product. Please try again.');
          return;
        }
      }

      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('Request timeout - setting error state');
        setLoading(false);
        setError('Request timed out. Please try again.');
        setProduct(null);
      }, 10000); // 10 second timeout

      try {
        setLoading(true);
        setError(null);
        console.log('Starting fetch for:', `${PRODUCT_API_BASE_URL}/${productId}`);

        // Using product-specific endpoint
        const response = await fetch(`${PRODUCT_API_BASE_URL}/${productId}`);
        clearTimeout(timeout); // Clear timeout if request completes
        console.log('Response status:', response.status);

        if (!response.ok) {
          // Handle non-200 responses gracefully
          if (response.status === 404) {
            console.log('Product not found (404)');
            setProduct(null);
            setError("Product not found");
            setLoading(false);
            return;
          }
          const errorText = await response.text();
          console.error("Server Error Response:", errorText);
          throw new Error(`Failed to fetch product. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Product data received:', data);

        // Check if data is null or invalid
        if (!data || !data.name) {
          console.log('Invalid product data received');
          setProduct(null);
          setError("Product not found");
          setLoading(false);
          return;
        }

        setProduct(data);
        setError(null); // Clear any previous errors

        // Safely set selectedImage state
        const firstImage = data.imageUrls && data.imageUrls.length > 0
          ? data.imageUrls[0]
          : PLACEHOLDER_IMAGE;

        setSelectedImage(firstImage);
        console.log('Product loaded successfully');

      } catch (err) {
        clearTimeout(timeout); // Clear timeout on error
        console.error("Fetch Error:", err);
        setError(err.message || "We encountered an issue loading product data.");
        setProduct(null);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Run when ID changes

  // Helper function to format price
  const formatPrice = (price) => `Ksh ${(price).toFixed(2)}`;

  // --- Derived Calculations (moved up to be available for handleAddToCart) ---
  let originalPrice = 0;
  let discountedPrice = 0;
  const DISCOUNT_RATE = 0.20; // Fixed 20% discount

  if (product) {
    originalPrice = product.price;
    discountedPrice = originalPrice * (1 - DISCOUNT_RATE);
    // Note: discountPercentage is still calculated for display later
  }
  // ----------------------------

  // Handles the API call to add the item to the cart
  const handleAddToCart = async () => {

    // Pre-check: Not logged in
    if (!isLoggedIn) {
      setError("You must be logged in to add items to your cart.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Pre-check: Size not selected
    if (product.sizes.length > 0 && !selectedSize) {
      setError("Please select a size before adding to cart.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Pre-check: Product data missing
    if (!product) {
      setError("Cannot add to cart: Product data is unavailable.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setError(null);
    setSuccessMessage('');
    setIsAdding(true);

    // Assuming DISCOUNT_RATE is defined as a constant in this file (e.g., const DISCOUNT_RATE = 0.20;)
    const DISCOUNT_RATE = 0.20;

    // ✅ MODIFICATION: Calculate the discounted price (20% off)
    const priceToSend = product.price * (1 - DISCOUNT_RATE);

    // Determine the size to send
    const finalSize = selectedSize || (product.sizes.length === 0 ? 'One Size' : null);
    const quantity = 1;

    try {
      const token = localStorage.getItem('token');

      // Use axios for consistency if possible, but fetch works too. Sticking to fetch as provided.
      const response = await fetch(CART_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          size: finalSize,
          quantity: quantity,
          // ✅ MODIFICATION: Send the discounted price (Product Details price rule)
          price: parseFloat(priceToSend.toFixed(2)),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Item added to cart successfully!');
        refreshCart();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to add item to cart. Please try again.');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error("Add to Cart Error:", err);
      setError('A network error occurred while adding to cart.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsAdding(false);
    }
  };

  // --- Derived Calculations for Display (can remain here) ---
  const discountPercentage = DISCOUNT_RATE * 100;
  // ----------------------------------------------------------

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen py-12 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">
          Searching for the best deals...
        </div>
      </div>
    );
  }

  // Determine availability status based on stock
  const isAvailable = product && product.stock > 0;
  const isButtonDisabled = isAdding || !isAvailable || (product?.sizes.length > 0 && !selectedSize);

  // Only show error state if there's an actual error, not if product is null during loading
  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen py-12 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-10 bg-white shadow-2xl rounded-xl text-center border-t-4 border-[#ea2e0e]">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Product
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <Link
              to="/shop"
              className="w-full block px-6 py-3 bg-[#ea2e0e] text-white font-semibold rounded-lg shadow-md hover:bg-[#c4250c] transition duration-200"
            >
              Browse Products
            </Link>
            <Link
              to="/app"
              className="block text-sm text-gray-500 hover:text-gray-700 transition duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Only show "not found" if we're not loading and product is still null
  if (!loading && !product) {
    return (
      <div className="bg-gray-100 min-h-screen py-12 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-10 bg-white shadow-2xl rounded-xl text-center border-t-4 border-[#ea2e0e]">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested product is currently unavailable.
          </p>
          <div className="space-y-3">
            <Link
              to="/shop"
              className="w-full block px-6 py-3 bg-[#ea2e0e] text-white font-semibold rounded-lg shadow-md hover:bg-[#c4250c] transition duration-200"
            >
              Browse Products
            </Link>
            <Link
              to="/app"
              className="block text-sm text-gray-500 hover:text-gray-700 transition duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Destructure product for clean rendering
  const { name, description, imageUrls, sizes, stock, category } = product;
  const imagesToDisplay = imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_IMAGE];


  return (
    // 🟢 Smaller container padding and fixed max-width for cleaner look
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden md:flex">

        {/* Image Gallery */}
        {/* 🟢 Reduced padding and made image container slightly smaller (md:w-5/12) */}
        <div className="md:w-5/12 p-4 md:p-6 flex flex-col items-center border-r border-gray-100">
          {/* Main Image */}
          <div className="w-full mb-4 aspect-square">
            <img
              src={selectedImage}
              alt={name}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          {/* Thumbnails */}
          <div className="w-full flex justify-center space-x-3 overflow-x-auto pb-2">
            {imagesToDisplay.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${name} thumbnail ${index + 1}`}
                // 🟢 Smaller thumbnails for better use of space
                className={`w-20 h-20 object-cover rounded-md cursor-pointer transition-all duration-200 hover:opacity-80
                  ${selectedImage === url
                    ? "border-3 border-[#ea2e0e] shadow-md ring-2 ring-[#ea2e0e]"
                    : "border border-gray-300"
                  }`}
                onClick={() => setSelectedImage(url)}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        {/* 🟢 Slightly larger detail container (md:w-7/12) and refined padding */}
        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className="text-sm font-semibold uppercase text-[#ea2e0e] mb-1 block">{category}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {name}
            </h1>

            {/* Price and Stock Row (CONSOLIDATED) */}
            <div className="flex flex-col mb-6 pt-3 border-t border-gray-100">
              <div className="flex items-baseline">
                {/* 🟢 Display Discounted Price */}
                <span className="text-4xl font-extrabold text-[#ea2e0e] mr-4">
                  {formatPrice(discountedPrice)}
                </span>
                {/* 🟢 Display Original Price */}
                <span className="text-xl text-gray-500 line-through mr-3">
                  {formatPrice(originalPrice)}
                </span>
                {/* 🟢 Display Discount Percentage (Fixed 20%) */}
                <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  SAVE {discountPercentage.toFixed(0)}%
                </span>
              </div>

              {/* 🟢 Display Stock */}
              <div className="mt-2">
                <span className={`text-md font-semibold ${stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {stock > 0 ? `In Stock: ${stock} items` : 'Currently Sold Out'}
                </span>
              </div>
            </div>
            {/* Status Messages */}
            {successMessage && (
              <div className="flex items-center p-3 mb-4 text-sm font-medium text-green-700 bg-green-100 rounded-lg border border-green-300">
                <CheckIcon className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
            )}
            {error && (
              <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 rounded-lg border border-red-300">
                {error}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-base text-gray-700 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-8 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Select Size
              {sizes.length === 0 && <span className="text-sm font-normal text-gray-500 ml-2">(One size fits all)</span>}
            </h3>
            <div className="flex flex-wrap gap-3">
              {sizes.length > 0 ? (
                sizes.map((size, index) => (
                  <button
                    key={index}
                    disabled={stock === 0}
                    className={`px-5 py-2 border-2 rounded-lg font-medium text-sm transition-all duration-200 
                      ${selectedSize === size
                        ? "bg-[#ea2e0e] text-white border-[#ea2e0e] shadow-md"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                      }
                      ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <button
                  disabled={stock === 0}
                  className={`px-5 py-2 border-2 rounded-lg font-medium text-sm opacity-70 
                      ${stock === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100 text-gray-500'}`}
                >
                  One Size
                </button>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 text-xl font-bold text-white rounded-lg shadow-lg transition-all duration-300 
                ${!isButtonDisabled
                ? 'bg-[#ea2e0e] hover:bg-[#c4250c] active:scale-[0.99]'
                : 'bg-gray-400 cursor-not-allowed'
              }`
            }
            disabled={isButtonDisabled}
          >
            {isAdding
              ? 'Adding...'
              : !isAvailable
                ? 'Notify Me When Available'
                : (sizes.length > 0 && !selectedSize)
                  ? 'Select Size to Add'
                  : 'Add to Cart'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;