import { useState, useEffect, useCallback } from 'react';
import { dsaApi } from '../services/api';
import type { DSATopicGroup, DSASheetSummary, DSAProgressUpdate } from '../types';

export function useDSASheet(goalId: string) {
  const [summary, setSummary] = useState<DSASheetSummary | null>(null);
  const [topicGroups, setTopicGroups] = useState<DSATopicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumData, sheetData] = await Promise.all([
        dsaApi.getSummary(goalId),
        dsaApi.getSheet(goalId, {
          status: statusFilter || undefined,
          difficulty: difficultyFilter || undefined,
          topic: searchQuery || undefined,
        }),
      ]);
      setSummary(sumData);
      setTopicGroups(sheetData);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Not seeded yet?
        setError('not_found');
      } else {
        setError(err.message || 'Failed to fetch DSA data');
      }
    } finally {
      setLoading(false);
    }
  }, [goalId, statusFilter, difficultyFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProgress = async (progressId: string, update: DSAProgressUpdate) => {
    try {
      await dsaApi.updateProgress(progressId, update);
      // Optimistic update would be better, but re-fetching is safer for now
      await fetchData();
    } catch (err: any) {
      console.error('Failed to update progress', err);
      throw err;
    }
  };

  const seedSheet = async () => {
    setLoading(true);
    try {
      await dsaApi.seedSheet(goalId);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to seed sheet');
      setLoading(false);
    }
  };

  return {
    summary,
    topicGroups,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    difficultyFilter,
    setDifficultyFilter,
    searchQuery,
    setSearchQuery,
    updateProgress,
    seedSheet,
    refresh: fetchData,
  };
}
