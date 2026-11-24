import api from './axios';

export type PlatformSettings = {
  key?: string;
  shortletSignupBonusCredits?: number;
};

export const fetchPlatformSettings = async (): Promise<PlatformSettings> => {
  const response = await api.get<{ status: string; data: PlatformSettings }>(
    '/platform-settings',
  );
  return response.data.data;
};

export const updatePlatformSettings = async (
  shortletSignupBonusCredits: number,
): Promise<PlatformSettings> => {
  const response = await api.patch<{ status: string; data: PlatformSettings }>(
    '/platform-settings',
    { shortletSignupBonusCredits },
  );
  return response.data.data;
};
