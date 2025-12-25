import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Check, ChevronDown } from "lucide-react";

interface Vehicle {
  id: number;
  vehicle_number: string;
  license_plate: string;
  state: string;
}

interface VehicleDropdownProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

const VehicleDropdown: React.FC<VehicleDropdownProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedVehicle ? (
          <div className="flex items-center">
            <Truck className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedVehicle.vehicle_number}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedVehicle.license_plate} - {selectedVehicle.state}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select a vehicle</span>
        )}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {vehicles.map((vehicle) => (
              <li
                key={vehicle.id}
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                onClick={() => {
                  console.log("Selected vehicle:", vehicle);
                  onSelectVehicle(vehicle);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <Truck className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.vehicle_number}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.license_plate} - {vehicle.state}
                    </p>
                  </div>
                </div>
                {selectedVehicle && selectedVehicle.id === vehicle.id && (
                  <Check className="w-5 h-5 text-teal-600" />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleDropdown;
