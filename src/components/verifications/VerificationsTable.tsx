'use client';
import { useEffect, useState } from 'react';
import { fetchVerifications, Verification } from '@/lib/api/verifications';

const VerificationsTable = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchVerifications();
        setVerifications(res.data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch verifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">User ID</th>
            <th className="px-4 py-2 border-b">Status</th>
            <th className="px-4 py-2 border-b">Created At</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map((v) => (
            <tr key={v.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{v.id}</td>
              <td className="px-4 py-2 border-b">{v.userId}</td>
              <td className="px-4 py-2 border-b">{v.status}</td>
              <td className="px-4 py-2 border-b">{new Date(v.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2 border-b">
                <a
                  href={`/verifications/${v.id}`}
                  className="text-green-600 hover:underline focus:outline-none"
                  tabIndex={0}
                  aria-label="View details"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerificationsTable; 