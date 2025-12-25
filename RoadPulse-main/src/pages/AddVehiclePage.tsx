import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Truck, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCarriers } from "../hooks/useCarriers";
import { useCreateVehicle } from "../hooks/useVehicles";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Card from "../components/UI/Card";

interface VehicleForm {
  vehicle_number: string;
  license_plate: string;
  state: string;
  carrier: number;
}

const AddVehiclePage: React.FC = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // API hooks
  const { data: carriers = [], isLoading: carriersLoading } = useCarriers();
  const createVehicleMutation = useCreateVehicle();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleForm>();

  // US States for dropdown
  const usStates = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  const onSubmit = async (data: VehicleForm) => {
    setError("");

    try {
      await createVehicleMutation.mutateAsync({
        vehicle_number: data.vehicle_number,
        license_plate: data.license_plate,
        state: data.state,
        carrier: data.carrier,
      });

      // Navigate back to dashboard instead of previous page
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error).message ||
        "Failed to create vehicle";
      setError(errorMessage);
    }
  };

  // Check if user has permission
  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need admin privileges to add vehicles.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (carriersLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-8"></div>
          <Card className="p-8">
            <div className="space-y-6">
              <div className="h-20 bg-gray-300 rounded"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          </Card>
        </div>
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
            Add New Vehicle
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Register a new vehicle in the system
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
          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Vehicle Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Vehicle Number"
                type="text"
                placeholder="TRK001"
                error={errors.vehicle_number?.message}
                {...register("vehicle_number", {
                  required: "Vehicle number is required",
                  minLength: {
                    value: 3,
                    message: "Vehicle number must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message:
                      "Vehicle number can only contain uppercase letters and numbers",
                  },
                })}
              />

              <Input
                label="License Plate"
                type="text"
                placeholder="ABC123"
                error={errors.license_plate?.message}
                {...register("license_plate", {
                  required: "License plate is required",
                  minLength: {
                    value: 2,
                    message: "License plate must be at least 2 characters",
                  },
                  maxLength: {
                    value: 10,
                    message: "License plate cannot exceed 10 characters",
                  },
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  {...register("state", { required: "State is required" })}
                >
                  <option value="">Select a state</option>
                  {usStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Carrier
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  {...register("carrier", {
                    required: "Carrier is required",
                    valueAsNumber: true,
                  })}
                >
                  <option value="">Select a carrier</option>
                  {carriers.map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </option>
                  ))}
                </select>
                {errors.carrier && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.carrier.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={createVehicleMutation.isLoading}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={createVehicleMutation.isLoading}
              className="flex-1"
            >
              <Truck className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">
                Vehicle Registration Guidelines:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Vehicle number should be unique and follow your company's
                  naming convention
                </li>
                <li>
                  License plate must match the actual vehicle registration
                </li>
                <li>State should be where the vehicle is registered</li>
                <li>
                  Carrier assignment determines which drivers can use this
                  vehicle
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddVehiclePage;
