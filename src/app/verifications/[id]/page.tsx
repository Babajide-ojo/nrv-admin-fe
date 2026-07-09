'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchVerificationById, fetchVerificationResponsesByVerificationId, Verification, verifyPhoneNumber, verifyNin } from '../../../lib/api/verifications';
import { Button } from '@/components/ui/button';
import { HiUser, HiOfficeBuilding, HiUserGroup, HiDocumentText, HiArrowLeft } from 'react-icons/hi';
import { FaRegAddressCard } from 'react-icons/fa';
import { FiPhone, FiHash } from 'react-icons/fi';
import {
  updatePersonalReport,
  updateEmploymentReport,
  updateGuarantorReport,
  updateDocumentsReport,
  updateVerification,
} from '../../../lib/api/verifications';

// Reusable UI bits for consistent verification detail layout
const InfoRow = ({ label, value, valueClassName = 'text-gray-900' }: { label: string; value: React.ReactNode; valueClassName?: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-sm font-medium text-gray-500 shrink-0 sm:w-36">{label}</span>
    <span className={`text-sm ${valueClassName}`}>{value ?? '—'}</span>
  </div>
);

const SectionHeader = ({ icon: Icon, title, iconClassName = 'text-slate-500' }: { icon: React.ElementType; title: string; iconClassName?: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`p-2 rounded-lg bg-slate-100 ${iconClassName}`}>
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
  </div>
);

const StatusBadge = ({ status, className = '' }: { status: string; className?: string }) => {
  const s = String(status).toLowerCase();
  const styles = s === 'approved' || s === 'completed' || s === 'success'
    ? 'bg-emerald-100 text-emerald-800'
    : s === 'rejected'
    ? 'bg-red-100 text-red-800'
    : 'bg-amber-100 text-amber-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles} ${className}`}>
      {status}
    </span>
  );
};

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-6 ${className}`}>{children}</div>
);

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
  const router = useRouter();
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
    if (!id) return;
    setActionLoading(true);
    try {
      const statusMap = {
        approve: 'approved' as const,
        reject: 'rejected' as const,
        'request-info': 'pending' as const,
      };
      const newStatus = statusMap[action];
      const updated = await updateVerification(id, { status: newStatus });
      setVerification(prev => (prev ? { ...prev, status: updated?.status ?? newStatus } : prev));
      setToast({
        type: 'success',
        message: action === 'request-info'
          ? 'Verification set back to pending. Applicant can be requested to provide more info.'
          : `Verification ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setConfirmAction(null);
    } catch {
      setToast({ type: 'error', message: `Failed to ${action === 'approve' ? 'approve' : action === 'reject' ? 'reject' : 'update'} verification.` });
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
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 -ml-1" onClick={() => router.back()}>
            <HiArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <Card className="mb-8 shadow-sm border border-slate-200 bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800">
                <div className="p-2 rounded-lg bg-blue-100">
                  <HiDocumentText className="w-5 h-5 text-blue-600" />
                </div>
                Verification Responses
              </CardTitle>
              <StatusBadge status={verification?.status ?? 'pending'} />
            </div>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-gray-500">No responses available.</div>
            ) : (
              <div className="space-y-10">
                {responses.map((resp, idx) => (
                  <div key={String(resp._id ?? idx)} className="rounded-2xl bg-white shadow-lg p-8 border border-slate-100 hover:shadow-2xl transition-shadow duration-200">
                    {/* Personal Info */}
                    <SectionCard className="mb-6">
                      <SectionHeader icon={HiUser} title="Personal Information" iconClassName="text-blue-500" />
                      <div className="space-y-0 divide-y divide-slate-100">
                        <InfoRow label="Full Name" value={String(resp.fullName ?? '')} />
                        <InfoRow label="Email" value={String(resp.email ?? '')} />
                        <InfoRow
                          label="NIN"
                          value={
                            <span className="flex flex-wrap items-center gap-2">
                              <span>
                                {(resp as { nin?: string }).nin != null && String((resp as { nin?: string }).nin).trim()
                                  ? "On file (redacted)"
                                  : "—"}
                              </span>
                              {(resp as { nin?: string }).nin &&
                                (resp as { nin?: string }).nin !== "On file (redacted)" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                  onClick={async () => {
                                    try {
                                      await verifyNin(String(resp._id), String((resp as { nin?: string }).nin));
                                      const updatedResponses = await fetchVerificationResponsesByVerificationId(id);
                                      setResponses(updatedResponses);
                                      setToast({ type: 'success', message: 'NIN verification completed!' });
                                    } catch {
                                      setToast({ type: 'error', message: 'NIN verification failed!' });
                                    }
                                  }}
                                >
                                  <FiHash className="w-4 h-4 mr-1" />
                                  Verify NIN
                                </Button>
                              )}
                            </span>
                          }
                        />
                        {resp.phone != null && resp.phone !== '' && (
                          <InfoRow label="Phone" value={String(resp.phone)} />
                        )}
                        <InfoRow label="Date of Birth" value={resp.dateOfBirth ? new Date(String(resp.dateOfBirth)).toLocaleDateString() : ''} />
                        <InfoRow label="Gender" value={String(resp.gender ?? '')} />
                        <InfoRow label="Address" value={String(resp.address ?? '')} />
                      </div>
                      {/* NIN Verification Result Display */}
                      {(resp as { ninVerificationResult?: Record<string, unknown>; ninVerificationStatus?: string; ninVerificationDate?: string | Date }).ninVerificationResult && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                          <SectionHeader icon={FiHash} title="NIN Verification Result" iconClassName="text-blue-500" />
                          <div className="space-y-0 divide-y divide-slate-100">
                            <InfoRow label="Status" value={<StatusBadge status={String((resp as { ninVerificationStatus?: string }).ninVerificationStatus || 'Unknown')} />} />
                            {(resp as { ninVerificationDate?: string | Date }).ninVerificationDate && (
                              <InfoRow label="Verified on" value={new Date(String((resp as { ninVerificationDate?: string | Date }).ninVerificationDate)).toLocaleString()} />
                            )}
                            {(() => {
                              const nr = (resp as { ninVerificationResult?: Record<string, unknown> }).ninVerificationResult;
                              if (!nr || typeof nr !== "object") return null;
                              return (
                                <>
                                  {typeof nr.namesMatch === "boolean" && (
                                    <InfoRow
                                      label="Name match"
                                      value={nr.namesMatch ? "Yes" : "No"}
                                    />
                                  )}
                                  {typeof nr.dobMatch === "boolean" && (
                                    <InfoRow label="DOB match" value={nr.dobMatch ? "Yes" : "No"} />
                                  )}
                                </>
                              );
                            })()}
                            {(() => {
                              const nr = (resp as { ninVerificationResult?: Record<string, unknown> }).ninVerificationResult;
                              if (!nr || typeof nr !== 'object' || nr.error == null) return null;
                              return <InfoRow label="Error" value="Verification failed — details redacted" valueClassName="text-red-600" />;
                            })()}
                          </div>
                        </div>
                      )}
                      {/* Phone Verification Result Display (legacy) */}
                      {resp.phoneVerificationResult && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                          <SectionHeader icon={FiPhone} title="Phone Verification Result" iconClassName="text-blue-500" />
                          <div className="space-y-0 divide-y divide-slate-100">
                            <InfoRow label="Status" value={<StatusBadge status={resp.phoneVerificationStatus || 'Unknown'} />} />
                            {resp.phoneVerificationDate && (
                              <InfoRow label="Verified on" value={new Date(String(resp.phoneVerificationDate)).toLocaleString()} />
                            )}
                            {resp.phoneVerificationResult && typeof resp.phoneVerificationResult === 'object' && 'originalPhone' in resp.phoneVerificationResult && resp.phoneVerificationResult.originalPhone && (
                              <InfoRow label="Original" value={String(resp.phoneVerificationResult.originalPhone)} valueClassName="text-slate-600" />
                            )}
                            {resp.phoneVerificationResult && typeof resp.phoneVerificationResult === 'object' && 'finalPhone' in resp.phoneVerificationResult && resp.phoneVerificationResult.finalPhone && resp.phoneVerificationResult.finalPhone !== resp.phoneVerificationResult.originalPhone && (
                              <InfoRow label="Replaced with" value={String(resp.phoneVerificationResult.finalPhone)} valueClassName="text-blue-600 font-medium" />
                            )}
                            {resp.phoneVerificationResult && typeof resp.phoneVerificationResult === 'object' && 'error' in resp.phoneVerificationResult && resp.phoneVerificationResult.error && (
                              <InfoRow label="Error" value={String(resp.phoneVerificationResult.error)} valueClassName="text-red-600" />
                            )}
                          </div>
                          {resp.phoneVerificationResult && typeof resp.phoneVerificationResult === 'object' && (
                            <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="text-sm font-semibold text-slate-700 mb-3">Verification Details</div>
                              <div className="space-y-0 divide-y divide-slate-200">
                                {resp.phoneVerificationResult.status && (
                                  <InfoRow label="API Status" value={<StatusBadge status={String(resp.phoneVerificationResult.status)} />} />
                                )}
                                {resp.phoneVerificationResult.entity && typeof resp.phoneVerificationResult.entity === 'object' && 'first_name' in resp.phoneVerificationResult.entity && (
                                  <>
                                    {resp.phoneVerificationResult.entity.first_name && <InfoRow label="First Name" value={String(resp.phoneVerificationResult.entity.first_name)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.entity.last_name && <InfoRow label="Last Name" value={String(resp.phoneVerificationResult.entity.last_name)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.entity.middle_name && <InfoRow label="Middle Name" value={String(resp.phoneVerificationResult.entity.middle_name)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.entity.date_of_birth && <InfoRow label="Date of Birth" value={String(resp.phoneVerificationResult.entity.date_of_birth)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.entity.gender && <InfoRow label="Gender" value={String(resp.phoneVerificationResult.entity.gender)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.entity.phone_number && <InfoRow label="Verified Phone" value={String(resp.phoneVerificationResult.entity.phone_number)} valueClassName="text-blue-600 font-medium" />}
                                  </>
                                )}
                                {resp.phoneVerificationResult.data && typeof resp.phoneVerificationResult.data === 'object' && resp.phoneVerificationResult.data.entity && typeof resp.phoneVerificationResult.data.entity === 'object' && 'first_name' in resp.phoneVerificationResult.data.entity && (
                                  <>
                                    {resp.phoneVerificationResult.data.entity.first_name && !resp.phoneVerificationResult.entity?.first_name && <InfoRow label="First Name" value={String(resp.phoneVerificationResult.data.entity.first_name)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.data.entity.last_name && !resp.phoneVerificationResult.entity?.last_name && <InfoRow label="Last Name" value={String(resp.phoneVerificationResult.data.entity.last_name)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.data.entity.middle_name && !resp.phoneVerificationResult.entity?.middle_name && <InfoRow label="Middle Name" value={String(resp.phoneVerificationResult.data.entity.middle_name)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.data.entity.date_of_birth && !resp.phoneVerificationResult.entity?.date_of_birth && <InfoRow label="Date of Birth" value={String(resp.phoneVerificationResult.data.entity.date_of_birth)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.data.entity.gender && !resp.phoneVerificationResult.entity?.gender && <InfoRow label="Gender" value={String(resp.phoneVerificationResult.data.entity.gender)} valueClassName="text-slate-700" />}
                                    {resp.phoneVerificationResult.data.entity.phone_number && !resp.phoneVerificationResult.entity?.phone_number && <InfoRow label="Verified Phone" value={String(resp.phoneVerificationResult.data.entity.phone_number)} valueClassName="text-blue-600 font-medium" />}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    {/* Personal Report Display */}
                    {(() => {
                      const report = resp.personalReport;
                      if (report && typeof report === 'object' && report !== null && ('status' in report)) {
                        const typedReport = report as Report;
                        return (
                          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={typedReport.status} />
                              <span className="text-slate-700 font-medium">{typedReport.comment}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Reviewed by {typedReport.reviewedBy} on {typedReport.reviewedAt ? new Date(typedReport.reviewedAt).toLocaleString() : ''}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="flex md:justify-end mt-4 w-full">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                        onClick={() => setModal({ group: 'Personal', responseId: String(resp._id) })}
                      >
                        Provide Verification Report
                      </Button>
                    </div>
                  </SectionCard>

                  {/* Employment Info */}
                  <SectionCard className="mb-6">
                    <SectionHeader icon={HiOfficeBuilding} title="Employment Information" iconClassName="text-emerald-500" />
                    <div className="space-y-0 divide-y divide-slate-100">
                      <InfoRow label="Status" value={<StatusBadge status={String(resp.employmentStatus ?? '')} />} />
                      <InfoRow label="Role" value={String(resp.roleInCompany ?? '')} />
                      <InfoRow label="Company Name" value={String(resp.companyName ?? '')} />
                      <InfoRow label="Company Address" value={String(resp.companyAddress ?? '')} />
                      <InfoRow label="Monthly Income" value={resp.monthlyIncome ? <span className="font-medium text-emerald-700">₦{Number(resp.monthlyIncome).toLocaleString()}</span> : undefined} />
                      <InfoRow label="Date Joined" value={String(resp.dateJoined ?? '')} />
                    </div>
                    {resp.employmentReport && (() => {
                      const report = resp.employmentReport;
                      if (!report || typeof report !== 'object' || report === null || !('status' in report)) return null;
                      const typedReport = report as Report;
                      return (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={typedReport.status} />
                            <span className="text-slate-700 font-medium">{typedReport.comment}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Reviewed by {typedReport.reviewedBy} on {typedReport.reviewedAt ? new Date(typedReport.reviewedAt).toLocaleString() : ''}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex md:justify-end mt-4 w-full">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto"
                        onClick={() => setModal({ group: 'Employment', responseId: String(resp._id) })}
                      >
                        Provide Verification Report
                      </Button>
                    </div>
                  </SectionCard>

                  {/* Guarantor Info */}
                  <SectionCard className="mb-6">
                    <SectionHeader icon={HiUserGroup} title="Guarantor Information" iconClassName="text-violet-500" />
                    <div className="space-y-0 divide-y divide-slate-100">
                      <InfoRow label="First Name" value={String(resp.guarantorFirstName ?? '')} />
                      <InfoRow label="Last Name" value={String(resp.guarantorLastName ?? '')} />
                      <InfoRow label="Phone" value={String(resp.guarantorPhone ?? '')} />
                      <InfoRow label="Email" value={String(resp.guarantorEmail ?? '')} />
                      <InfoRow label="Address" value={String(resp.guarantorAddress ?? '')} />
                      <InfoRow label="Employment Status" value={String(resp.guarantorEmploymentStatus ?? '')} />
                      <InfoRow label="Company" value={String(resp.guarantorCompany ?? '')} />
                      <InfoRow label="Relationship" value={String(resp.guarantorRelationship ?? '')} />
                    </div>
                    {resp.guarantorReport && (() => {
                      const report = resp.guarantorReport;
                      if (!report || typeof report !== 'object' || report === null || !('status' in report)) return null;
                      const typedReport = report as Report;
                      return (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={typedReport.status} />
                            <span className="text-slate-700 font-medium">{typedReport.comment}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Reviewed by {typedReport.reviewedBy} on {typedReport.reviewedAt ? new Date(typedReport.reviewedAt).toLocaleString() : ''}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex md:justify-end mt-4 w-full">
                      <Button
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white w-full md:w-auto"
                        onClick={() => setModal({ group: 'Guarantor', responseId: String(resp._id) })}
                      >
                        Provide Verification Report
                      </Button>
                    </div>
                  </SectionCard>

                  {/* Documents */}
                  <SectionCard className="mb-6">
                    <SectionHeader icon={FaRegAddressCard} title="Documents" iconClassName="text-rose-500" />
                    <div className="space-y-0 divide-y divide-slate-100">
                      <InfoRow
                        label="Bank Statement"
                        value={resp.bankStatementUrl ? (
                          <a href={String(resp.bankStatementUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">View</a>
                        ) : undefined}
                      />
                      <InfoRow
                        label="Utility Bill"
                        value={resp.utilityBillUrl ? (
                          <a href={String(resp.utilityBillUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">View</a>
                        ) : undefined}
                      />
                      <InfoRow
                        label="ID Document"
                        value={resp.identificationDocumentUrl ? (
                          <a href={String(resp.identificationDocumentUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">View</a>
                        ) : undefined}
                      />
                      <InfoRow label="ID Type" value={String(resp.identificationDocumentType ?? '')} />
                    </div>
                    {resp.documentsReport && (() => {
                      const report = resp.documentsReport;
                      if (!report || typeof report !== 'object' || report === null || !('status' in report)) return null;
                      const typedReport = report as Report;
                      return (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={typedReport.status} />
                            <span className="text-slate-700 font-medium">{typedReport.comment}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Reviewed by {typedReport.reviewedBy} on {typedReport.reviewedAt ? new Date(typedReport.reviewedAt).toLocaleString() : ''}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex md:justify-end mt-4 w-full">
                      <Button
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700 text-white w-full md:w-auto"
                        onClick={() => setModal({ group: 'Documents', responseId: String(resp._id) })}
                      >
                        Provide Verification Report
                      </Button>
                    </div>
                  </SectionCard>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-6 text-xs text-slate-500 py-2">
                    <span>Created: {resp.createdAt ? new Date(String(resp.createdAt)).toLocaleString() : '—'}</span>
                    <span>Updated: {resp.updatedAt ? new Date(String(resp.updatedAt)).toLocaleString() : '—'}</span>
                  </div>

                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                aria-label="Approve Verification"
                onClick={() => setConfirmAction('approve')}
                disabled={actionLoading}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                aria-label="Reject Verification"
                onClick={() => setConfirmAction('reject')}
                disabled={actionLoading}
              >
                Reject
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Provide {group} Verification Report</h2>
          <p className="text-sm text-slate-500 mt-0.5">Set the verification outcome and add a comment.</p>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ status, comment });
          }}
          className="p-6 space-y-5"
        >
          <div className="space-y-2">
            <label htmlFor="report-status" className="block text-sm font-medium text-slate-700">Status</label>
            <select
              id="report-status"
              className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
            >
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="report-comment" className="block text-sm font-medium text-slate-700">Comment</label>
            <textarea
              id="report-comment"
              className="w-full min-h-[100px] resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="e.g. Details verified; documents match records."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} aria-label="Cancel" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} aria-label="Submit Report" className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationDetailsPage; 