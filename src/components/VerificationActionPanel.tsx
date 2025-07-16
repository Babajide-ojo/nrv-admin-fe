import React, { useState } from 'react';
import { Button } from '../components/ui/button';

interface VerificationActionPanelProps {
  title: string;
  inputFields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }>;
  onSubmit: (values: Record<string, string>) => Promise<unknown>;
  loading: boolean;
  result: string | null;
  error: string | null;
}

export const VerificationActionPanel: React.FC<VerificationActionPanelProps> = ({
  title,
  inputFields,
  onSubmit,
  loading,
  result,
  error,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    await onSubmit(values);
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {inputFields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label htmlFor={field.name} className="font-medium mb-1">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              required={field.required}
              value={values[field.name] || ''}
              onChange={handleChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              aria-label={field.label}
            />
          </div>
        ))}
        <Button type="submit" disabled={loading} aria-label={`Submit ${title} verification`}>
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
      {submitted && error && (
        <div className="text-red-600 mt-2" role="alert">
          {typeof error === 'string' ? error : 'An error occurred.'}
        </div>
      )}
      {submitted && result && !error && (
        <div className="text-green-600 mt-2" role="status">
          Verification successful.
        </div>
      )}
    </div>
  );
}; 