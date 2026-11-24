import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyLearningAction,
  dismissLearningRecommendation,
  getLearningNext,
  getLearningRecommendations,
  getLearningSummary,
  trackLearningEvent,
} from '../api/learningHub.js';

function contextKey(context = {}) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(context)
        .map(([key, value]) => [key, Array.isArray(value) ? [...value].sort() : value])
        .filter(([, value]) => value !== undefined && value !== null && value !== ''),
    ),
  );
}

export function useLearningRecommendations({ surface, context = {}, limit = 3, enabled = true }) {
  return useQuery({
    queryKey: ['learning-recommendations', surface, contextKey(context), limit],
    queryFn: () => getLearningRecommendations({ surface, context, limit }),
    enabled: Boolean(surface) && enabled,
    staleTime: 2 * 60_000,
    retry: 1,
  });
}

export function useLearningNext(enabled = true) {
  return useQuery({
    queryKey: ['learning-next'],
    queryFn: getLearningNext,
    enabled,
    staleTime: 60_000,
  });
}

export function useLearningSummary(enabled = true) {
  return useQuery({
    queryKey: ['learning-summary'],
    queryFn: getLearningSummary,
    enabled,
    staleTime: 60_000,
  });
}

function invalidateLearning(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['learning-next'] });
  queryClient.invalidateQueries({ queryKey: ['learning-summary'] });
  queryClient.invalidateQueries({ queryKey: ['learning-recommendations'] });
  queryClient.invalidateQueries({ queryKey: ['curriculum'] });
  queryClient.invalidateQueries({ queryKey: ['curriculum-lesson'] });
}

export function useApplyLearningAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, action }) => applyLearningAction(slug, action),
    onSuccess: () => invalidateLearning(queryClient),
  });
}

export function useDismissLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissLearningRecommendation,
    onSuccess: () => invalidateLearning(queryClient),
  });
}

export function useTrackLearningEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trackLearningEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning-summary'] }),
  });
}
