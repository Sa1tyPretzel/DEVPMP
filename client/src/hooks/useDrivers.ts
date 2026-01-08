import { useQuery, useMutation, useQueryClient } from "react-query";
import { driversAPI, Driver } from "../services/api";

export const useDrivers = () => {
  return useQuery("drivers", driversAPI.getDrivers, {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useDriver = (id: number) => {
  return useQuery(["driver", id], () => driversAPI.getDriver(id), {
    enabled: !!id,
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: Partial<Driver> }) =>
      driversAPI.updateDriver(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("drivers");
      },
    }
  );
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation(driversAPI.deleteDriver, {
    onSuccess: () => {
      queryClient.invalidateQueries("drivers");
    },
  });
};
