import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-100 pt-16 pb-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-gray-700 font-semibold text-lg mb-4">LEARN MORE</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-600 hover:text-gray-900">
                  Press Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-gray-600 hover:text-gray-900">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-700 font-semibold text-lg mb-4">PROUDLY SERVING</h3>
            <p className="text-gray-600">
              K-12 Education Leaders from around the Globe
            </p>
          </div>

          <div>
            <h3 className="text-gray-700 font-semibold text-lg mb-4">JOIN US</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/become-mentor" className="text-gray-600 hover:text-gray-900">
                  Become a Mentor
                </Link>
              </li>
              <li>
                <Link to="/partner" className="text-gray-600 hover:text-gray-900">
                  Partner with Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 hover:text-gray-900">
                  Work for Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-700 font-semibold text-lg mb-4">CONNECT WITH US</h3>
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-800"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm">
              &copy; 2024 linkedleaders.com
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/policies" className="text-gray-500 text-sm hover:text-gray-700">
                Policies and Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}