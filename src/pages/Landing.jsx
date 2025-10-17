import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 

const PRIMARY_COLOR = '#ea2e0e';
const HOVER_COLOR = '#c4250c';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 md:p-8">
      {/* Header and Call to Action */}
      <div className="w-full max-w-6xl text-center pt-12 pb-16">
        <div className="flex justify-center mb-6">
            <img 
                src={logo} 
                alt="ONE MAN Logo" 
                className="h-16 w-16 object-contain p-2 bg-white border-4 rounded-xl shadow-lg transition duration-300" 
                style={{ borderColor: PRIMARY_COLOR }}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/${PRIMARY_COLOR.substring(1)}/ffffff?text=LOGO`; }}
            />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Level Up Your Style with 
          <span className="ml-2" style={{ color: PRIMARY_COLOR }}>ONE MAN</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our premium, curated collection. Log in or register now to unlock exclusive prices and collections.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
          <Link 
            to="/signup" 
            className="px-8 py-3 text-lg font-semibold text-white rounded-lg shadow-xl transition duration-300 transform hover:scale-105 text-center disabled:bg-gray-400 disabled:shadow-none"
            style={{ backgroundColor: PRIMARY_COLOR, boxShadow: `0 4px 15px rgba(234, 46, 14, 0.4)` }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = HOVER_COLOR}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = PRIMARY_COLOR}
          >
            Get Started - Sign Up
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-3 text-lg font-semibold border-2 rounded-lg shadow-md transition duration-300 transform hover:scale-105 text-center hover:bg-white"
            style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
          >
            Already a Member? Log In
          </Link>
        </div>
      </div>
      
      {/* Feature / Product Preview Section */}
      <div className="w-full max-w-6xl bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl border-t-4" style={{ borderColor: PRIMARY_COLOR }}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-left">
              Featured Collections
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                <div 
                    className="h-36 sm:h-48 lg:h-56 bg-gray-300 flex items-center justify-center font-bold text-gray-500 text-lg"
                    style={{ backgroundImage: `url(https://placehold.co/600x400/${PRIMARY_COLOR.substring(1)}/ffffff?text=MEN+WEAR)`, backgroundSize: 'cover' }}
                >
                    
                </div>
                <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900">Men's Wear</h3>
                    <p className="text-sm text-gray-500 mt-1">Lightweight fabrics, essential fits.</p>
                    <Link to="/category/top-wear" className="mt-3 inline-flex items-center text-sm font-medium transition duration-150" style={{ color: PRIMARY_COLOR }}>
                        Shop Now &rarr;
                    </Link>
                </div>
            </div>

            {/* Mock Product Card 2 */}
            <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                {/* 🟢 Reduced mobile image height (h-36) and adjusted for medium/large screens */}
                <div 
                    className="h-36 sm:h-48 lg:h-56 bg-gray-300 flex items-center justify-center font-bold text-gray-500 text-lg"
                    style={{ backgroundImage: `url(https://placehold.co/600x400/374151/ffffff?text=WOMEN+WEAR)`, backgroundSize: 'cover' }}
                >
                </div>
                <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900">WOMEN WEAR</h3>
                    <p className="text-sm text-gray-500 mt-1">Tailored comfort for every occasion.</p>
                    <Link to="/category/bottom-wear" className="mt-3 inline-flex items-center text-sm font-medium transition duration-150" style={{ color: PRIMARY_COLOR }}>
                        Shop Now &rarr;
                    </Link>
                </div>
            </div>
            
            {/* Mock Product Card 3 */}
            <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 hidden lg:block">
                {/* 🟢 Reduced mobile image height (h-36) and adjusted for medium/large screens */}
                <div 
                    className="h-36 sm:h-48 lg:h-56 bg-gray-300 flex items-center justify-center font-bold text-gray-500 text-lg"
                    style={{ backgroundImage: `url(https://placehold.co/600x400/9ca3af/ffffff?text=SALE)`, backgroundSize: 'cover' }}
                >
                </div>
                <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900">New Arrivals</h3>
                    <p className="text-sm text-gray-500 mt-1">Be the first to see the latest drops.</p>
                    <Link to="/app" className="mt-3 inline-flex items-center text-sm font-medium transition duration-150" style={{ color: PRIMARY_COLOR }}>
                        View All &rarr;
                    </Link>
                </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
              <p className="text-lg text-gray-700 font-medium">
                  Ready to see more? <Link to="/signup" className="font-bold underline transition duration-150" style={{ color: PRIMARY_COLOR }}>Sign Up to browse the full catalog</Link>
              </p>
          </div>
      </div>


      {/* Footer Links */}
      <footer className="mt-16 mb-4 text-center text-gray-500">
        <p className="text-sm">A place for all your modern fashion needs.</p>
        <div className="mt-2 space-x-4">
          <Link to="/about" className="text-sm hover:underline transition duration-150" style={{ color: PRIMARY_COLOR }}>About Us</Link>
          <span className="text-gray-400">|</span>
          <Link to="/contact" className="text-sm hover:underline transition duration-150" style={{ color: PRIMARY_COLOR }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;