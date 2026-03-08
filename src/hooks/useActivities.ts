import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Activity } from '../types';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*, contact:contacts(*), deal:deals(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createActivity = async (activity: Partial<Activity>) => {
    const { data, error } = await supabase.from('activities').insert(activity).select().single();
    if (error) throw error;
    setActivities(prev => [data, ...prev]);
    return data;
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    const { data, error } = await supabase.from('activities').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setActivities(prev => prev.map(a => a.id === id ? data : a));
    return data;
  };

  const deleteActivity = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) throw error;
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, fetchActivities, createActivity, updateActivity, deleteActivity };
};
