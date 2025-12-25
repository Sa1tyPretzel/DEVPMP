import React from "react";
import { Link } from "react-router-dom";
import { Truck, Mail, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-600 dark:bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-8 h-8 text-teal-400" />
              <span className="text-2xl font-bold font-poppins">RoadPulse</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Professional trucking platform designed for drivers. Simplify trip
              planning, ensure HOS compliance, and generate accurate ELD logs
              with confidence.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-8 bg-teal-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold">FMCSA</span>
              </div>
              <span className="text-sm text-gray-400">Compliant</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Driver Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Sign Up Free
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@roadpulse.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>1-800-ROADPULSE</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>Available 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 RoadPulse. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
