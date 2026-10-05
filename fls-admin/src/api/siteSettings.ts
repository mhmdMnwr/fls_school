import { api } from '@/lib/api';
import { SiteSettings } from '@/types/api';

export const siteSettingsApi = {
  getSiteSettings: async () => {
    const res = await api.get<SiteSettings>('/settings/site');
    return res.data;
  },
  updateSiteSettings: async (data: Partial<SiteSettings>) => {
    const res = await api.patch<SiteSettings>('/settings/site', data);
    return res.data;
  },
};
