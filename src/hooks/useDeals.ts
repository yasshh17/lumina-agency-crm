import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Deal } from '../types';

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*, contact:contacts(*)')
        .order('value', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeal = async (deal: Partial<Deal>) => {
    const { data, error } = await supabase.from('deals').insert(deal).select().single();
    if (error) throw error;
    setDeals(prev => [data, ...prev]);
    return data;
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const { data, error } = await supabase.from('deals').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setDeals(prev => prev.map(d => d.id === id ? data : d));
    return data;
  };

  const deleteDeal = async (id: string) => {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) throw error;
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return { deals, loading, error, fetchDeals, createDeal, updateDeal, deleteDeal };
};
