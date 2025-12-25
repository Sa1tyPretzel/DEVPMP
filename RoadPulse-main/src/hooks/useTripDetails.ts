import { useQuery } from "react-query";
import { api, Trip, DutyStatus, ELDLog } from "../services/api";

export const useTripDetails = (tripId: string) => {
  const tripQuery = useQuery<Trip, Error>({
    queryKey: ["trip", tripId],
    queryFn: () => api.get(`/api/trips/${tripId}/`).then((res) => res.data),
    enabled: !!tripId,
  });

  const dutyStatusQuery = useQuery<DutyStatus[], Error>({
    queryKey: ["dutyStatuses", tripId],
    queryFn: () =>
      api.get(`/api/trips/${tripId}/duty-status/`).then((res) => res.data),
    enabled: !!tripId,
  });

  const eldLogQuery = useQuery<ELDLog[], Error>({
    queryKey: ["eldLogs", tripId],
    queryFn: () =>
      api.get(`/api/trips/${tripId}/eld-logs/`).then((res) => res.data),
    enabled: !!tripId,
  });

  return {
    trip: tripQuery.data,
    tripLoading: tripQuery.isLoading,
    tripError: tripQuery.error,
    dutyStatuses: dutyStatusQuery.data,
    dutyStatusLoading: dutyStatusQuery.isLoading,
    dutyStatusError: dutyStatusQuery.error,
    eldLogs: eldLogQuery.data,
    eldLogLoading: eldLogQuery.isLoading,
    eldLogError: eldLogQuery.error,
  };
};
