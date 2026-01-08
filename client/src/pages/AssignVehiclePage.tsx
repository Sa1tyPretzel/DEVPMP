import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, Users, ArrowLeft, Check, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useVehicles, useUpdateVehicle } from "../hooks/useVehicles";
import { useDrivers } from "../hooks/useDrivers";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";

const AssignVehiclePage: React.FC = () => {
  const { isAdmin, isManager, carrierId } = useAuth();
  const { data: allVehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: allDrivers = [], isLoading: driversLoading } = useDrivers();
  const updateVehicleMutation = useUpdateVehicle();
  const [assigningVehicleId, setAssigningVehicleId] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

  // Filter vehicles and drivers by carrier for managers
  const vehicles = isAdmin
    ? allVehicles
    : allVehicles.filter((v) => v.carrier === carrierId);

  const drivers = isAdmin
    ? allDrivers
    : allDrivers.filter((d) => d.carrier === carrierId);

  const handleAssign = async (vehicleId: number, driverId: number | null) => {
    try {
      await updateVehicleMutation.mutateAsync({
        id: vehicleId,
        data: { assigned_driver: driverId },
      });
      setAssigningVehicleId(null);
      setSelectedDriver(null);
    } catch (error) {
      console.error("Failed to assign vehicle:", error);
    }
  };

  const isLoading = vehiclesLoading || driversLoading;

  if (!isAdmin && !isManager) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need manager or admin privileges to access this page.
          </p>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to={isAdmin ? "/admin" : "/manager"}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Assign Vehicles
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage vehicle assignments to drivers
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/vehicles/add">
            <Button>
              <Truck className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </Card>
      ) : vehicles.length === 0 ? (
        <Card className="p-8 text-center">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Vehicles Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add vehicles to your fleet to start assigning them to drivers.
          </p>
          <Link to="/vehicles/add">
            <Button>
              <Truck className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Fleet Vehicles ({vehicles.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    License Plate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned Driver
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {vehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {vehicle.vehicle_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.license_plate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assigningVehicleId === vehicle.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedDriver ?? ""}
                            onChange={(e) =>
                              setSelectedDriver(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            className="block w-40 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="">Unassigned</option>
                            {drivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.full_name || driver.username}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(vehicle.id, selectedDriver)}
                            disabled={updateVehicleMutation.isLoading}
                            className="text-green-600 hover:text-green-700 dark:text-green-400"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setAssigningVehicleId(null);
                              setSelectedDriver(null);
                            }}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {vehicle.assigned_driver_name ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <Users className="w-3 h-3 mr-1" />
                              {vehicle.assigned_driver_name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              Unassigned
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {assigningVehicleId !== vehicle.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAssigningVehicleId(vehicle.id);
                            setSelectedDriver(vehicle.assigned_driver);
                          }}
                        >
                          {vehicle.assigned_driver ? "Reassign" : "Assign"}
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Driver Summary */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Available Drivers ({drivers.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {drivers.map((driver) => {
            const assignedVehicles = vehicles.filter(
              (v) => v.assigned_driver === driver.id
            );
            return (
              <div
                key={driver.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {driver.full_name || driver.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {assignedVehicles.length} vehicle(s) assigned
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AssignVehiclePage;
