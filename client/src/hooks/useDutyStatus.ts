import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";

export const useDutyStatuses = (tripId: number) => {
  return useQuery(
    ["dutyStatuses", tripId],
    () => api.get(`/api/trips/${tripId}/duty-status/`).then((res) => res.data),
    {
      enabled: !!tripId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

export const useCreateDutyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      tripId,
      dutyStatusData,
    }: {
      tripId: number;
      dutyStatusData: {
        status: string;
        start_time: string;
        end_time: string;
        location: [number, number];
        location_description: string;
        remarks?: string;
      };
    }) =>
      api
        .post(`/api/trips/${tripId}/duty-status/`, dutyStatusData)
        .then((res) => res.data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([
          "dutyStatuses",
          variables.tripId.toString(),
        ]);
      },
    }
  );
};
