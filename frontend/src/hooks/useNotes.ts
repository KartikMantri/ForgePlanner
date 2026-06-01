import { useState, useEffect, useCallback } from 'react';
import { notesApi } from '../services/api';
import type { NotePage, NotePageWithBlocks, SaveBlocksRequest } from '../types';

export function useNotes(goalId: string) {
  const [pages, setPages] = useState<NotePage[]>([]);
  const [activePage, setActivePage] = useState<NotePageWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notesApi.listPages(goalId);
      setPages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const loadPage = async (pageId: string) => {
    try {
      const data = await notesApi.getPage(pageId);
      setActivePage(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const createPage = async (title: string) => {
    try {
      const newPage = await notesApi.createPage(goalId, title);
      setPages((prev) => [newPage, ...prev]);
      await loadPage(newPage.id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const saveBlocks = async (pageId: string, blocks: SaveBlocksRequest) => {
    try {
      await notesApi.saveBlocks(pageId, blocks);
      await loadPage(pageId);
    } catch (err: any) {
      console.error(err);
    }
  };

  return {
    pages,
    activePage,
    loading,
    error,
    loadPage,
    createPage,
    saveBlocks,
    refresh: fetchPages,
  };
}
