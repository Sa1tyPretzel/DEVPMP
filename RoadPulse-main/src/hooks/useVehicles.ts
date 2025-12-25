import { useQuery, useMutation, useQueryClient } from "react-query";
import { vehiclesAPI } from "../services/api";

export const useVehicles = () => {
  return useQuery("vehicles", vehiclesAPI.getVehicles, {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation(vehiclesAPI.createVehicle, {
    onSuccess: () => {
      queryClient.invalidateQueries("vehicles");
    },
  });
};
