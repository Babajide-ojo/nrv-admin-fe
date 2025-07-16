'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchVerificationById, fetchVerificationResponsesByVerificationId, Verification, verifyPhoneNumber } from '../../../lib/api/verifications';
import { Button } from '@/components/ui/button';
import { HiUser, HiOfficeBuilding, HiUserGroup, HiDocumentText } from 'react-icons/hi';
import { FaRegAddressCard } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import {
  updatePersonalReport,
  updateEmploymentReport,
  updateGuarantorReport,
  updateDocumentsReport,
} from '../../../lib/api/verifications';

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { status: string; comment: string }) => void;
  group: string;
  loading: boolean;
  defaultStatus?: string;
  defaultComment?: string;
};

type Report = {
  status: string;
  comment: string;
  reviewedBy: string;
  reviewedAt: string | Date;
};

type VerificationResponseWithReports = Record<string, unknown> & {
  personalReport?: Report | null;
  employmentReport?: Report | null;
  guarantorReport?: Report | null;
  documentsReport?: Report | null;
  phoneVerificationResult?: {
    status?: string;
    error?: string;
    data?: {
      entity?: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        date_of_birth?: string;
        gender?: string;
        phone_number?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    entity?: {
      first_name?: string;
      last_name?: string;
      middle_name?: string;
      date_of_birth?: string;
      gender?: string;
      phone_number?: string;
      [key: string]: unknown;
    };
    originalPhone?: string;
    finalPhone?: string;
    [key: string]: unknown;
  } | null;
  phoneVerificationStatus?: string;
  phoneVerificationDate?: string | Date;
};

const VerificationDetailsPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [verification, setVerification] = useState<Verification | null>(null);
  const [responses, setResponses] = useState<VerificationResponseWithReports[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | 'approve' | 'reject' | 'request-info'>(null);
  const [modal, setModal] = useState<null | { group: string; responseId: string }>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchVerificationById(id as string)
      .then((v) => {
        setVerification(v);
        return fetchVerificationResponsesByVerificationId(id as string);
      })
      .then((res) => {
        setResponses(res);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load verification details.');
        setLoading(false);
      });
  }, [id]);

  const handleAction = async (action: 'approve' | 'reject' | 'request-info') => {
    setActionLoading(true);
    try {
      // Replace with actual API call for each action
      await new Promise(res => setTimeout(res, 1000));
      setToast({ type: 'success', message: `Verification ${action.replace('-', ' ')}d successfully!` });
      setConfirmAction(null);
    } catch {
      setToast({ type: 'error', message: `Failed to ${action.replace('-', ' ')} verification.` });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleReportSubmit = async ({ status, comment }: { status: string; comment: string }) => {
    if (!modal) return;
    setModalLoading(true);
    const reviewedBy = 'Admin User'; // Replace with real admin name/email if available
    const reviewedAt = new Date();
    try {
      if (modal.group === 'Personal') {
        await updatePersonalReport(modal.responseId, { status, comment, reviewedBy, reviewedAt });
      } else if (modal.group === 'Employment') {
        await updateEmploymentReport(modal.responseId, { status, comment, reviewedBy, reviewedAt });
      } else if (modal.group === 'Guarantor') {
        await updateGuarantorReport(modal.responseId, { status, comment, reviewedBy, reviewedAt });
      } else if (modal.group === 'Documents') {
        await updateDocumentsReport(modal.responseId, { status, comment, reviewedBy, reviewedAt });
      }
      setResponses(responses =>
        responses.map(r =>
          r._id === modal.responseId ? { ...r, [`${modal.group.toLowerCase()}Report`]: { status, comment, reviewedBy, reviewedAt } } : r
        )
      );
      setModal(null);
    } catch {
      // Optionally show a toast or error UI here
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </AdminSidebarLayout>
    );
  }

  if (error || !verification) {
    return (
      <AdminSidebarLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-red-600 text-lg font-medium">{error || 'Verification not found.'}</div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="max-w-3xl mx-auto py-8">
        <Card className="mb-8 shadow-2xl border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-blue-900">
              <HiDocumentText className="text-blue-500 text-3xl" /> Verification Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-gray-500">No responses available.</div>
            ) : (
              <div className="space-y-10">
                {responses.map((resp, idx) => (
                  <div key={String(resp._id ?? idx)} className="rounded-2xl bg-white shadow-lg p-8 border border-slate-100 hover:shadow-2xl transition-shadow duration-200">
                    {/* Personal Info */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <HiUser className="text-blue-400 text-xl" />
                        <h3 className="text-lg font-semibold text-blue-800 tracking-wide">Personal Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><span className="font-semibold">Full Name:</span> {String(resp.fullName ?? '')}</div>
                        <div><span className="font-semibold">Email:</span> {String(resp.email ?? '')}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Phone:</span> 
                          <span>{String(resp.phone ?? '')}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                            onClick={async () => {
                              try {
                                await verifyPhoneNumber(String(resp._id), String(resp.phone));
                                // Refresh the data
                                const updatedResponses = await fetchVerificationResponsesByVerificationId(id);
                                setResponses(updatedResponses);
                                setToast({ type: 'success', message: 'Phone verification completed!' });
                              } catch {
                                setToast({ type: 'error', message: 'Phone verification failed!' });
                              }
                            }}
                          >
                            <FiPhone className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        </div>
                        <div><span className="font-semibold">Date of Birth:</span> {resp.dateOfBirth ? new Date(String(resp.dateOfBirth)).toLocaleDateString() : ''}</div>
                        <div><span className="font-semibold">Gender:</span> {String(resp.gender ?? '')}</div>
                        <div><span className="font-semibold">Address:</span> {String(resp.address ?? '')}</div>
                      </div>
                      {/* Phone Verification Result Display */}
                      {resp.phoneVerificationResult && (
                        <div className="mt-4 p-3 rounded bg-blue-50 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <FiPhone className="text-blue-500" />
                            <span className="font-semibold text-blue-800">Phone Verification Result</span>
                          </div>
                          <div className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Status:</span>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                resp.phoneVerificationStatus === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {resp.phoneVerificationStatus || 'Unknown'}
                              </span>
                            </div>
                            {resp.phoneVerificationDate && (
                              <div className="text-xs text-gray-600">
                                Verified on: {new Date(String(resp.phoneVerificationDate)).toLocaleString()}
                              </div>
                            )}
                            {resp.phoneVerificationResult && typeof resp.phoneVerificationResult === 'object' && 'originalPhone' in resp.phoneVerificationResult && resp.phoneVerificationResult.originalPhone && (
                              <div className="text-xs text-gray-600">
                                Original: {String(resp.phoneVerificationResult.originalPhone)}
                              </div>
                            )}
                            {resp.phoneVerificationResult && typeof resp.phoneVerificationResult === 'object' && 'finalPhone' in resp.phoneVerificationResult && resp.phoneVerificationResult.finalPhone && resp.phoneVerificationResult.finalPhone !== resp.phoneVerificationResult.originalPhone && (
                              <div className="text-xs text-blue-600">
                                Replaced with: {String(resp.phoneVerificationResult.finalPhone)}
                              </div>
                            )}
                            {resp.phoneVerificationResult && typeof resp.phoneVerificationResult === 'object' && 'error' in resp.phoneVerificationResult && resp.phoneVerificationResult.error && (
                              <div className="text-xs text-red-600 mt-1">
                                Error: {String(resp.phoneVerificationResult.error)}
                              </div>
                            )}
                            {/* Display verification details in a structured format */}
                            {resp.phoneVerificationResult && typeof resp.phoneVerificationResult === 'object' && (
                              <div className="mt-2 p-3 bg-white rounded border">
                                <div className="font-medium mb-2 text-blue-800">Verification Details:</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  {/* Status */}
                                  {resp.phoneVerificationResult.status && (
                                    <div>
                                      <span className="font-medium text-gray-600">API Status:</span>
                                      <span className={`ml-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                                        resp.phoneVerificationResult.status === 'success' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {String(resp.phoneVerificationResult.status)}
                                      </span>
                                    </div>
                                  )}
                                  
                                                                     {/* Entity Information */}
                                   {resp.phoneVerificationResult.entity && typeof resp.phoneVerificationResult.entity === 'object' && 'first_name' in resp.phoneVerificationResult.entity && (
                                     <>
                                       {resp.phoneVerificationResult.entity.first_name && (
                                         <div>
                                           <span className="font-medium text-gray-600">First Name:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.entity.first_name)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.entity.last_name && (
                                         <div>
                                           <span className="font-medium text-gray-600">Last Name:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.entity.last_name)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.entity.middle_name && (
                                         <div>
                                           <span className="font-medium text-gray-600">Middle Name:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.entity.middle_name)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.entity.date_of_birth && (
                                         <div>
                                           <span className="font-medium text-gray-600">Date of Birth:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.entity.date_of_birth)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.entity.gender && (
                                         <div>
                                           <span className="font-medium text-gray-600">Gender:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.entity.gender)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.entity.phone_number && (
                                         <div>
                                           <span className="font-medium text-gray-600">Verified Phone:</span>
                                           <span className="ml-2 text-blue-600 font-medium">{String(resp.phoneVerificationResult.entity.phone_number)}</span>
                                         </div>
                                       )}
                                     </>
                                   )}
                                  
                                                                     {/* Data Information (if different from entity) */}
                                   {resp.phoneVerificationResult.data && typeof resp.phoneVerificationResult.data === 'object' && resp.phoneVerificationResult.data.entity && typeof resp.phoneVerificationResult.data.entity === 'object' && 'first_name' in resp.phoneVerificationResult.data.entity && (
                                     <>
                                       {resp.phoneVerificationResult.data.entity.first_name && !resp.phoneVerificationResult.entity?.first_name && (
                                         <div>
                                           <span className="font-medium text-gray-600">First Name:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.data.entity.first_name)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.data.entity.last_name && !resp.phoneVerificationResult.entity?.last_name && (
                                         <div>
                                           <span className="font-medium text-gray-600">Last Name:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.data.entity.last_name)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.data.entity.middle_name && !resp.phoneVerificationResult.entity?.middle_name && (
                                         <div>
                                           <span className="font-medium text-gray-600">Middle Name:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.data.entity.middle_name)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.data.entity.date_of_birth && !resp.phoneVerificationResult.entity?.date_of_birth && (
                                         <div>
                                           <span className="font-medium text-gray-600">Date of Birth:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.data.entity.date_of_birth)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.data.entity.gender && !resp.phoneVerificationResult.entity?.gender && (
                                         <div>
                                           <span className="font-medium text-gray-600">Gender:</span>
                                           <span className="ml-2">{String(resp.phoneVerificationResult.data.entity.gender)}</span>
                                         </div>
                                       )}
                                       {resp.phoneVerificationResult.data.entity.phone_number && !resp.phoneVerificationResult.entity?.phone_number && (
                                         <div>
                                           <span className="font-medium text-gray-600">Verified Phone:</span>
                                           <span className="ml-2 text-blue-600 font-medium">{String(resp.phoneVerificationResult.data.entity.phone_number)}</span>
                                         </div>
                                       )}
                                     </>
                                   )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Personal Report Display */}
                    {(() => {
                      const report = resp.personalReport;
                      if (report && typeof report === 'object' && report !== null && ("status" in report)) {
                        const typedReport = report as Report;
                        return (
                          <div className="mb-2 p-3 rounded bg-blue-50 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2 mb-2 md:mb-0">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typedReport.status === 'approved' ? 'bg-green-100 text-green-700' : typedReport.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{typedReport.status}</span>
                              <span className="text-gray-700 font-medium">{typedReport.comment}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Reviewed by {typedReport.reviewedBy} on {typedReport.reviewedAt ? new Date(typedReport.reviewedAt).toLocaleString() : ''}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="flex md:justify-end mb-4 w-full">
                      <Button
                        size="sm"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 w-full md:w-auto"
                        onClick={() => setModal({ group: 'Personal', responseId: String(resp._id) })}
                      >
                        Provide Verification Report
                      </Button>
                    </div>
                    <div className="border-t my-6" />
                    {/* Employment Info */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <HiOfficeBuilding className="text-green-400 text-xl" />
                        <h3 className="text-lg font-semibold text-green-800 tracking-wide">Employment Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><span className="font-semibold">Status:</span> <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${resp.employmentStatus === 'Employed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{String(resp.employmentStatus ?? '')}</span></div>
                        <div><span className="font-semibold">Role:</span> {String(resp.roleInCompany ?? '')}</div>
                        <div><span className="font-semibold">Company Name:</span> {String(resp.companyName ?? '')}</div>
                        <div><span className="font-semibold">Company Address:</span> {String(resp.companyAddress ?? '')}</div>
                        <div><span className="font-semibold">Monthly Income:</span> {resp.monthlyIncome ? <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">₦{Number(resp.monthlyIncome).toLocaleString()}</span> : ''}</div>
                        <div><span className="font-semibold">Date Joined:</span> {String(resp.dateJoined ?? '')}</div>
                      </div>
                    </div>
                    {/* Employment Report Display */}
                    {resp.employmentReport && (() => {
                      const report = resp.employmentReport;
                      if (!report || typeof report !== 'object' || report === null || !("status" in report)) return null;
                      const typedReport = report as Report;
                      return (
                        <div className="mb-2 p-3 rounded bg-green-50 border border-green-100 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-2 mb-2 md:mb-0">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typedReport.status === 'approved' ? 'bg-green-100 text-green-700' : typedReport.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{typedReport.status}</span>
                            <span className="text-gray-700 font-medium">{typedReport.comment}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Reviewed by {typedReport.reviewedBy} on {typedReport.reviewedAt ? new Date(typedReport.reviewedAt).toLocaleString() : ''}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex md:justify-end mb-4 w-full">
                      <Button
                        size="sm"
                        className="bg-green-100 text-green-800 hover:bg-green-200 w-full md:w-auto"
                        onClick={() => setModal({ group: 'Employment', responseId: String(resp._id) })}
                      >
                        Provide Verification Report
                      </Button>
                    </div>
                    <div className="border-t my-6" />
                    {/* Guarantor Info */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <HiUserGroup className="text-purple-400 text-xl" />
                        <h3 className="text-lg font-semibold text-purple-800 tracking-wide">Guarantor Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><span className="font-semibold">First Name:</span> {String(resp.guarantorFirstName ?? '')}</div>
                        <div><span className="font-semibold">Last Name:</span> {String(resp.guarantorLastName ?? '')}</div>
                        <div><span className="font-semibold">Phone:</span> {String(resp.guarantorPhone ?? '')}</div>
                        <div><span className="font-semibold">Email:</span> {String(resp.guarantorEmail ?? '')}</div>
                        <div><span className="font-semibold">Address:</span> {String(resp.guarantorAddress ?? '')}</div>
                        <div><span className="font-semibold">Employment Status:</span> {String(resp.guarantorEmploymentStatus ?? '')}</div>
                        <div><span className="font-semibold">Company:</span> {String(resp.guarantorCompany ?? '')}</div>
                        <div><span className="font-semibold">Relationship:</span> {String(resp.guarantorRelationship ?? '')}</div>
                      </div>
                    </div>
                    {/* Guarantor Report Display */}
                    {resp.guarantorReport && (() => {
                      const report = resp.guarantorReport;
                      if (!report || typeof report !== 'object' || report === null || !("status" in report)) return null;
                      const typedReport = report as Report;
                      return (
                        <div className="mb-2 p-3 rounded bg-purple-50 border border-purple-100 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-2 mb-2 md:mb-0">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typedReport.status === 'approved' ? 'bg-green-100 text-green-700' : typedReport.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{typedReport.status}</span>
                            <span className="text-gray-700 font-medium">{typedReport.comment}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Reviewed by {typedReport.reviewedBy} on {typedReport.reviewedAt ? new Date(typedReport.reviewedAt).toLocaleString() : ''}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex md:justify-end mb-4 w-full">
                      <Button
                        size="sm"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-200 w-full md:w-auto"
                        onClick={() => setModal({ group: 'Guarantor', responseId: String(resp._id) })}
                      >
                        Provide Verification Report
                      </Button>
                    </div>
                    <div className="border-t my-6" />
                    {/* Documents */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <FaRegAddressCard className="text-pink-400 text-xl" />
                        <h3 className="text-lg font-semibold text-pink-800 tracking-wide">Documents</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <span className="font-semibold">Bank Statement:</span>{' '}
                          {resp.bankStatementUrl ? (
                            <a href={String(resp.bankStatementUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition-colors">View</a>
                          ) : 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Utility Bill:</span>{' '}
                          {resp.utilityBillUrl ? (
                            <a href={String(resp.utilityBillUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition-colors">View</a>
                          ) : 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">ID Document:</span>{' '}
                          {resp.identificationDocumentUrl ? (
                            <a href={String(resp.identificationDocumentUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition-colors">View</a>
                          ) : 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">ID Type:</span> {String(resp.identificationDocumentType ?? '')}
                        </div>
                      </div>
                    </div>
                    {/* Documents Report Display */}
                    {resp.documentsReport && (() => {
                      const report = resp.documentsReport;
                      if (!report || typeof report !== 'object' || report === null || !("status" in report)) return null;
                      const typedReport = report as Report;
                      return (
                        <div className="mb-2 p-3 rounded bg-pink-50 border border-pink-100 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-2 mb-2 md:mb-0">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typedReport.status === 'approved' ? 'bg-green-100 text-green-700' : typedReport.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{typedReport.status}</span>
                            <span className="text-gray-700 font-medium">{typedReport.comment}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Reviewed by {typedReport.reviewedBy} on {typedReport.reviewedAt ? new Date(typedReport.reviewedAt).toLocaleString() : ''}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex md:justify-end mb-4 w-full">
                      <Button
                        size="sm"
                        className="bg-pink-100 text-pink-800 hover:bg-pink-200 w-full md:w-auto"
                        onClick={() => setModal({ group: 'Documents', responseId: String(resp._id) })}
                      >
                        Provide Verification Report
                      </Button>
                    </div>
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-8 text-xs text-gray-500 mt-2">
                      <div>Created: {resp.createdAt ? new Date(String(resp.createdAt)).toLocaleString() : ''}</div>
                      <div>Updated: {resp.updatedAt ? new Date(String(resp.updatedAt)).toLocaleString() : ''}</div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                aria-label="Approve Verification"
                onClick={() => setConfirmAction('approve')}
                disabled={actionLoading}
              >
                Approve
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                aria-label="Reject Verification"
                onClick={() => setConfirmAction('reject')}
                disabled={actionLoading}
              >
                Reject
              </Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                aria-label="Request More Info"
                onClick={() => setConfirmAction('request-info')}
                disabled={actionLoading}
              >
                Request More Info
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
              <div className="text-lg font-semibold mb-4">Confirm {confirmAction.replace('-', ' ')}</div>
              <div className="mb-6">Are you sure you want to {confirmAction.replace('-', ' ')} this verification?</div>
              <div className="flex justify-end gap-4">
                <Button onClick={() => setConfirmAction(null)} variant="outline" aria-label="Cancel">Cancel</Button>
                <Button
                  onClick={() => handleAction(confirmAction)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={actionLoading}
                  aria-label={`Confirm ${confirmAction.replace('-', ' ')}`}
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Toast */}
        {toast && (
          <div
            className={`fixed left-1/2 transform -translate-x-1/2 bottom-8 px-6 py-3 rounded shadow-lg text-white z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
            role="alert"
          >
            {toast.message}
          </div>
        )}
        {/* Report Modal */}
        <ReportModal
          open={!!modal}
          onClose={() => setModal(null)}
          onSubmit={handleReportSubmit}
          group={modal?.group || ''}
          loading={modalLoading}
        />
      </div>
    </AdminSidebarLayout>
  );
};

// Helper for modal
const ReportModal = ({
  open,
  onClose,
  onSubmit,
  group,
  loading,
  defaultStatus = 'pending',
  defaultComment = '',
}: ReportModalProps) => {
  const [status, setStatus] = useState(defaultStatus);
  const [comment, setComment] = useState(defaultComment);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Provide {group} Verification Report</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ status, comment });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
            >
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Comment</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[80px]"
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose} aria-label="Cancel">Cancel</Button>
            <Button type="submit" disabled={loading} aria-label="Submit Report">
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationDetailsPage; 