const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_BACKEND_URL is not set. Provide it in the frontend environment.');
}

export const api = {
  // Authentication endpoints
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      return data;
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    getToken: () => {
      return localStorage.getItem('token');
    },

    setToken: (token) => {
      localStorage.setItem('token', token);
    },

    getUser: () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },

    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
    },

    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    },
  },
  magicLinks: {
    validate: async (token) => {
      const response = await fetch(`${API_BASE_URL}/api/magic-links/validate/${token}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Invalid or expired link');
      }

      return response.json();
    },
  },

  users: {
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load users');
      }

      return response.json();
    },

    getById: async (userId) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load user');
      }

      return response.json();
    },

    create: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create user');
      }

      return response.json();
    },

    update: async (userId, payload) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update user');
      }

      return response.json();
    },
  },

  colleges: {
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/college`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load colleges');
      }

      return response.json();
    },
  },
  questions: {
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load questions');
      }

      return response.json();
    },

    findActive: async () => {
      const response = await fetch(`${API_BASE_URL}/api/questions/active`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load active questions');
      }

      return response.json();
    },

    findWithSections: async () => {
      const response = await fetch(`${API_BASE_URL}/api/questions/with-sections`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load questions with sections');
      }

      return response.json();
    },

    create: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create question');
      }

      return response.json();
    },

    update: async (questionId, payload) => {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update question');
      }

      return response.json();
    },
    delete: async (questionId) => {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete question');
      }

      return response.json().catch(() => ({}));
    },
  },
  evaluationCycles: {
    create: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-cycles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create evaluation cycle');
      }

      return response.json();
    },
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-cycles`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load evaluation cycles');
      }

      return response.json();
    },
    assignFaculty: async (cycleId, facultyIds) => {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-cycles/${cycleId}/assign-faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ faculty_ids: facultyIds }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to assign faculty to cycle');
      }

      return response.json();
    },
    getAssignedFaculty: async (cycleId) => {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-cycles/${cycleId}/faculty`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load assigned faculty');
      }

      return response.json();
    },
    getProgress: async (cycleId) => {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-cycles/${cycleId}/progress`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load cycle progress');
      }

      return response.json();
    },
    remindEvaluators: async (cycleId, evaluateeId) => {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-cycles/${cycleId}/members/${evaluateeId}/remind`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to send reminders');
      }

      return response.json();
    },
    startForms: async (cycleId) => {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-cycles/${cycleId}/start-forms`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to start forms');
      }

      return response.json();
    },
    finalizeQuestions: async (cycleId) => {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-cycles/${cycleId}/finalize-questions`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to finalize questions');
      }

      return response.json();
    },
  },
  nominations: {
    getPendingApproval: async () => {
      const response = await fetch(`${API_BASE_URL}/api/nominations/pending-approval`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load nominations');
      }

      return response.json();
    },
    review: async (decisions) => {
      const response = await fetch(`${API_BASE_URL}/api/nominations/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(decisions),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to review nominations');
      }

      return response.json();
    },
    submit: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/api/nominations/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to submit nominations');
      }

      return response.json();
    },
  },
  questionSections: {
    listAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/question-sections`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load question sections');
      }

      return response.json();
    },
    create: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/api/question-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create question section');
      }

      return response.json();
    },
  },
  evaluations: {
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/api/evaluations/${id}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load evaluation details');
      }

      return response.json();
    },
  },
  answers: {
    submit: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/api/answers/submit-evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to submit evaluation answers');
      }

      return response.json();
    },
  },
  evaluationSummaries: {
    getPdf: async (summaryId) => {
      const response = await fetch(`${API_BASE_URL}/api/pdf-services/evaluation-summary/${summaryId}/pdf`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load PDF');
      }

      return response.blob();
    },
  },
};

// Helper function to add auth token to requests
export const getAuthHeaders = () => {
  const token = api.auth.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const parseJwt = (token) => {
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};
