import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Building,
  Truck,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import Modal from "../components/UI/Modal";
import { useCarriers, useCreateCarrier } from "../hooks/useCarriers";
import { useVehicles, useCreateVehicle } from "../hooks/useVehicles";

// Form data interfaces
interface CarrierForm {
  name: string;
  main_office_address: string;
}

interface VehicleForm {
  vehicle_number: string;
  license_plate: string;
  state: string;
  carrier: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [carrierModalOpen, setCarrierModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Query Hooks for data fetching and mutations
  const { data: carriers = [], isLoading: carriersLoading } = useCarriers();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const createCarrierMutation = useCreateCarrier();
  const createVehicleMutation = useCreateVehicle();

  // React Hook Form instances
  const {
    register: registerCarrier,
    handleSubmit: handleCarrierSubmit,
    reset: resetCarrierForm,
    formState: { errors: carrierErrors },
  } = useForm<CarrierForm>();

  const {
    register: registerVehicle,
    handleSubmit: handleVehicleSubmit,
    reset: resetVehicleForm,
    formState: { errors: vehicleErrors },
  } = useForm<VehicleForm>();

  const tabs = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "carriers", label: "Carriers", icon: Building },
    { id: "vehicles", label: "Vehicles", icon: Truck },
  ];

  // Filtering logic
  const filteredCarriers = carriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.main_office_address
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCarrierName = (carrierId: number) => {
    const carrier = carriers.find((c) => c.id === carrierId);
    return carrier?.name || "Unknown";
  };

  // API submission handlers
  const onCarrierSubmit = async (data: CarrierForm) => {
    setError(null);
    try {
      await createCarrierMutation.mutateAsync(data);
      setCarrierModalOpen(false);
      resetCarrierForm();
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (err as Error).message;
      setError(errorMessage || "Failed to create carrier.");
    }
  };

  const onVehicleSubmit = async (data: VehicleForm) => {
    setError(null);
    try {
      await createVehicleMutation.mutateAsync({
        ...data,
        carrier: Number(data.carrier), // Ensure carrier is a number
      });
      setVehicleModalOpen(false);
      resetVehicleForm();
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (err as Error).message;
      setError(errorMessage || "Failed to create carrier.");
    }
  };

  const isLoading = carriersLoading || vehiclesLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage carriers, vehicles, and system resources
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-500 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6" hover>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Carriers
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {carriers.length}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6" hover>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center justify-center">
                        <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Vehicles
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {vehicles.length}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6" hover>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-md flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Active Drivers
                      </p>
                      {/* // TODO: Replace with a real API call when available */}
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        25
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "carriers" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="Search carriers..."
                        icon={<Search className="w-4 h-4" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => setCarrierModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Carrier
                    </Button>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Carriers ({filteredCarriers.length})
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCarriers.map((carrier) => (
                          <tr
                            key={carrier.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {carrier.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {carrier.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {carrier.main_office_address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "vehicles" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="Search vehicles..."
                        icon={<Search className="w-4 h-4" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => setVehicleModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Vehicles ({filteredVehicles.length})
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Vehicle Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            License Plate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            State
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Carrier
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredVehicles.map((vehicle) => (
                          <tr
                            key={vehicle.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {vehicle.vehicle_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {vehicle.license_plate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {vehicle.state}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {getCarrierName(vehicle.carrier)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </motion.div>

      <Modal
        isOpen={carrierModalOpen}
        onClose={() => {
          setCarrierModalOpen(false);
          resetCarrierForm();
          setError(null);
        }}
        title="Add New Carrier"
      >
        <form onSubmit={handleCarrierSubmit(onCarrierSubmit)}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </div>
            )}
            <Input
              label="Carrier Name"
              placeholder="Enter carrier name"
              error={carrierErrors.name?.message}
              {...registerCarrier("name", {
                required: "Carrier name is required",
              })}
            />
            <Input
              label="Main Office Address"
              placeholder="Enter complete address"
              error={carrierErrors.main_office_address?.message}
              {...registerCarrier("main_office_address", {
                required: "Address is required",
              })}
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCarrierModalOpen(false)}
                disabled={createCarrierMutation.isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createCarrierMutation.isLoading}>
                Add Carrier
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={vehicleModalOpen}
        onClose={() => {
          setVehicleModalOpen(false);
          resetVehicleForm();
          setError(null);
        }}
        title="Add New Vehicle"
      >
        <form onSubmit={handleVehicleSubmit(onVehicleSubmit)}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </div>
            )}
            <Input
              label="Vehicle Number"
              placeholder="TRK001"
              error={vehicleErrors.vehicle_number?.message}
              {...registerVehicle("vehicle_number", {
                required: "Vehicle number is required",
              })}
            />
            <Input
              label="License Plate"
              placeholder="ABC123"
              error={vehicleErrors.license_plate?.message}
              {...registerVehicle("license_plate", {
                required: "License plate is required",
              })}
            />
            <Input
              label="State"
              placeholder="VA"
              error={vehicleErrors.state?.message}
              {...registerVehicle("state", {
                required: "State is required",
                maxLength: 2,
              })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Carrier
              </label>
              <select
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                {...registerVehicle("carrier", {
                  required: "Please select a carrier",
                })}
              >
                <option value="">Select a carrier</option>
                {carriers.map((carrier) => (
                  <option key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </option>
                ))}
              </select>
              {vehicleErrors.carrier && (
                <p className="text-sm text-red-500 mt-1">
                  {vehicleErrors.carrier.message}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVehicleModalOpen(false)}
                disabled={createVehicleMutation.isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createVehicleMutation.isLoading}>
                Add Vehicle
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
