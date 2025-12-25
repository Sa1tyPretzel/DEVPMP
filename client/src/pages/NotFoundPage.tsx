import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Truck } from "lucide-react";
import Button from "../components/UI/Button";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8">
          <div className="relative">
            <motion.div
              animate={{
                x: [0, 10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-teal-600 dark:text-teal-400"
            >
              <Truck className="w-24 h-24 mx-auto" />
            </motion.div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gray-300 dark:bg-gray-600 rounded-full opacity-30"></div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white font-poppins mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Route Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Looks like this truck took a wrong turn! The page you're looking for
            doesn't exist or has been moved to a new location.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/" className="block">
            <Button className="w-full" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact our{" "}
            <a
              href="mailto:support@roadpulse.com"
              className="text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
            >
              support team
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
