import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Fuel, Gauge, Clock } from "lucide-react";
import Button from "./Button";
import Input from "./Input";

interface TripCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: TripCompletionData) => void;
  tripId: number;
  initialOdometer: number;
  startTime: string;
  isLoading?: boolean;
}

export interface TripCompletionData {
  final_odometer: number;
  fuel_used: number;
  end_time: string;
  status: "COMPLETED";
}

const TripCompletionModal: React.FC<TripCompletionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialOdometer,
  startTime,
  isLoading = false,
}) => {
  const [finalOdometer, setFinalOdometer] = useState<number>(initialOdometer);
  const [fuelUsed, setFuelUsed] = useState<number>(0);
  const [endTime, setEndTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate preview values
  const distanceTraveled = finalOdometer > initialOdometer 
    ? finalOdometer - initialOdometer 
    : 0;
  const fuelEfficiency = fuelUsed > 0 ? distanceTraveled / fuelUsed : 0;
  const hoursUsed = endTime && startTime 
    ? (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60)
    : 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (finalOdometer <= initialOdometer) {
      newErrors.finalOdometer = `Final odometer must be greater than initial (${initialOdometer})`;
    }
    if (fuelUsed <= 0) {
      newErrors.fuelUsed = "Fuel used must be greater than 0";
    }
    if (!endTime) {
      newErrors.endTime = "End time is required";
    }
    if (new Date(endTime) <= new Date(startTime)) {
      newErrors.endTime = "End time must be after start time";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    onComplete({
      final_odometer: finalOdometer,
      fuel_used: fuelUsed,
      end_time: new Date(endTime).toISOString(),
      status: "COMPLETED",
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Complete Trip
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Input
                  label="Final Odometer Reading"
                  type="number"
                  min={initialOdometer}
                  step="1"
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(Number(e.target.value))}
                  icon={<Gauge className="w-4 h-4" />}
                  error={errors.finalOdometer}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Initial reading: {initialOdometer.toLocaleString()} miles
                </p>
              </div>

              <Input
                label="Fuel Used (gallons)"
                type="number"
                min="0"
                step="0.1"
                value={fuelUsed}
                onChange={(e) => setFuelUsed(Number(e.target.value))}
                icon={<Fuel className="w-4 h-4" />}
                error={errors.fuelUsed}
              />

              <Input
                label="Trip End Time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                icon={<Clock className="w-4 h-4" />}
                error={errors.endTime}
              />
            </div>

            {/* Calculated Values Preview */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Calculated Values (Preview)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {distanceTraveled.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Miles Traveled
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {fuelEfficiency.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    MPG
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {hoursUsed.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hours Used
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={isLoading}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Trip
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TripCompletionModal;
