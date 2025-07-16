'use client';
import { useState } from 'react';
import { verificationService, Verification, VerificationListQuery, VerificationListResponse, NinParams, BvnParams, PhoneParams, DlParams, VinParams, ByEmailParams, EmploymentPayload, GuarantorPayload, AffordabilityPayload, AmlPayload, TenantVerificationPayload, CreateVerificationPayload, VerificationResponse } from '../services/verificationService';

export const useVerifications = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<unknown>(null);

  const listVerifications = async (params?: VerificationListQuery): Promise<VerificationListResponse> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.list(params || {});
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getVerificationById = async (id: string): Promise<Verification> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.getById(id);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyNIN = async (params: NinParams): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.verifyNIN(params);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyBVN = async (params: BvnParams): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.verifyBVN(params);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async (params: PhoneParams): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.verifyPhone(params);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyDL = async (params: DlParams): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.verifyDL(params);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyVIN = async (params: VinParams): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.verifyVIN(params);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmployment = async (id: string, data: EmploymentPayload): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.verifyEmployment(id, data);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyGuarantor = async (id: string, data: GuarantorPayload): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.verifyGuarantor(id, data);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyAffordability = async (id: string, data: AffordabilityPayload): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.verifyAffordability(id, data);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const amlScreening = async (data: AmlPayload): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.amlScreening(data);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getResponse = async (id: string): Promise<VerificationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.getResponse(id);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getResponseByUser = async (userId: string): Promise<VerificationResponse[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.getResponseByUser(userId);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getResponseByRequest = async (verificationId: string): Promise<VerificationResponse[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.getResponseByRequest(verificationId);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStatuses = async (): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.getStatuses();
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getByEmail = async (params: ByEmailParams): Promise<Verification> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.getByEmail(params);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTenantVerification = async (data: TenantVerificationPayload): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.createTenantVerification(data);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createVerification = async (data: CreateVerificationPayload): Promise<unknown> => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.create(data);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    listVerifications,
    getVerificationById,
    verifyNIN,
    verifyBVN,
    verifyPhone,
    verifyDL,
    verifyVIN,
    verifyEmployment,
    verifyGuarantor,
    verifyAffordability,
    amlScreening,
    getResponse,
    getResponseByUser,
    getResponseByRequest,
    getStatuses,
    getByEmail,
    createTenantVerification,
    createVerification,
  };
}; 