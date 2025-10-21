import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png'; 

const PRIMARY_COLOR = '#ea2e0e';

const Policy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8">
      
      {/* Header Section */}
      <header className="w-full max-w-4xl text-center py-6 border-b-2 mb-8" style={{ borderColor: PRIMARY_COLOR }}>
        <div className="flex justify-center mb-4">
            <img 
                src={logo} 
                alt="ONE MAN Logo" 
                className="h-10 w-10 object-contain p-1 bg-white border-2 rounded-xl shadow-md" 
                style={{ borderColor: PRIMARY_COLOR }}
            />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Last Updated: October 21, 2025
        </p>
      </header>

      {/* Content Section (Mobile-First Layout) */}
      <main className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-xl shadow-lg border-t-4" style={{ borderColor: PRIMARY_COLOR }}>
        
        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ color: PRIMARY_COLOR }}>1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            Welcome to ONE MAN Boutique. We are committed to protecting your privacy and personal information. This policy explains how we collect, use, disclose, and safeguard your information when you visit our website, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the "Site"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ color: PRIMARY_COLOR }}>2. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed text-base mb-3">
            We collect personal information that you voluntarily provide to us when you register on the Site, place an order, or contact us.
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4 text-gray-700">
            <li>Personal Data: Name, email address, phone number, shipping address, and billing address.</li>
            <li>Financial Data:Payment card information (processed securely by third-party payment processors like Stripe or PayPal). We do **not** store sensitive financial data on our servers.</li>
            <li>Usage Data:Information about how you access and use the Site, such as IP address, browser type, and pages viewed.</li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ color: PRIMARY_COLOR }}>3. Use of Your Information</h2>
          <p className="text-gray-700 leading-relaxed text-base mb-3">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4 text-gray-700">
            <li>Process transactions and fulfill your orders.</li>
            <li>Manage your account and registration.</li>
            <li>Send you product updates, marketing communications (if consented to), and newsletters.</li>
            <li>Improve the functionality and user experience of the Site.</li>
            <li>Respond to customer service requests and contact inquiries.</li>
          </ul>
        </section>
        
        {/* Disclosure of Your Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ color: PRIMARY_COLOR }}>4. Disclosure of Your Information</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            We may share information with third parties only when necessary to provide our services, including:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4 text-gray-700">
            <li>Service Providers: Third parties who perform services for us (e.g., payment processing, shipping carriers, email delivery).</li>
            <li>Legal Obligations: When required by law or in response to a court order.</li>
          </ul>
        </section>

        {/* Cookies and Tracking */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ color: PRIMARY_COLOR }}>5. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            We use cookies (small text files placed on your device) and similar tracking technologies (like the JWT cookie used for authentication) to help us customize the Site and improve your experience. You can choose to disable cookies through your browser settings, but please note that this may affect the functionality of the Site (e.g., logging in or maintaining a shopping cart).
          </p>
        </section>

        {/* Your Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ color: PRIMARY_COLOR }}>6. Your Privacy Rights</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            You have the right to access, update, or delete your personal information at any time by logging into your account or contacting us directly via the details below.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ color: PRIMARY_COLOR }}>7. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2 font-semibold text-gray-800">
            [support@onemanboutique@gmail.com]
          </p>
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-2 text-base font-semibold text-white rounded-lg transition duration-300"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Back to Home
            </Link>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="mt-8 mb-4 text-center text-gray-500 w-full max-w-4xl">
        <p className="text-sm">A place for all your modern fashion needs.</p>
      </footer>
    </div>
  );
};

export default Policy;