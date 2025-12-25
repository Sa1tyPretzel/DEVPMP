import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  MapPin,
  Clock,
  Play,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import Modal from "../components/UI/Modal";
import Input from "../components/UI/Input";
import { useTripDetails } from "../hooks/useTripDetails";
import { useTripMutations } from "../hooks/useTripMutations";
import { useCreateDutyStatus } from "../hooks/useDutyStatus";
import { useELDLogs } from "../hooks/useELDLogs";

// Form data interfaces
interface DutyStatusForm {
  status: string;
  start_time: string;
  end_time: string;
  location_description: string;
  remarks?: string;
}

export interface ELDLogForm {
  date: string;
  total_miles: number;
  fuel_consumed?: number;
  total_engine_hours?: number;
  total_idle_hours?: number;
}

interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dutyStatusModalOpen, setDutyStatusModalOpen] = useState(false);
  const [eldLogModalOpen, setEldLogModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [locationSuggestions, setLocationSuggestions] = useState<Suggestion[]>(
    []
  );
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<
    [number, number] | null
  >(null);

  const {
    trip,
    tripLoading,
    tripError,
    dutyStatuses,
    dutyStatusLoading,
    dutyStatusError,
    eldLogs,
    eldLogLoading,
    eldLogError,
  } = useTripDetails(id!);
  const { startTrip, deleteTrip } = useTripMutations(id!);
  const { generateELDLog } = useELDLogs(id!);
  const createDutyStatusMutation = useCreateDutyStatus();

  const {
    register: registerDutyStatus,
    handleSubmit: handleDutyStatusSubmit,
    reset: resetDutyStatusForm,
    setValue: setDutyStatusValue,
    formState: { errors: dutyStatusErrors },
  } = useForm<DutyStatusForm>();

  const {
    register: registerELDLog,
    handleSubmit: handleELDLogSubmit,
    reset: resetELDLogForm,
    formState: { errors: eldLogErrors },
  } = useForm<ELDLogForm>();

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

  const getDutyStatusColor = (status: string) => {
    switch (status) {
      case "DRIVING":
        return "bg-green-500";
      case "ON_DUTY_NOT_DRIVING":
        return "bg-blue-500";
      case "OFF_DUTY":
        return "bg-red-500";
      case "SLEEPER_BERTH":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDutyStatus = (status: string | undefined | null) => {
    if (!status) return "Unknown Status";
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
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
      setLocationSuggestions(data);
    } catch (err) {
      console.error("Failed to fetch location suggestions:", err);
    }
  };

  const handleLocationSelect = (item: Suggestion) => {
    setDutyStatusValue("location_description", item.display_name);
    setSelectedLocationCoords([parseFloat(item.lon), parseFloat(item.lat)]);
    setLocationSuggestions([]);
  };

  const handleStartTrip = async () => {
    try {
      setError("");
      await startTrip.mutateAsync({ status: "IN_PROGRESS" });
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (err as Error).message;
      setError(errorMessage || "Failed to create carrier.");
    }
  };

  const handleUpdateTrip = async () => {
    if (!newStatus) {
      setError("Please select a status.");
      return;
    }
    try {
      setError("");
      await startTrip.mutateAsync({ status: newStatus });
      setUpdateModalOpen(false);
      setNewStatus("");
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (err as Error).message;
      setError(errorMessage || "Failed to create carrier.");
    }
  };

  const handleDeleteTrip = async () => {
    try {
      setError("");
      await deleteTrip.mutateAsync();
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (err as Error).message;
      setError(errorMessage || "Failed to create carrier.");
    }
  };

  const onDutyStatusSubmit = async (data: DutyStatusForm) => {
    setError("");
    try {
      if (!id) return;
      await createDutyStatusMutation.mutateAsync({
        tripId: parseInt(id),
        dutyStatusData: {
          ...data,
          location: selectedLocationCoords || [0, 0],
        },
      });
      setDutyStatusModalOpen(false);
      resetDutyStatusForm();
      setSelectedLocationCoords(null);
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (err as Error).message;
      setError(errorMessage || "Failed to create carrier.");
    }
  };

  const onELDLogSubmit = async (data: ELDLogForm) => {
    setError("");
    setSuccessMessage("");
    try {
      await generateELDLog.mutateAsync({ ...data });
      setEldLogModalOpen(false);
      resetELDLogForm();
      setSuccessMessage("ELD Log added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (err as Error).message;
      setError(errorMessage || "Failed to create carrier.");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: MapPin },
    { id: "duty-status", label: "Duty Status", icon: Clock },
    { id: "eld-logs", label: "ELD Logs", icon: FileText },
  ];

  if (tripLoading || dutyStatusLoading || eldLogLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (tripError || dutyStatusError || eldLogError) {
    return (
      <div className="text-center py-12 text-red-600">
        Error:{" "}
        {tripError?.message || dutyStatusError?.message || eldLogError?.message}
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-12">Trip not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              Trip #{trip.id}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {trip.pickup_location_name} → {trip.dropoff_location_name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${getStatusColor(
              trip.status
            )}`}
          >
            {trip.status.replace("_", " ")}
          </span>

          {trip.status === "PLANNED" && (
            <Button onClick={handleStartTrip} loading={startTrip.isLoading}>
              <Play className="w-4 h-4 mr-2" />
              Start Trip
            </Button>
          )}

          <Button variant="outline" onClick={() => setUpdateModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Update
          </Button>

          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
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
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Trip Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Driver
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {trip.driver.user}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vehicle
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {trip.vehicle.vehicle_number} ({trip.vehicle.license_plate})
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Planned Start
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(trip.start_time).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cycle Hours Used
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {trip.current_cycle_hours}/70
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    HOS Compliance
                  </span>
                  <span className="text-sm text-green-800 dark:text-green-400 font-semibold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Compliant
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Route Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Pickup Location
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {trip.pickup_location_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Dropoff Location
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {trip.dropoff_location_name}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Route metrics will be available once the trip is in
                    progress.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "duty-status" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Duty Status Timeline
              </h2>
              <Button size="sm" onClick={() => setDutyStatusModalOpen(true)}>
                <Clock className="w-4 h-4 mr-2" />
                Add Status
              </Button>
            </div>

            <div className="space-y-4">
              {dutyStatuses?.map((status) => (
                <div
                  key={status.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div
                    className={`w-4 h-4 ${getDutyStatusColor(
                      status.status
                    )} rounded-full mt-1`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDutyStatus(status.status)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(status.start_time).toLocaleTimeString()} -{" "}
                        {new Date(status.end_time).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {status.location_description}
                    </p>
                    {status.remarks && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {status.remarks}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {!dutyStatuses?.length && (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No duty statuses found.
                </p>
              )}
            </div>
          </Card>
        )}

        {activeTab === "eld-logs" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                ELD Logs
              </h2>
              <Button onClick={() => setEldLogModalOpen(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Add Log Entry
              </Button>
            </div>

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">{successMessage}</span>
              </motion.div>
            )}

            {eldLogs?.length ? (
              <div className="space-y-4">
                {eldLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0 pt-1">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Log for {new Date(log.date).toLocaleDateString()}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {log.total_miles} miles
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-3 gap-x-4">
                        <span>Fuel: {log.fuel_consumed ?? "N/A"} gal</span>
                        <span>
                          Engine: {log.total_engine_hours ?? "N/A"} hrs
                        </span>
                        <span>Idle: {log.total_idle_hours ?? "N/A"} hrs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No ELD Logs Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add your first ELD log entry for this trip.
                </p>
                <Button onClick={() => setEldLogModalOpen(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Add Log Entry
                </Button>
              </div>
            )}
          </Card>
        )}
      </motion.div>

      <Modal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setError("");
          setNewStatus("");
        }}
        title="Update Trip"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trip Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select status</option>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setUpdateModalOpen(false);
                setError("");
                setNewStatus("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTrip} loading={startTrip.isLoading}>
              Update Trip
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setError("");
        }}
        title="Delete Trip"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this trip? This action cannot be
              undone.
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setError("");
              }}
              disabled={deleteTrip.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTrip}
              loading={deleteTrip.isLoading}
            >
              Delete Trip
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={dutyStatusModalOpen}
        onClose={() => {
          setDutyStatusModalOpen(false);
          resetDutyStatusForm();
          setError("");
        }}
        title="Add Duty Status"
      >
        <form onSubmit={handleDutyStatusSubmit(onDutyStatusSubmit)}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                {...registerDutyStatus("status", {
                  required: "Status is required",
                })}
              >
                <option value="">Select a status</option>
                <option value="ON_DUTY_NOT_DRIVING">
                  On Duty (Not Driving)
                </option>
                <option value="DRIVING">Driving</option>
                <option value="OFF_DUTY">Off Duty</option>
                <option value="SLEEPER_BERTH">Sleeper Berth</option>
              </select>
              {dutyStatusErrors.status && (
                <p className="text-sm text-red-500 mt-1">
                  {dutyStatusErrors.status.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="datetime-local"
                error={dutyStatusErrors.start_time?.message}
                {...registerDutyStatus("start_time", {
                  required: "Start time is required",
                })}
              />
              <Input
                label="End Time"
                type="datetime-local"
                error={dutyStatusErrors.end_time?.message}
                {...registerDutyStatus("end_time", {
                  required: "End time is required",
                })}
              />
            </div>

            <div className="relative">
              <Input
                label="Location Description"
                placeholder="e.g., Richmond, VA"
                error={dutyStatusErrors.location_description?.message}
                {...registerDutyStatus("location_description", {
                  required: "Location description is required",
                })}
                onChange={(e) => fetchLocationSuggestions(e.target.value)}
              />
              {locationSuggestions.length > 0 && (
                <ul className="absolute z-20 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto">
                  {locationSuggestions.map((item) => (
                    <li
                      key={item.place_id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onMouseDown={() => handleLocationSelect(item)}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Input
              label="Remarks (Optional)"
              placeholder="e.g., Pre-trip inspection"
              {...registerDutyStatus("remarks")}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDutyStatusModalOpen(false)}
                disabled={createDutyStatusMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createDutyStatusMutation.isLoading}
              >
                Add Status
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={eldLogModalOpen}
        onClose={() => setEldLogModalOpen(false)}
        title="Add ELD Log Entry"
      >
        <form onSubmit={handleELDLogSubmit(onELDLogSubmit)}>
          <div className="space-y-4">
            <Input
              label="Log Date"
              type="date"
              error={eldLogErrors.date?.message}
              {...registerELDLog("date", { required: "Date is required" })}
            />
            <Input
              label="Total Miles"
              type="number"
              step="0.1"
              placeholder="e.g., 185.2"
              error={eldLogErrors.total_miles?.message}
              {...registerELDLog("total_miles", {
                required: "Total miles are required",
                valueAsNumber: true,
              })}
            />
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-600">
              Fuel & Engine Stats (Optional)
            </h4>
            <Input
              label="Fuel Consumed (gallons)"
              type="number"
              step="0.1"
              placeholder="e.g., 25.5"
              {...registerELDLog("fuel_consumed", { valueAsNumber: true })}
            />
            <Input
              label="Total Engine Hours"
              type="number"
              step="0.1"
              placeholder="e.g., 8.5"
              {...registerELDLog("total_engine_hours", { valueAsNumber: true })}
            />
            <Input
              label="Total Idle Hours"
              type="number"
              step="0.1"
              placeholder="e.g., 1.2"
              {...registerELDLog("total_idle_hours", { valueAsNumber: true })}
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEldLogModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={generateELDLog.isLoading}>
                Add Entry
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TripDetailsPage;
