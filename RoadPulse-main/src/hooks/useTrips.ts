import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tripsAPI, Trip } from '../services/api';

export const useTrips = (params?: { status?: string; limit?: number; offset?: number }) => {
  return useQuery(['trips', params], () => tripsAPI.getTrips(params), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTrip = (id: number) => {
  return useQuery(['trip', id], () => tripsAPI.getTrip(id), {
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation(tripsAPI.createTrip, {
    onSuccess: () => {
      queryClient.invalidateQueries(['trips']);
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, updates }: { id: number; updates: Partial<Trip> }) => 
      tripsAPI.updateTrip(id, updates),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['trips']);
        queryClient.setQueryData(['trip', data.id], data);
      },
    }
  );
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation(tripsAPI.deleteTrip, {
    onSuccess: () => {
      queryClient.invalidateQueries(['trips']);
    },
  });
};

export const useCalculateRoute = () => {
  return useMutation(tripsAPI.calculateRoute);
};