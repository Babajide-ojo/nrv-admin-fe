import React, { useState } from 'react';
import { Verification } from '../../services/verificationService';
import { useVerifications } from '../../hooks/useVerifications';
import { VerificationActionPanel } from './VerificationActionPanel';

interface VerificationDetailsProps {
  verification: Verification;
}

export const VerificationDetails: React.FC<VerificationDetailsProps> = ({ verification }) => {
  const {
    verifyNIN,
    verifyBVN,
    verifyPhone,
    verifyDL,
    verifyVIN,
    verifyEmployment,
    verifyGuarantor,
    verifyAffordability,
    amlScreening,
    loading,
    error,
    data,
  } = useVerifications();

  // Local state for each action result
  const [ninResult, setNinResult] = useState<unknown>(null);
  const [bvnResult, setBvnResult] = useState<unknown>(null);
  const [phoneResult, setPhoneResult] = useState<unknown>(null);
  const [dlResult, setDlResult] = useState<unknown>(null);
  const [vinResult, setVinResult] = useState<unknown>(null);
  const [employmentResult, setEmploymentResult] = useState<unknown>(null);
  const [guarantorResult, setGuarantorResult] = useState<unknown>(null);
  const [affordabilityResult, setAffordabilityResult] = useState<unknown>(null);
  const [amlResult, setAmlResult] = useState<unknown>(null);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Verification Details</h2>
      <div className="bg-gray-50 rounded p-4 mb-6">
        <div className="mb-2"><span className="font-semibold">ID:</span> {verification.id}</div>
        <div className="mb-2"><span className="font-semibold">User ID:</span> {verification.userId}</div>
        <div className="mb-2"><span className="font-semibold">Status:</span> {verification.status}</div>
        <div className="mb-2"><span className="font-semibold">Type:</span> {verification.type}</div>
        <div className="mb-2"><span className="font-semibold">Created At:</span> {verification.createdAt}</div>
        <div className="mb-2"><span className="font-semibold">Updated At:</span> {verification.updatedAt}</div>
      </div>
      <VerificationActionPanel
        title="NIN Verification"
        inputFields={[{ name: 'nin', label: 'NIN', required: true }]}
        onSubmit={async (values) => setNinResult(await verifyNIN({ nin: values.nin }))}
        loading={loading}
        result={ninResult}
        error={error}
      />
      <VerificationActionPanel
        title="BVN Verification"
        inputFields={[{ name: 'bvn', label: 'BVN', required: true }]}
        onSubmit={async (values) => setBvnResult(await verifyBVN({ bvn: values.bvn }))}
        loading={loading}
        result={bvnResult}
        error={error}
      />
      <VerificationActionPanel
        title="Phone Verification"
        inputFields={[{ name: 'phone', label: 'Phone', required: true }]}
        onSubmit={async (values) => setPhoneResult(await verifyPhone({ phone: values.phone }))}
        loading={loading}
        result={phoneResult}
        error={error}
      />
      <VerificationActionPanel
        title="Driver's License Verification"
        inputFields={[{ name: 'dl', label: 'Driver License', required: true }]}
        onSubmit={async (values) => setDlResult(await verifyDL({ dl: values.dl }))}
        loading={loading}
        result={dlResult}
        error={error}
      />
      <VerificationActionPanel
        title="VIN Verification"
        inputFields={[{ name: 'vin', label: 'VIN', required: true }]}
        onSubmit={async (values) => setVinResult(await verifyVIN({ vin: values.vin }))}
        loading={loading}
        result={vinResult}
        error={error}
      />
      <VerificationActionPanel
        title="Employment Verification"
        inputFields={[{ name: 'employer', label: 'Employer', required: true }]}
        onSubmit={async (values) => setEmploymentResult(await verifyEmployment(verification.id, values))}
        loading={loading}
        result={employmentResult}
        error={error}
      />
      <VerificationActionPanel
        title="Guarantor Verification"
        inputFields={[{ name: 'guarantor', label: 'Guarantor', required: true }]}
        onSubmit={async (values) => setGuarantorResult(await verifyGuarantor(verification.id, values))}
        loading={loading}
        result={guarantorResult}
        error={error}
      />
      <VerificationActionPanel
        title="Affordability Verification"
        inputFields={[{ name: 'income', label: 'Income', required: true }]}
        onSubmit={async (values) => setAffordabilityResult(await verifyAffordability(verification.id, values))}
        loading={loading}
        result={affordabilityResult}
        error={error}
      />
      <VerificationActionPanel
        title="AML Screening"
        inputFields={[{ name: 'aml', label: 'AML Data', required: true }]}
        onSubmit={async (values) => setAmlResult(await amlScreening(values))}
        loading={loading}
        result={amlResult}
        error={error}
      />
    </div>
  );
}; 