import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Calendar,
  Eye,
  Play,
  Trash2,
  Filter,
  Search,
  Building,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTrips, useUpdateTrip, useDeleteTrip } from "../hooks/useTrips";
import { useVehicles } from "../hooks/useVehicles";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import Modal from "../components/UI/Modal";

const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<number | null>(null);

  // API hooks
  const { data: trips = [], isLoading, error } = useTrips();
  const { data: vehicles = [] } = useVehicles();
  const updateTripMutation = useUpdateTrip();
  const deleteTripMutation = useDeleteTrip();

  // Calculate summary stats from real data
  const plannedTrips = trips.filter((trip) => trip.status === "PLANNED");
  const inProgressTrips = trips.filter((trip) => trip.status === "IN_PROGRESS");
  const completedTrips = trips.filter((trip) => trip.status === "COMPLETED");
  const totalCycleHours =
    trips.length > 0
      ? trips.reduce((sum, trip) => sum + trip.current_cycle_hours, 0) /
        trips.length
      : 0;

  // Filter trips based on search, status, and vehicle
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      (trip.pickup_location_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (trip.dropoff_location_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (trip.vehicle?.vehicle_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || trip.status === statusFilter;
    const matchesVehicle =
      vehicleFilter === "ALL" || trip.vehicle?.id.toString() === vehicleFilter;
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleStartTrip = async (tripId: number) => {
    try {
      await updateTripMutation.mutateAsync({
        id: tripId,
        updates: { status: "IN_PROGRESS" },
      });
    } catch (error) {
      console.error("Failed to start trip:", error);
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
      await deleteTripMutation.mutateAsync(tripToDelete);
      setDeleteModalOpen(false);
      setTripToDelete(null);
    } catch (error) {
      console.error("Failed to delete trip:", error);
    }
  };

  const openDeleteModal = (tripId: number) => {
    setTripToDelete(tripId);
    setDeleteModalOpen(true);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {error instanceof Error ? error.message : "Failed to load trips"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your trips and monitor HOS compliance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <Link to="/trips/create">
            <Button className="w-full sm:w-auto" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Trip
            </Button>
          </Link>

          {/* Admin Quick Actions */}
          {isAdmin && (
            <div className="flex gap-2">
              <Link to="/vehicles/add">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </Link>
              <Link to="/carriers/add">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Add Carrier
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-md"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6" hover>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Planned Trips
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plannedTrips.length}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6" hover>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {inProgressTrips.length}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6" hover>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {completedTrips.length}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6" hover>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-md flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Avg Cycle Hours
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalCycleHours.toFixed(1)}/70
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search trips..."
                  icon={<Search className="w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <select
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="ALL">All Vehicles</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.vehicle_number} ({vehicle.license_plate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Trips Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Trips ({filteredTrips.length})
              </h2>
            </div>

            {filteredTrips.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No trips found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm ||
                  statusFilter !== "ALL" ||
                  vehicleFilter !== "ALL"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first trip."}
                </p>
                <Link to="/trips/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Trip
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cycle Hours
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTrips.map((trip, index) => (
                      <motion.tr
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {trip.pickup_location_name} →{" "}
                            {trip.dropoff_location_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {trip.vehicle?.vehicle_number}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {trip.vehicle?.license_plate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              trip.status
                            )}`}
                          >
                            {trip.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {new Date(trip.start_time).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(trip.start_time).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trip.current_cycle_hours}/70
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/trips/${trip.id}`}
                              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {trip.status === "PLANNED" && (
                              <button
                                onClick={() => handleStartTrip(trip.id)}
                                disabled={updateTripMutation.isLoading}
                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openDeleteModal(trip.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Trip"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this trip? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteTripMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTrip}
              loading={deleteTripMutation.isLoading}
            >
              Delete Trip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
