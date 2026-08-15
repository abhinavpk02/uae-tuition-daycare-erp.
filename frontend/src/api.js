// API Utility module for UAE Tuition & Daycare ERP
const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Production default target: https://daycare-portal.vercel.app or local port 3000 proxy
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://daycare-portal.vercel.app';
  }
  return 'http://localhost:3000';
};

export const BASE_URL = getBaseUrl().replace(/\/$/, '');

/**
 * Submits a new student registration to the backend database via POST /api/v1/students
 * @param {Object} studentData
 * @returns {Promise<Object>} Backend confirmation response
 */
export async function submitNewStudent(studentData) {
  const endpoint = `${BASE_URL}/api/v1/students`;
  
  const payload = {
    name: studentData.name,
    standard: studentData.standard || studentData.grade || 'Grade 10',
    program: studentData.program || 'Both',
    parent_phone: studentData.parent_phone || studentData.phone || '+971 50 123 4567',
    parent_email: studentData.parent_email || studentData.email || 'parent@uaeerp.ae',
    dob: studentData.dob || '2012-05-14',
    creator_role: studentData.creator_role || 'SuperAdmin'
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || `API Error (${response.status})`);
  }

  return data;
}
