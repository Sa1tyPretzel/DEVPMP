import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Fuel, Gauge, TrendingUp, Truck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDrivers } from "../hooks/useDrivers";
import { useTrips } from "../hooks/useTrips";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";

interface DriverMetrics {
  driverId: number;
  driverName: string;
  totalMiles: number;
  totalFuel: number;
  totalTrips: number;
  fuelEfficiency: number;
  avgSpeed: number;
}

const ManagerDriversPage: React.FC = () => {
  const { isAdmin, isManager, carrierId } = useAuth();
  const { data: allDrivers = [], isLoading: driversLoading } = useDrivers();
  const { data: allTrips = [], isLoading: tripsLoading } = useTrips();

  // Filter drivers by carrier for managers
  const drivers = isAdmin
    ? allDrivers
    : allDrivers.filter((d) => d.carrier === carrierId);

  // Calculate metrics for each driver
  const driverMetrics: DriverMetrics[] = drivers.map((driver) => {
    // Handle both driver as object or as ID
    const driverTrips = allTrips.filter((trip) => {
      const tripDriverId = typeof trip.driver === 'object' ? trip.driver?.id : trip.driver;
      return tripDriverId === driver.id;
    });
    const completedTrips = driverTrips.filter((trip) => trip.status === "COMPLETED");
    
    const totalMiles = completedTrips.reduce((sum, trip) => sum + (trip.total_miles || 0), 0);
    const totalFuel = completedTrips.reduce((sum, trip) => sum + Number(trip.fuel_used || 0), 0);
    const totalEngineHours = completedTrips.reduce((sum, trip) => sum + (trip.total_engine_hours || 0), 0);
    
    // Fuel efficiency: kilometers per liter
    const fuelEfficiency = totalFuel > 0 ? totalMiles / totalFuel : 0;
    
    // Average speed: total kilometers / total engine hours
    const avgSpeed = totalEngineHours > 0 ? totalMiles / totalEngineHours : 0;

    return {
      driverId: driver.id,
      driverName: driver.full_name || driver.username,
      totalMiles,
      totalFuel,
      totalTrips: completedTrips.length,
      fuelEfficiency,
      avgSpeed,
    };
  });

  const isLoading = driversLoading || tripsLoading;

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
              Driver Performance
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              View performance metrics for all drivers in your fleet
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Driver Performance ({drivers.length})
            </h2>
          </div>

          {drivers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Drivers Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No drivers are currently assigned to your carrier.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Completed Trips
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Miles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fuel Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fuel Efficiency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg Speed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {driverMetrics.map((metrics, index) => (
                    <motion.tr
                      key={metrics.driverId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {metrics.driverName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {metrics.totalTrips}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 text-purple-500 mr-2" />
                          {metrics.totalMiles.toFixed(0)} km
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Fuel className="w-4 h-4 text-orange-500 mr-2" />
                          {metrics.totalFuel.toFixed(1)} L
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          metrics.fuelEfficiency >= 8
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : metrics.fuelEfficiency >= 6
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          <Gauge className="w-3 h-3 mr-1" />
                          {metrics.fuelEfficiency.toFixed(1)} km/L
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Gauge className="w-4 h-4 text-blue-500 mr-2" />
                          {metrics.avgSpeed.toFixed(1)} km/h
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ManagerDriversPage;
