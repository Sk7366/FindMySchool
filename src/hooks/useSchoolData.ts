import { useCallback, useMemo } from 'react';
import { School } from '../types/school';
import { GetSchoolsParams, SearchRequest, ChennaiNeighbourhood, FacilitySummary } from '../types/api';
import { schoolService } from '../services/schoolService';
import { useAsync, AsyncState } from './useAsync';

/**
 * Centralized hook to fetch a single school profile by ID or slug.
 * Manages loading, error, empty, and retry states.
 */
export function useSchool(idOrSlug?: string | null) {
  const fetchSchool = useCallback(async () => {
    if (!idOrSlug) return null;
    const response = await schoolService.getById(idOrSlug);
    if (response.status === 'error' || !response.data) {
      throw new Error(response.error || `Institution '${idOrSlug}' not found.`);
    }
    return response.data;
  }, [idOrSlug]);

  const asyncState = useAsync<School | null>(fetchSchool, {
    immediate: Boolean(idOrSlug),
    checkIsEmpty: (school) => !school,
  });

  return {
    school: asyncState.data,
    loading: asyncState.loading,
    error: asyncState.error,
    isEmpty: asyncState.isEmpty,
    retry: asyncState.retry,
  };
}

/**
 * Centralized hook to fetch schools with optional filtering parameters.
 */
export function useSchools(params?: GetSchoolsParams) {
  const paramsKey = JSON.stringify(params || {});

  const fetchSchools = useCallback(async () => {
    const response = await schoolService.getSchools(params);
    if (response.status === 'error') {
      throw new Error(response.error || 'Failed to load institutions.');
    }
    return response.data;
  }, [paramsKey]);

  const asyncState = useAsync<School[]>(fetchSchools, {
    immediate: true,
    checkIsEmpty: (schools) => !schools || schools.length === 0,
  });

  return {
    schools: asyncState.data || [],
    loading: asyncState.loading,
    error: asyncState.error,
    isEmpty: asyncState.isEmpty,
    retry: asyncState.retry,
  };
}

/**
 * Centralized hook to get similar institutions for comparison.
 */
export function useSimilarSchools(targetSchool?: School | null, limit: number = 3) {
  const similar = useMemo(() => {
    if (!targetSchool) return [];
    const all = schoolService.getSchoolsSync();
    const isEarly = targetSchool.institutionType === 'preschool';

    return all
      .filter((s) => {
        if (s.id === targetSchool.id) return false;
        if (isEarly) {
          return s.institutionType === 'preschool' || s.institutionType === 'combined';
        }
        return !s.institutionType || s.institutionType === 'school' || s.institutionType === 'combined';
      })
      .sort((a, b) => {
        const aSameArea = a.area === targetSchool.area ? 1 : 0;
        const bSameArea = b.area === targetSchool.area ? 1 : 0;
        return (
          bSameArea - aSameArea ||
          Math.abs(a.distanceKm - targetSchool.distanceKm) - Math.abs(b.distanceKm - targetSchool.distanceKm)
        );
      })
      .slice(0, limit);
  }, [targetSchool, limit]);

  return similar;
}

/**
 * Centralized hook to fetch educational corridors / areas.
 */
export function useAreas() {
  const fetchAreas = useCallback(async () => {
    const response = await schoolService.getAreas();
    return response.data;
  }, []);

  const asyncState = useAsync<ChennaiNeighbourhood[]>(fetchAreas, {
    immediate: true,
    initialData: schoolService.getAreasSync(),
  });

  return {
    areas: asyncState.data || [],
    loading: asyncState.loading,
    error: asyncState.error,
    retry: asyncState.retry,
  };
}
