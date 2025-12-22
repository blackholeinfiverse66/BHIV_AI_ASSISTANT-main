const RAW = import.meta.env.VITE_API_BASE_URL;

if (!RAW) {
  throw new Error('VITE_API_BASE_URL is missing');
}

const BASE = RAW.replace(/\/+$/, '');

export const bhivApi = {
  summarize: `${BASE}/api/summarize`,
};
