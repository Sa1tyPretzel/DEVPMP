import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  Plus,
  Eye,
  AlertCircle,
} from "lucide-react";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import { useELDLogs } from "../hooks/useELDLogs";
import { motion } from "framer-motion";

const ELDLogsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [selectedDate, setSelectedDate] = useState("");
  const [viewingLog, setViewingLog] = useState<any>(null);
  const [remarks, setRemarks] = useState<{ [logId: number]: string }>({});
  const [error, setError] = useState<string>("");

  const {
    eldLogs,
    eldLogLoading,
    eldLogError,
    dutyStatuses,
    dutyStatusLoading,
    dutyStatusError,
    generateELDLog,
  } = useELDLogs(tripId!);

  const getDutyStatusColor = (status: string) => {
    switch (status) {
      case "DRIVING":
        return "#10B981"; // Green
      case "ON_DUTY_NOT_DRIVING":
        return "#3B82F6"; // Blue
      case "OFF_DUTY":
        return "#6B7280"; // Gray
      case "SLEEPER_BERTH":
        return "#F59E0B"; // Yellow
      default:
        return "#6B7280";
    }
  };

  const formatDutyStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const generateLog = async () => {
    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    try {
      setError("");
      await generateELDLog.mutateAsync({ date: selectedDate });
      const newLog = eldLogs?.find((log) => log.date === selectedDate) || {
        id: (eldLogs?.length || 0) + 1,
        date: selectedDate,
        total_miles: 185.2,
        timestamp: new Date().toISOString(),
      };
      setViewingLog({
        ...newLog,
        duty_statuses: dutyStatuses?.filter(
          (status) =>
            new Date(status.start_time).toISOString().split("T")[0] ===
            selectedDate
        ),
      });
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (err as Error).message;
      setError(errorMessage || "Failed to create carrier.");
    }
  };

  const handleViewLog = (log: any) => {
    setViewingLog({
      ...log,
      duty_statuses: dutyStatuses?.filter(
        (status) =>
          new Date(status.start_time).toISOString().split("T")[0] === log.date
      ),
    });
  };

  const handleRemarkChange = (logId: number, value: string) => {
    setRemarks((prev) => ({ ...prev, [logId]: value }));
  };

  const renderELDGrid = () => {
    if (!viewingLog) return null;

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const gridHeight = 400;
    const hourHeight = gridHeight / 24;

    return (
      <div
        className="relative bg-white border border-gray-300"
        style={{ height: gridHeight }}
      >
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute w-full flex items-center"
            style={{ top: hour * hourHeight }}
          >
            <div className="w-12 text-xs text-gray-600 text-right pr-2">
              {hour.toString().padStart(2, "0")}:00
            </div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        ))}

        <div className="absolute left-12 right-0 top-0 bottom-0">
          {viewingLog.duty_statuses?.map((status: any, index: number) => {
            const startHour =
              new Date(status.start_time).getHours() +
              new Date(status.start_time).getMinutes() / 60;
            const endHour =
              new Date(status.end_time).getHours() +
              new Date(status.end_time).getMinutes() / 60;
            const duration = endHour - startHour;

            return (
              <div
                key={index}
                className="absolute left-0 right-0 opacity-80 hover:opacity-100 transition-opacity"
                style={{
                  top: startHour * hourHeight,
                  height: duration * hourHeight,
                  backgroundColor: getDutyStatusColor(status.status),
                }}
                title={`${formatDutyStatus(status.status)} - ${
                  status.location_description
                }`}
              >
                <div className="p-1 text-xs text-white font-medium truncate">
                  {formatDutyStatus(status.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (eldLogLoading || dutyStatusLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (eldLogError || dutyStatusError) {
    return (
      <div className="text-center py-12 text-red-600">
        Error: {eldLogError?.message || dutyStatusError?.message}
      </div>
    );
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
            to={`/trips/${tripId}`}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              ELD Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Trip #{tripId} - Electronic Logging Device Records
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Generate New Log
            </h2>

            <div className="space-y-4">
              <Input
                label="Select Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />

              <Button
                onClick={generateLog}
                loading={generateELDLog.isLoading}
                disabled={!selectedDate}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate ELD Log
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generated Logs
            </h2>

            {eldLogs?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No logs generated yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eldLogs?.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(log.date!).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.total_miles} miles
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewLog(log)}
                      className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          {viewingLog ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  ELD Log - {new Date(viewingLog.date).toLocaleDateString()}
                </h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Driver
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    John Doe
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vehicle
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    TRK001
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Miles
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {viewingLog.total_miles}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(viewingLog.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Duty Status Graph
                </h3>
                {renderELDGrid()}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Off Duty
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Sleeper Berth
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Driving
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    On Duty (Not Driving)
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Duty Status Details
                </h3>
                <div className="space-y-2">
                  {viewingLog.duty_statuses?.map(
                    (status: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getDutyStatusColor(
                                status.status
                              ),
                            }}
                          ></div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDutyStatus(status.status)}
                          </span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {new Date(status.start_time).toLocaleTimeString()} -{" "}
                          {new Date(status.end_time).toLocaleTimeString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-500 max-w-xs truncate">
                          {status.location_description}
                        </div>
                      </div>
                    )
                  )}
                  {!viewingLog.duty_statuses?.length && (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      No duty statuses found for this date.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Driver Remarks
                </h4>
                <textarea
                  className="w-full h-20 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add any remarks or notes for this log..."
                  value={remarks[viewingLog.id] || ""}
                  onChange={(e) =>
                    handleRemarkChange(viewingLog.id, e.target.value)
                  }
                />
              </div>
            </Card>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Log Selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Generate a new log or select an existing one to view the
                  24-hour duty status graph.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ELDLogsPage;
