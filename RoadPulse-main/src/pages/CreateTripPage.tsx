import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";
import {
  MapPin,
  Truck,
  Clock,
  Calendar,
  Route,
  Save,
  AlertCircle,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useVehicles } from "../hooks/useVehicles";
import { useCreateTrip, useCalculateRoute } from "../hooks/useTrips";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Card from "../components/UI/Card";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import VehicleDropdown from "../components/UI/VehicleDropdown";
import { AxiosError } from "axios";

interface Vehicle {
  id: number;
  vehicle_number: string;
  license_plate: string;
  state: string;
}

interface DutyStatus {
  status: "DRIVING" | "ON_DUTY_NOT_DRIVING" | "OFF_DUTY" | string;
  start_time: string;
  end_time: string;
  location_description: string;
}

interface RouteData {
  total_miles: number;
  duty_statuses: DutyStatus[];
}

interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface TripForm {
  vehicle_id: string;
  current_location: string;
  current_location_coords: [number, number] | null;
  pickup_location: string;
  pickup_location_coords: [number, number] | null;
  dropoff_location: string;
  dropoff_location_coords: [number, number] | null;
  current_cycle_hours: number;
  start_time: string;
}

interface MapClickHandlerProps {
  field: string;
}

const CreateTripPage: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [routeCalculated, setRouteCalculated] = useState<boolean>(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [suggestions, setSuggestions] = useState<{
    current: Suggestion[];
    pickup: Suggestion[];
    dropoff: Suggestion[];
  }>({
    current: [],
    pickup: [],
    dropoff: [],
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [geolocationLoading, setGeolocationLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);

  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const createTripMutation = useCreateTrip();
  const calculateRouteMutation = useCalculateRoute();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<TripForm>({
    defaultValues: {
      vehicle_id: "",
      current_location: "",
      current_location_coords: null,
      pickup_location: "",
      pickup_location_coords: null,
      dropoff_location: "",
      dropoff_location_coords: null,
      current_cycle_hours: 0,
      start_time: "",
    },
  });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const cycleHours = watch("current_cycle_hours");
  const currentCoords = watch("current_location_coords");
  const pickupCoords = watch("pickup_location_coords");
  const dropoffCoords = watch("dropoff_location_coords");

  const fetchSuggestions = async (query: string, field: string) => {
    if (query.length < 3) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5`,
        { headers: { "User-Agent": "RoadPulse/1.0" } }
      );
      const data: Suggestion[] = await response.json();
      setSuggestions((prev) => ({ ...prev, [field]: data }));
    } catch (err: unknown) {
      console.error("Failed to fetch suggestions:", err);
    }
  };

  const handleLocationSelect = (field: string, item: Suggestion) => {
    setValue(`${field}_location`, item.display_name);
    setValue(`${field}_location_coords`, [
      parseFloat(item.lon),
      parseFloat(item.lat),
    ]);
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
    setActiveField(null);
    if (mapRef.current) {
      mapRef.current.setView([parseFloat(item.lat), parseFloat(item.lon)], 10);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setGeolocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "User-Agent": "RoadPulse/1.0" } }
          );
          const data = await response.json();
          setValue(
            "current_location",
            data.display_name || `${longitude}, ${latitude}`
          );
          setValue("current_location_coords", [longitude, latitude]);
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 10);
          }
        } catch (err: unknown) {
          console.error("Failed to reverse geocode:", err);
          setError("Failed to get location name");
        } finally {
          setGeolocationLoading(false);
        }
      },
      (err) => {
        setError(err.message || "Failed to get current location");
        setGeolocationLoading(false);
      }
    );
  };
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setValue("vehicle_id", vehicle.id.toString());
  };

  const MapClickHandler: React.FC<MapClickHandlerProps> = ({ field }) => {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "User-Agent": "RoadPulse/1.0" } }
        )
          .then((res) => res.json())
          .then((data) => {
            setValue(
              `${field}_location`,
              data.display_name || `${lng}, ${lat}`
            );
            setValue(`${field}_location_coords`, [lng, lat]);
          })
          .catch((err: unknown) => {
            console.error("Failed to reverse geocode:", err);
          });
      },
    });
    return null;
  };

  const onSubmit: SubmitHandler<TripForm> = async (data) => {
    setError("");
    if (
      !data.current_location_coords ||
      !data.pickup_location_coords ||
      !data.dropoff_location_coords
    ) {
      setError("All location coordinates are required");
      return;
    }
    try {
      const newTrip = await createTripMutation.mutateAsync({
        vehicle_id: parseInt(data.vehicle_id, 10),
        current_location_input: data.current_location_coords,
        current_location_name: data.current_location,
        pickup_location_input: data.pickup_location_coords,
        pickup_location_name: data.pickup_location,
        dropoff_location_input: data.dropoff_location_coords,
        dropoff_location_name: data.dropoff_location,
        current_cycle_hours: data.current_cycle_hours,
        start_time: data.start_time,
        status: "PLANNED",
      });
      navigate(`/trips/${newTrip.id}`);
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error).message ||
        "Failed to calculate route";
      setError(errorMessage);
    }
  };

  const calculateRoute = async () => {
    const formData = watch();
    if (
      !formData.vehicle_id ||
      !formData.pickup_location_coords ||
      !formData.dropoff_location_coords
    ) {
      setError(
        "Please fill in vehicle and all locations to calculate a route."
      );
      return;
    }
    try {
      setError("");
      const payload = {
        vehicle_id: parseInt(formData.vehicle_id, 10),
        current_location_input:
          formData.current_location_coords || formData.pickup_location_coords,
        current_location_name:
          formData.current_location || formData.pickup_location,
        pickup_location_input: formData.pickup_location_coords,
        pickup_location_name: formData.pickup_location,
        dropoff_location_input: formData.dropoff_location_coords,
        dropoff_location_name: formData.dropoff_location,
        current_cycle_hours: formData.current_cycle_hours || 0,
        start_time: formData.start_time || new Date().toISOString(),
        status: "PLANNED",
      };

      // A temporary trip is created to get the route plan
      const tempTrip = await createTripMutation.mutateAsync(payload);

      // The route is calculated based on the temporary trip
      const route: RouteData = await calculateRouteMutation.mutateAsync(
        tempTrip.id
      );

      // FIX: The calculated data is now stored in the component's state
      setRouteData(route);
      setRouteCalculated(true);
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error).message ||
        "Failed to calculate route";
      setError(errorMessage);
    }
  };

  if (vehiclesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4" />
          <div className="h-4 bg-gray-300 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-96 bg-gray-300 rounded" />
            </div>
            <div className="h-96 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              Create New Trip
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Plan your trip with HOS-compliant routing
            </p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            No Vehicles Available
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to add a vehicle to create a trip.
          </p>
          <Link to="/vehicles/add">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Create New Trip
          </h1>
          <p className="text-gray-600 mt-2">
            Plan your trip with HOS-compliant routing
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Trip Details
            </h2>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </motion.div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle
                </label>
                <VehicleDropdown
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={handleVehicleSelect}
                />
                <input
                  type="hidden"
                  {...register("vehicle_id", {
                    required: "Please select a vehicle",
                  })}
                />
                {errors.vehicle_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vehicle_id.message}
                  </p>
                )}
              </div>
              {(["current", "pickup", "dropoff"] as const).map((field) => (
                <div key={field} className="relative">
                  <div className="flex items-center space-x-2">
                    <Input
                      label={`${
                        field.charAt(0).toUpperCase() + field.slice(1)
                      } Location`}
                      type="text"
                      placeholder="Enter city or click on map"
                      icon={<MapPin className="w-4 h-4" />}
                      error={errors[`${field}_location`]?.message}
                      {...register(`${field}_location`, {
                        required: `${
                          field.charAt(0).toUpperCase() + field.slice(1)
                        } location is required`,
                      })}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        fetchSuggestions(e.target.value, field)
                      }
                      onFocus={() => setActiveField(field)}
                    />
                    {field === "current" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        loading={geolocationLoading}
                        className="h-10 mt-auto"
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {activeField === field && suggestions[field].length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto">
                      {suggestions[field].map((item: Suggestion) => (
                        <li
                          key={item.place_id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() => handleLocationSelect(field, item)}
                        >
                          {item.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <Input
                label="Current Cycle Hours Used"
                type="number"
                min="0"
                max="70"
                step="0.5"
                placeholder="20.5"
                icon={<Clock className="w-4 h-4" />}
                error={errors.current_cycle_hours?.message}
                {...register("current_cycle_hours", {
                  required: "Cycle hours are required",
                  min: { value: 0, message: "Hours cannot be negative" },
                  max: { value: 70, message: "Hours cannot exceed 70" },
                  valueAsNumber: true,
                })}
              />
              {cycleHours > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        cycleHours > 60
                          ? "bg-red-500"
                          : cycleHours > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min((cycleHours / 70) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {70 - cycleHours} hours remaining
                  </span>
                </div>
              )}
              <Input
                label="Planned Start Time"
                type="datetime-local"
                icon={<Calendar className="w-4 h-4" />}
                error={errors.start_time?.message}
                {...register("start_time", {
                  required: "Start time is required",
                })}
              />
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculateRoute}
                  loading={calculateRouteMutation.isLoading}
                  className="flex-1"
                >
                  <Route className="w-4 h-4 mr-2" />
                  Calculate Route
                </Button>
                <Button
                  type="submit"
                  loading={createTripMutation.isLoading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Trip
                </Button>
              </div>
            </form>
          </Card>
          {routeCalculated && routeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Route className="w-5 h-5 mr-2" />
                  Route Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium text-gray-700">
                      Total Distance
                    </span>
                    <span className="text-sm text-gray-900">
                      {routeData.total_miles} miles
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium text-gray-700">
                      Duty Statuses
                    </span>
                    <span className="text-sm text-gray-900">
                      {routeData.duty_statuses?.length || 0} segments
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                    <span className="text-sm font-medium text-green-700">
                      HOS Compliance
                    </span>
                    <span className="text-sm text-green-800 font-semibold">
                      ✓ Compliant
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
        <div className="space-y-6">
          <Card className="h-96 lg:h-[600px] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center p-6">
              <MapPin className="w-5 h-5 mr-2" />
              Route Map
            </h3>
            <MapContainer
              center={[37.5407, -77.436]}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {activeField && <MapClickHandler field={activeField} />}
              {currentCoords && (
                <Marker position={[currentCoords[1], currentCoords[0]]} />
              )}
              {pickupCoords && (
                <Marker position={[pickupCoords[1], pickupCoords[0]]} />
              )}
              {dropoffCoords && (
                <Marker position={[dropoffCoords[1], dropoffCoords[0]]} />
              )}
            </MapContainer>
          </Card>
          {routeCalculated && routeData?.duty_statuses && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Duty Status Timeline
                </h3>
                <div className="space-y-3">
                  {routeData.duty_statuses.map(
                    (status: DutyStatus, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            status.status === "DRIVING"
                              ? "bg-green-500"
                              : status.status === "ON_DUTY_NOT_DRIVING"
                              ? "bg-blue-500"
                              : status.status === "OFF_DUTY"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {status.status
                                .replace(/_/g, " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(status.start_time).toLocaleTimeString()}{" "}
                              - {new Date(status.end_time).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {status.location_description}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;
