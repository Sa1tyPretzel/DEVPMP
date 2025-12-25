import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Building, ArrowLeft, AlertCircle, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCreateCarrier } from "../hooks/useCarriers";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Card from "../components/UI/Card";

interface CarrierForm {
  name: string;
  main_office_address: string;
}

const AddCarrierPage: React.FC = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // API hooks
  const createCarrierMutation = useCreateCarrier();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarrierForm>();

  const onSubmit = async (data: CarrierForm) => {
    setError("");

    try {
      await createCarrierMutation.mutateAsync({
        name: data.name,
        main_office_address: data.main_office_address,
      });

      // Navigate back to dashboard instead of previous page
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error).message ||
        "Failed to create carrier";
      setError(errorMessage);
    }
  };

  // Check if user has permission
  if (isAdmin == null) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need admin privileges to add carriers.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Add New Carrier
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Register a new trucking carrier in the system
          </p>
        </div>
      </div>

      <Card className="p-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-600 dark:text-red-400">
              {error}
            </span>
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Carrier Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Carrier Information
            </h3>

            <div className="space-y-4">
              <Input
                label="Carrier Name"
                type="text"
                placeholder="ABC Trucking Company"
                error={errors.name?.message}
                {...register("name", {
                  required: "Carrier name is required",
                  minLength: {
                    value: 3,
                    message: "Carrier name must be at least 3 characters",
                  },
                  maxLength: {
                    value: 100,
                    message: "Carrier name cannot exceed 100 characters",
                  },
                })}
              />

              <Input
                label="Main Office Address"
                type="text"
                placeholder="123 Main Street, Richmond, VA 23220"
                icon={<MapPin className="w-4 h-4" />}
                error={errors.main_office_address?.message}
                {...register("main_office_address", {
                  required: "Main office address is required",
                  minLength: {
                    value: 10,
                    message: "Please enter a complete address",
                  },
                  maxLength: {
                    value: 200,
                    message: "Address cannot exceed 200 characters",
                  },
                })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={createCarrierMutation.isLoading}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={createCarrierMutation.isLoading}
              className="flex-1"
            >
              <Building className="w-4 h-4 mr-2" />
              Add Carrier
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">
                Carrier Registration Guidelines:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Carrier name should be the official business name</li>
                <li>
                  Main office address should be the primary business location
                </li>
                <li>
                  This information will be used for compliance and documentation
                </li>
                <li>
                  Drivers and vehicles will be associated with this carrier
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-start space-x-2">
            <Building className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="text-sm text-green-700 dark:text-green-300">
              <p className="font-medium mb-1">
                What happens after registration:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Carrier will appear in the system for vehicle and driver
                  assignment
                </li>
                <li>Admin users can manage vehicles under this carrier</li>
                <li>
                  Drivers can be associated with this carrier during
                  registration
                </li>
                <li>
                  All trip and compliance data will be linked to this carrier
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddCarrierPage;
