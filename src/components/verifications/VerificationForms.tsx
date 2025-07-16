import React, { useState } from 'react';
import { Verification } from '../../../services/verificationService';
import { useVerifications } from '../../../hooks/useVerifications';
import { Button } from '../ui/button';

const TABS = [
  { key: 'nin', label: 'NIN' },
  { key: 'bvn', label: 'BVN' },
  { key: 'phone', label: 'Phone' },
  { key: 'dl', label: 'Driver License' },
  { key: 'vin', label: 'VIN' },
  { key: 'employment', label: 'Employment' },
  { key: 'guarantor', label: 'Guarantor' },
  { key: 'affordability', label: 'Affordability' },
  { key: 'aml', label: 'AML' },
];

interface VerificationFormsProps {
  verification: Verification;
  onClose: () => void;
}

export const VerificationForms: React.FC<VerificationFormsProps> = ({ verification, onClose }) => {
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
    error: verificationsError,
  } = useVerifications();

  // Tab state
  const [activeTab, setActiveTab] = useState('nin');

  // Local state for each action result
  const [nin, setNin] = useState('');
  const [ninResult, setNinResult] = useState<string | null>(null);
  const [bvn, setBvn] = useState('');
  const [bvnResult, setBvnResult] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneResult, setPhoneResult] = useState<string | null>(null);
  const [dl, setDl] = useState('');
  const [dlResult, setDlResult] = useState<string | null>(null);
  const [vin, setVin] = useState('');
  const [vinResult, setVinResult] = useState<string | null>(null);
  const [employment, setEmployment] = useState('');
  const [employmentResult, setEmploymentResult] = useState<string | null>(null);
  const [guarantor, setGuarantor] = useState('');
  const [guarantorResult, setGuarantorResult] = useState<string | null>(null);
  const [income, setIncome] = useState('');
  const [affordabilityResult, setAffordabilityResult] = useState<string | null>(null);
  const [aml, setAml] = useState('');
  const [amlResult, setAmlResult] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Toast auto-dismiss
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Helper for showing toast
  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message });

  // Form submit handlers
  const handleNin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyNIN({ nin });
      setNinResult(res as string | null);
      showToast('success', 'NIN verification successful!');
    } catch (err) {
      showToast('error', 'NIN verification failed.');
    }
  };
  const handleBvn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyBVN({ bvn });
      setBvnResult(res as string | null);
      showToast('success', 'BVN verification successful!');
    } catch (err) {
      showToast('error', 'BVN verification failed.');
    }
  };
  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyPhone({ phone });
      setPhoneResult(res as string | null);
      showToast('success', 'Phone verification successful!');
    } catch (err) {
      showToast('error', 'Phone verification failed.');
    }
  };
  const handleDl = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyDL({ dl });
      setDlResult(res as string | null);
      showToast('success', 'DL verification successful!');
    } catch (err) {
      showToast('error', 'DL verification failed.');
    }
  };
  const handleVin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyVIN({ vin });
      setVinResult(res as string | null);
      showToast('success', 'VIN verification successful!');
    } catch (err) {
      showToast('error', 'VIN verification failed.');
    }
  };
  const handleEmployment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyEmployment(verification.id, { employer: employment });
      setEmploymentResult(res as string | null);
      showToast('success', 'Employment verification successful!');
    } catch (err) {
      showToast('error', 'Employment verification failed.');
    }
  };
  const handleGuarantor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyGuarantor(verification.id, { guarantor });
      setGuarantorResult(res as string | null);
      showToast('success', 'Guarantor verification successful!');
    } catch (err) {
      showToast('error', 'Guarantor verification failed.');
    }
  };
  const handleAffordability = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyAffordability(verification.id, { income });
      setAffordabilityResult(res as string | null);
      showToast('success', 'Affordability verification successful!');
    } catch (err) {
      showToast('error', 'Affordability verification failed.');
    }
  };
  const handleAml = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await amlScreening({ aml });
      setAmlResult(res as string | null);
      showToast('success', 'AML screening successful!');
    } catch (err) {
      showToast('error', 'AML screening failed.');
    }
  };

  // Tab content map
  const tabContent: Record<string, React.ReactNode> = {
    nin: (
      <form className="space-y-2" onSubmit={handleNin} aria-label="NIN Verification Form">
        <label className="block font-medium" htmlFor="nin-input">NIN</label>
        <input id="nin-input" className="border rounded px-3 py-2 w-full" value={nin} onChange={e => setNin(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify NIN">Verify NIN</Button>
        {ninResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
    bvn: (
      <form className="space-y-2" onSubmit={handleBvn} aria-label="BVN Verification Form">
        <label className="block font-medium" htmlFor="bvn-input">BVN</label>
        <input id="bvn-input" className="border rounded px-3 py-2 w-full" value={bvn} onChange={e => setBvn(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify BVN">Verify BVN</Button>
        {bvnResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
    phone: (
      <form className="space-y-2" onSubmit={handlePhone} aria-label="Phone Verification Form">
        <label className="block font-medium" htmlFor="phone-input">Phone</label>
        <input id="phone-input" className="border rounded px-3 py-2 w-full" value={phone} onChange={e => setPhone(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify Phone">Verify Phone</Button>
        {phoneResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
    dl: (
      <form className="space-y-2" onSubmit={handleDl} aria-label="DL Verification Form">
        <label className="block font-medium" htmlFor="dl-input">Driver License</label>
        <input id="dl-input" className="border rounded px-3 py-2 w-full" value={dl} onChange={e => setDl(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify DL">Verify DL</Button>
        {dlResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
    vin: (
      <form className="space-y-2" onSubmit={handleVin} aria-label="VIN Verification Form">
        <label className="block font-medium" htmlFor="vin-input">VIN</label>
        <input id="vin-input" className="border rounded px-3 py-2 w-full" value={vin} onChange={e => setVin(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify VIN">Verify VIN</Button>
        {vinResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
    employment: (
      <form className="space-y-2" onSubmit={handleEmployment} aria-label="Employment Verification Form">
        <label className="block font-medium" htmlFor="employment-input">Employer</label>
        <input id="employment-input" className="border rounded px-3 py-2 w-full" value={employment} onChange={e => setEmployment(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify Employment">Verify Employment</Button>
        {employmentResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
    guarantor: (
      <form className="space-y-2" onSubmit={handleGuarantor} aria-label="Guarantor Verification Form">
        <label className="block font-medium" htmlFor="guarantor-input">Guarantor</label>
        <input id="guarantor-input" className="border rounded px-3 py-2 w-full" value={guarantor} onChange={e => setGuarantor(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify Guarantor">Verify Guarantor</Button>
        {guarantorResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
    affordability: (
      <form className="space-y-2" onSubmit={handleAffordability} aria-label="Affordability Verification Form">
        <label className="block font-medium" htmlFor="income-input">Income</label>
        <input id="income-input" className="border rounded px-3 py-2 w-full" value={income} onChange={e => setIncome(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify Affordability">Verify Affordability</Button>
        {affordabilityResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
    aml: (
      <form className="space-y-2" onSubmit={handleAml} aria-label="AML Verification Form">
        <label className="block font-medium" htmlFor="aml-input">AML Data</label>
        <input id="aml-input" className="border rounded px-3 py-2 w-full" value={aml} onChange={e => setAml(e.target.value)} required aria-required="true" />
        <Button type="submit" disabled={loading} aria-label="Verify AML">Verify AML</Button>
        {amlResult && <div className="text-green-600 mt-2">Success</div>}
      </form>
    ),
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Perform Verifications</h2>
        <Button onClick={onClose} aria-label="Close">Close</Button>
      </div>
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b pb-2" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-3 py-1 rounded-t font-medium focus:outline-none ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tab-panel-${tab.key}`}
            tabIndex={0}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div id={`tab-panel-${activeTab}`} role="tabpanel">
        {React.isValidElement(tabContent[activeTab])
          ? tabContent[activeTab]
          : null}
      </div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed left-1/2 transform -translate-x-1/2 bottom-8 px-6 py-3 rounded shadow-lg text-white z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
      {/* Error fallback */}
      {error && !toast && (
        <div className="text-red-600 mt-4" role="alert">{String(error)}</div>
      )}
    </div>
  );
}; 