import React, { useEffect } from 'react';
import { useVerifications } from '../../hooks/useVerifications';
import { Verification } from '../../services/verificationService';
import { Button } from '../components/ui/button';

interface VerificationTableProps {
  onSelectVerification: (verification: Verification) => void;
}

export const VerificationTable: React.FC<VerificationTableProps> = ({ onSelectVerification }) => {
  const { listVerifications, loading, error, data } = useVerifications();
  const [verifications, setVerifications] = React.useState<Verification[]>([]);
  const [errorState, setErrorState] = React.useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await listVerifications();
      setVerifications(result.data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">User ID</th>
            <th className="px-4 py-2 border-b">Status</th>
            <th className="px-4 py-2 border-b">Type</th>
            <th className="px-4 py-2 border-b">Created At</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} className="text-center py-4">Loading...</td>
            </tr>
          )}
          {(error as string | null) && (
            <tr>
              <td colSpan={6} className="text-center text-red-600 py-4">
                {typeof error === 'string' ? error : 'Error loading verifications.'}
              </td>
            </tr>
          )}
          {!loading && !error && verifications.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">No verifications found.</td>
            </tr>
          )}
          {verifications.map((verification) => (
            <tr key={verification.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{verification.id}</td>
              <td className="px-4 py-2 border-b">{verification.userId}</td>
              <td className="px-4 py-2 border-b">{verification.status}</td>
              <td className="px-4 py-2 border-b">{verification.type}</td>
              <td className="px-4 py-2 border-b">{verification.createdAt}</td>
              <td className="px-4 py-2 border-b">
                <Button
                  onClick={() => onSelectVerification(verification)}
                  aria-label="View Details"
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 