import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Contact } from '../types';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = async (contact: Partial<Contact>) => {
    const { data, error } = await supabase.from('contacts').insert(contact).select().single();
    if (error) throw error;
    setContacts(prev => [data, ...prev]);
    return data;
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setContacts(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, error, fetchContacts, createContact, updateContact, deleteContact };
};
