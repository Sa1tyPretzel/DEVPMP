import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  BarChart as BarChartIcon,
  Fuel,
  Gauge,
  Timer,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/UI/chart";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import Modal from "../components/UI/Modal";
import { useCarriers, useCreateCarrier, useDeleteCarrier } from "../hooks/useCarriers";
import { useVehicles, useCreateVehicle, useDeleteVehicle } from "../hooks/useVehicles";
import { useTrips } from "../hooks/useTrips";

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

const COLORS = [
  "#0d9488", // teal
  "#2563eb", // blue
  "#db2777", // pink
  "#d97706", // amber
  "#7c3aed", // violet
  "#dc2626", // red
  "#059669", // emerald
  "#4f46e5", // indigo
];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [carrierModalOpen, setCarrierModalOpen] = useState(false);
  const [deleteCarrierModalOpen, setDeleteCarrierModalOpen] = useState(false);
  const [carrierToDelete, setCarrierToDelete] = useState<number | null>(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [deleteVehicleModalOpen, setDeleteVehicleModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // React Query Hooks for data fetching and mutations
  const { data: carriers = [], isLoading: carriersLoading } = useCarriers();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: trips = [], isLoading: tripsLoading } = useTrips();
  const createCarrierMutation = useCreateCarrier();
  const deleteCarrierMutation = useDeleteCarrier();
  const createVehicleMutation = useCreateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

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
    { id: "efficiency", label: "Efficiency", icon: BarChart },
    { id: "top_drivers", label: "Top Drivers", icon: Trophy },
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

  const handleDeleteCarrier = async () => {
    if (!carrierToDelete) return;

    try {
      await deleteCarrierMutation.mutateAsync(carrierToDelete);
      setDeleteCarrierModalOpen(false);
      setCarrierToDelete(null);
    } catch (error) {
      console.error("Failed to delete carrier:", error);
      setError("Failed to delete carrier. Please try again.");
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      await deleteVehicleMutation.mutateAsync(vehicleToDelete);
      setDeleteVehicleModalOpen(false);
      setVehicleToDelete(null);
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      setError("Failed to delete vehicle. Please try again.");
    }
  };

  const isLoading = carriersLoading || vehiclesLoading || tripsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage carriers, vehicles, and system resources
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Link to="/vehicles/add">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Truck className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </Link>
          <Link to="/carriers/add">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Building className="w-4 h-4 mr-2" />
              Add Carrier
            </Button>
          </Link>
        </div>
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
                                <button 
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => {
                                    setCarrierToDelete(carrier.id);
                                    setDeleteCarrierModalOpen(true);
                                  }}
                                >
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
                                <button 
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => {
                                    setVehicleToDelete(vehicle.id);
                                    setDeleteVehicleModalOpen(true);
                                  }}
                                >
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

            {activeTab === "efficiency" && (
              <div className="space-y-6">
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Efficiency by Month
                    </h3>
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Month:
                      </label>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Daily Fuel Consumption Trend
                  </h3>
                  <ChartContainer
                    config={carriers.reduce((acc, carrier, index) => {
                      acc[carrier.name] = {
                        label: carrier.name,
                        color: COLORS[index % COLORS.length],
                      };
                      return acc;
                    }, {} as ChartConfig)}
                    className="h-[300px] w-full"
                  >
                    <BarChart
                      data={(() => {
                        if (!selectedMonth) return [];
                        const [year, month] = selectedMonth
                          .split("-")
                          .map(Number);
                        const daysInMonth = new Date(year, month, 0).getDate();
                        const data: Record<string, string | number>[] = [];
                        
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${selectedMonth}-${String(
                            day
                          ).padStart(2, "0")}`;
                          
                          const dayData: Record<string, string | number> = { day: day.toString() };
                          
                          // Initialize all carriers with 0
                          carriers.forEach(c => {
                            dayData[c.name] = 0;
                          });

                          const dailyTrips = trips.filter((t) => 
                            t.start_time.startsWith(dateStr)
                          );

                          dailyTrips.forEach(trip => {
                            const carrier = carriers.find(c => c.id === trip.vehicle.carrier);
                            if (carrier) {
                              dayData[carrier.name] = (dayData[carrier.name] as number) + Number(trip.fuel_used || 0);
                            }
                          });

                          data.push(dayData);
                        }
                        return data;
                      })()}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      {carriers.map((carrier) => (
                        <Bar
                          key={carrier.id}
                          dataKey={carrier.name}
                          fill={`var(--color-${carrier.name.replace(/\s+/g, '-')})`}
                          radius={4}
                        />
                      ))}
                    </BarChart>
                  </ChartContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carriers.map((carrier) => {
                    const carrierTrips = trips.filter(
                      (trip) =>
                        trip.vehicle.carrier === carrier.id &&
                        trip.start_time.startsWith(selectedMonth)
                    );
                  const totalFuel = carrierTrips.reduce(
                    (sum, trip) => sum + Number(trip.fuel_used || 0),
                    0
                  );
                  const totalMiles = carrierTrips.reduce(
                    (sum, trip) => sum + (trip.total_miles || 0),
                    0
                  );
                  const totalEngineHours = carrierTrips.reduce(
                    (sum, trip) => sum + Number(trip.total_engine_hours || 0),
                    0
                  );

                  const totalTrips = carrierTrips.length;
                  const avgFuel =
                    totalTrips > 0 ? (totalFuel / totalTrips).toFixed(1) : "0";

                  const fuelEfficiency =
                    totalFuel > 0 ? (totalMiles / totalFuel).toFixed(1) : "0";

                  const avgSpeed =
                    totalEngineHours > 0
                      ? (totalMiles / totalEngineHours).toFixed(1)
                      : "0";

                  return (
                    <Card key={carrier.id} className="p-6" hover>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {carrier.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {carrier.main_office_address}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
                          <BarChartIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Total Fuel
                          </p>
                          <div className="flex items-center">
                            <Fuel className="w-4 h-4 text-orange-500 mr-2" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {totalFuel.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Avg / Trip
                          </p>
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {avgFuel}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              gal
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Fuel Eff.
                          </p>
                          <div className="flex items-center">
                            <Gauge className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {fuelEfficiency}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              mpg
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Avg Speed
                          </p>
                          <div className="flex items-center">
                            <Timer className="w-4 h-4 text-purple-500 mr-2" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {avgSpeed}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              mph
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Total Completed Trips
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {totalTrips}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                  })}
                </div>
              </div>
            )}

{activeTab === "top_drivers" && (
              <div className="space-y-8">
                 <Card className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Top Drivers by Carrier ({selectedMonth})
                    </h3>
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Month:
                      </label>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                </Card>

                {carriers.map((carrier) => {
                  const carrierTrips = trips.filter(
                    (t) =>
                      t.start_time.startsWith(selectedMonth) &&
                      t.vehicle.carrier === carrier.id
                  );

                  if (carrierTrips.length === 0) return null;

                  const driverStats = carrierTrips.reduce((acc: any, trip) => {
                    const driverId = trip.driver.id;
                    const driverName = trip.driver_name || "Unknown Driver";

                    if (!acc[driverId]) {
                      acc[driverId] = {
                        id: driverId,
                        name: driverName,
                        totalMiles: 0,
                        totalFuel: 0,
                        tripsCount: 0,
                        totalEngineHours: 0,
                      };
                    }

                    acc[driverId].totalMiles += trip.total_miles || 0;
                    acc[driverId].totalFuel += Number(trip.fuel_used || 0);
                    acc[driverId].tripsCount += 1;
                    acc[driverId].totalEngineHours += Number(
                      trip.total_engine_hours || 0
                    );

                    return acc;
                  }, {});

                  const sortedDrivers = Object.values(driverStats).sort(
                    (a: any, b: any) => b.totalMiles - a.totalMiles
                  );

                  return (
                    <div key={carrier.id} className="space-y-4">
                      <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {carrier.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedDrivers.map((driver: any, index: number) => (
                          <Card
                            key={driver.id}
                            className="p-6 relative overflow-hidden"
                            hover
                          >
                            {index < 3 && (
                              <div className="absolute top-0 right-0 p-2">
                                <Trophy
                                  className={`w-8 h-8 ${
                                    index === 0
                                      ? "text-yellow-400"
                                      : index === 1
                                      ? "text-gray-400"
                                      : "text-orange-400"
                                  }`}
                                />
                              </div>
                            )}

                            <div className="flex items-center mb-4">
                              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mr-4">
                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {driver.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Total Miles
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                                <p className="text-xs text-gray-500 uppercase">
                                  Miles
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                  {driver.totalMiles.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                                <p className="text-xs text-gray-500 uppercase">
                                  Trips
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                  {driver.tripsCount}
                                </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                                <p className="text-xs text-gray-500 uppercase">
                                  MPG
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                  {driver.totalFuel > 0
                                    ? (
                                        driver.totalMiles / driver.totalFuel
                                      ).toFixed(1)
                                    : "0"}
                                </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                                <p className="text-xs text-gray-500 uppercase">
                                  Avg MPH
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                  {driver.totalEngineHours > 0
                                    ? (
                                        driver.totalMiles /
                                        driver.totalEngineHours
                                      ).toFixed(1)
                                    : "0"}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
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

      <Modal
        isOpen={deleteCarrierModalOpen}
        onClose={() => {
          setDeleteCarrierModalOpen(false);
          setCarrierToDelete(null);
        }}
        title="Delete Carrier"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this carrier? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteCarrierModalOpen(false);
                setCarrierToDelete(null);
              }}
              disabled={deleteCarrierMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteCarrier}
              loading={deleteCarrierMutation.isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteVehicleModalOpen}
        onClose={() => {
          setDeleteVehicleModalOpen(false);
          setVehicleToDelete(null);
        }}
        title="Delete Vehicle"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this vehicle? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteVehicleModalOpen(false);
                setVehicleToDelete(null);
              }}
              disabled={deleteVehicleMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteVehicle}
              loading={deleteVehicleMutation.isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
