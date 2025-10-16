import React, {useState} from "react";
import { IoLogoInstagram } from "react-icons/io";
import { RiTwitterXLine } from "react-icons/ri";
import { TbBrandMeta } from "react-icons/tb";
import { Link } from "react-router-dom";
import {FiPhoneCall} from "react-icons/fi"
import axios from "axios";

const Footer = () => {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setIsError(false);
    setIsLoading(true);

    try {
      // NOTE: Replace with your actual base URL if it's not the same as the server port
      const API_URL = "https://one-man-server.onrender.com/api/subscribe"; 
      
      const response = await axios.post(API_URL, { email });

      // Success
      setMessage(response.data.message);
      setIsError(false);
      setEmail(""); // Clear the input field
    } catch (error) {
      // Error handling
      const errorMessage =
        error.response?.data?.message || "Subscription failed. Please try again.";
      
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <footer className="border-t py-12 ">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0 ">
        <div>
          <h3 className="text-lg text-gray-800 mb-4 ">Newsletter</h3>
          <p className="text-gray-500 mb-4 ">
            Be the first to hear about new products, exclusive events and online
            offers!
          </p>
          {/* News letter form - UPDATED */}
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="flex">
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="p-3 w-full text-sm border-t border-l border-b border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? "Subscribing..." : "Subscribe"}
                </button>
            </div>
            {/* Subscription Message Feedback */}
            {message && (
                <p 
                    className={`mt-2 text-sm font-medium ${isError ? 'text-red-500' : 'text-green-600'}`}
                >
                    {message}
                </p>
            )}
          </form>
        </div>
        {/* Shop Links */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4 ">Shop</h3>
          <ul className="space-y-2 text-gray-600 ">
            <li>
              <Link to="/category/men" className="hover:text-gray-600 transition-colors ">
                Men's Wear
              </Link>
            </li>
            <li>
              <Link to="/category/women" className="hover:text-gray-600 transition-colors ">
                Women's Wear
              </Link>
            </li>
            <li>
              <Link to="/category/bottom-wear" className="hover:text-gray-600 transition-colors ">
                Bottom Wear
              </Link>
            </li>
            <li>
              <Link to="/category/top-wear" className="hover:text-gray-600 transition-colors ">
                Top Wear
              </Link>
            </li>
          </ul>
        </div>
        {/* Support Links */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4 ">Support</h3>
          <ul className="space-y-2 text-gray-600 ">
            <li>
              <Link to="/contact" className="hover:text-gray-600 transition-colors ">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gray-600 transition-colors ">
                About Us
              </Link>
            </li>
          </ul>
        </div>
        {/* Follow us */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4 ">Follow Us</h3>
          <div className="flex items-center space-x-4 mb-6">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500 "
            >
              <TbBrandMeta className="h-5 w-5"/>
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500 "
            >
              <IoLogoInstagram className="h-5 w-5"/>
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500 "
            >
              <RiTwitterXLine className="h-4 w-4"/>
            </a>
          </div>
          <p className="text-gray-500 mb-2">Call Us</p>
          <div className="space-y-1">
              <a 
                  href="tel:+254704858069"
                  className="text-gray-800 text-sm font-medium block hover:text-[#ea2e0e] transition-colors"
              >
                  <FiPhoneCall className="inline-block mr-2 h-4 w-4" />
                  +254 704 858 069
              </a>
              <a 
                  href="tel:+254707392813"
                  className="text-gray-800 text-sm font-medium block hover:text-[#ea2e0e] transition-colors"
              >
                  <FiPhoneCall className="inline-block mr-2 h-4 w-4" />
                  +254 707 392 813
              </a>
          </div>
        </div>
      </div>
      {/*Footer Bottom */}
      <div className="container mx-auto mt-12 px-4 lg:px-0 border-t border-gray-200 pt-6 ">
        <p className="text-gray-500 text-sm tracking-tighter text-center">
          © 2025, ONE MAN BOTIQUE, All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
export default Footer;