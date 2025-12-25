import { useMutation, useQueryClient } from "react-query";
import { api, Trip } from "../services/api";

export const useTripMutations = (tripId: string) => {
  const queryClient = useQueryClient();

  const startTrip = useMutation<Trip, Error, { status: string }>({
    mutationFn: (data) =>
      api.patch(`/api/trips/${tripId}/`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const deleteTrip = useMutation<void, Error>({
    mutationFn: () =>
      api.delete(`/api/trips/${tripId}/`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  return {
    startTrip,
    deleteTrip,
  };
};
