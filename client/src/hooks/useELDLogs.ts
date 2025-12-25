import { useQuery, useMutation, useQueryClient } from "react-query";
import { api, ELDLog, DutyStatus } from "../services/api";
import { ELDLogForm } from "../pages/TripDetailsPage";

interface GenerateELDLogResponse {
  message: string;
  logs: ELDLog[];
}

export const useELDLogs = (tripId: string) => {
  const queryClient = useQueryClient();

  const eldLogQuery = useQuery<ELDLog[], Error>({
    queryKey: ["eldLogs", tripId],
    queryFn: () =>
      api.get(`/api/trips/${tripId}/eld-logs/`).then((res) => res.data),
    enabled: !!tripId,
  });

  const dutyStatusQuery = useQuery<DutyStatus[], Error>({
    queryKey: ["dutyStatuses", tripId],
    queryFn: () =>
      api.get(`/api/trips/${tripId}/duty-status/`).then((res) => res.data),
    enabled: !!tripId,
  });

  const generateELDLog = useMutation<GenerateELDLogResponse, Error, ELDLogForm>(
    {
      mutationFn: (data) =>
        api
          .post(`/api/trips/${tripId}/eld-logs/generate/`, data)
          .then((res) => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["eldLogs", tripId] });
      },
    }
  );

  return {
    eldLogs: eldLogQuery.data,
    eldLogLoading: eldLogQuery.isLoading,
    eldLogError: eldLogQuery.error,
    dutyStatuses: dutyStatusQuery.data,
    dutyStatusLoading: dutyStatusQuery.isLoading,
    dutyStatusError: dutyStatusQuery.error,
    generateELDLog,
  };
};
