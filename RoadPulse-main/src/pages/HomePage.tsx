import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  FileText,
  Shield,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Truck,
  Navigation,
  Award,
  Zap,
  Plus,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTrips } from "../hooks/useTrips";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { data: trips = [], isLoading } = useTrips();

  // Calculate stats from real API data
  const plannedTrips = trips.filter((trip) => trip.status === "PLANNED");
  const inProgressTrips = trips.filter((trip) => trip.status === "IN_PROGRESS");
  const completedTrips = trips.filter((trip) => trip.status === "COMPLETED");
  const avgCycleHours =
    trips.length > 0
      ? trips.reduce((sum, trip) => sum + trip.current_cycle_hours, 0) /
        trips.length
      : 0;

  // Get recent trips (latest 3)
  const recentTrips = trips
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-500";
      case "IN_PROGRESS":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatLocation = (trip) => {
    // Use location names since coordinate arrays are not available
    return `${trip.pickup_location_name} → ${trip.dropoff_location_name}`;
  };

  if (isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Here's your current trip status and recent activity.
          </p>
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      {avgCycleHours.toFixed(1)}/70
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Trips
                  </h2>
                  <Link
                    to="/dashboard"
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium"
                  >
                    View all
                  </Link>
                </div>

                {recentTrips.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No trips yet
                    </p>
                    <Link to="/trips/create">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Trip
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              trip.status
                            )}`}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatLocation(trip)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {trip.vehicle.vehicle_number} •{" "}
                              {new Date(trip.start_time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/trips/${trip.id}`}
                          className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3 flex flex-1 flex-col gap-1">
                  <Link to="/trips/create">
                    <Button className="w-full justify-between">
                      Create New Trip
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      View All Trips
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  {recentTrips.length > 0 && (
                    <Link to={`/eld-logs/${recentTrips[0].id}`}>
                      <Button
                        variant="secondary"
                        className="w-full justify-between"
                      >
                        Generate ELD Log
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 dark:from-gray-900 dark:via-gray-800 dark:to-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 text-teal-400/20"
          >
            <Navigation className="w-16 h-16" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -3, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-40 right-20 text-teal-400/20"
          >
            <Award className="w-12 h-12" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-32 left-20 text-teal-400/20"
          >
            <Zap className="w-14 h-14" />
          </motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-teal-500/10 border border-teal-400/20 text-teal-300 text-sm font-medium mb-6"
              >
                <Shield className="w-4 h-4 mr-2" />
                FMCSA Compliant Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-poppins mb-6 leading-tight"
              >
                Simplify Your{" "}
                <span className="relative">
                  <span className="text-teal-400">Trucking</span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="absolute bottom-2 left-0 right-0 h-2 bg-teal-400/30 -z-10"
                  />
                </span>{" "}
                with{" "}
                <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  RoadPulse
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed"
              >
                Professional trip planning, Hours of Service compliance, and ELD
                log generation designed specifically for truck drivers who
                demand{" "}
                <span className="text-teal-300 font-semibold">
                  reliability and simplicity
                </span>
                .
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start"
              >
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-teal-400 mr-2" />
                  <span className="text-sm font-medium">
                    Smart Route Planning
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-teal-400 mr-2" />
                  <span className="text-sm font-medium">HOS Compliance</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-teal-400 mr-2" />
                  <span className="text-sm font-medium">
                    ELD Log Generation
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-lg px-8 py-4 bg-teal-600 hover:bg-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Truck className="w-5 h-5 mr-2" />
                    Start Free Today
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-lg px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-200"
                  >
                    Driver Login
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center gap-8 mt-12 justify-center lg:justify-start"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-400">1,000+</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Active Drivers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-400">50K+</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Trips Planned
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-400">99.9%</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Uptime
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="relative lg:ml-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.pexels.com/photos/1095814/pexels-photo-1095814.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Professional truck driver planning route"
                    className="w-full h-96 lg:h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/30 to-blue-600/20"></div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        HOS Compliant
                      </div>
                      <div className="text-xs text-gray-600">
                        Route Verified
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        ELD Ready
                      </div>
                      <div className="text-xs text-gray-600">
                        Instant Generation
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-2xl blur-3xl transform scale-110"></div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-white dark:text-gray-900"
            />
          </svg>
        </div>
      </section>

      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-gray-900 dark:text-white mb-4">
              Everything You Need for Professional Trucking
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              RoadPulse combines powerful trip planning, compliance tracking,
              and log generation in one easy-to-use platform built for drivers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full" hover>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Smart Trip Planning
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Interactive maps, route optimization, and HOS-compliant
                  scheduling. Plan your trips with confidence and arrive safely
                  on time.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full" hover>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  HOS Compliance
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Automatic Hours of Service tracking with real-time alerts.
                  Stay compliant with FMCSA regulations and avoid violations.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full" hover>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  ELD Log Generation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Generate accurate, printable ELD logs with the 24-hour graph
                  grid. Perfect for inspections and compliance documentation.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full" hover>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  FMCSA Compliant
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Built to meet all Federal Motor Carrier Safety Administration
                  requirements. Trust in professional-grade compliance tools.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full" hover>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Driver-Friendly Design
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Large buttons, night mode, and intuitive interface designed
                  for use in trucks. Easy to use whether you're tech-savvy or
                  not.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full" hover>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Always Free Core Features
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Essential trip planning, HOS tracking, and ELD logs are always
                  free. No hidden fees or subscription traps for core
                  functionality.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-gray-900 dark:text-white mb-4">
              Trusted by Professional Drivers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what drivers and fleet managers are saying about RoadPulse
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "RoadPulse has simplified my entire workflow. The HOS tracking
                is spot-on and the ELD logs print perfectly for inspections.
                Finally, a platform built by people who understand trucking."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Mike Rodriguez
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Owner-Operator, 15 years
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "Managing a fleet of 25 trucks is challenging, but RoadPulse
                makes it manageable. The compliance tracking gives me peace of
                mind, and my drivers love how easy it is to use."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Sarah Chen
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fleet Manager, ABC Trucking
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "I'm not the most tech-savvy, but RoadPulse is incredibly
                intuitive. The night mode is perfect for planning routes during
                rest breaks, and the support team is always helpful."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    James Wilson
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Long-haul Driver, 8 years
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-12 bg-teal-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">FMCSA</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  FMCSA Compliant
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Meets all federal requirements
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                1,000+
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Active Drivers
              </p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                50,000+
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Trips Planned
              </p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                99.9%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-600 dark:bg-teal-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-white mb-6">
            Ready to Simplify Your Trucking Operations?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of professional drivers who trust RoadPulse for their
            trip planning, compliance, and documentation needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button
                size="lg"
                variant="light-on-dark"
                className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                Start Free Today
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 text-lg"
              >
                Driver Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
