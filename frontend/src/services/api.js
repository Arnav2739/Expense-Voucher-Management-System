const BASE_URL = '';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Authentication
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getDemoAccounts: async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo-accounts`);
    return handleResponse(res);
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Vouchers
  getVouchers: async (filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${BASE_URL}/api/vouchers${queryString}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getVoucher: async (id) => {
    const res = await fetch(`${BASE_URL}/api/vouchers/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createVoucher: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/vouchers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  updateVoucher: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/api/vouchers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  deleteVoucher: async (id) => {
    const res = await fetch(`${BASE_URL}/api/vouchers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  submitVoucher: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/api/vouchers/${id}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  approveVoucher: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/api/vouchers/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  rejectVoucher: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/api/vouchers/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  uploadSignature: async (fileOrFormData) => {
    let body;
    let isMultipart = false;
    let headers = {};

    if (fileOrFormData instanceof FormData) {
      body = fileOrFormData;
      isMultipart = true;
      headers = getHeaders(true);
    } else if (fileOrFormData instanceof File) {
      body = new FormData();
      body.append('signature', fileOrFormData);
      isMultipart = true;
      headers = getHeaders(true);
    } else if (typeof fileOrFormData === 'string') {
      // Base64 data URL
      body = JSON.stringify({ signatureData: fileOrFormData });
      headers = getHeaders(false);
    }

    const res = await fetch(`${BASE_URL}/api/vouchers/upload-signature`, {
      method: 'POST',
      headers,
      body,
    });
    return handleResponse(res);
  },
};
