'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';

export default function TestPage() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Test: Making API call to /properties/all');
        const response = await api.get('/properties/all', {
          params: { page: 1, limit: 5 }
        });
        console.log('Test: API response:', response.data);
        setData(response.data);
      } catch (err) {
        console.error('Test: API error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>API Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
} 