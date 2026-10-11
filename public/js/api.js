/**
 * Centralized API Client Wrapper with Credentials and Error Handling
 */
const API = {
  async get(endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error(`API GET ${endpoint} Error:`, error);
      return { success: false, message: error.message };
    }
  },

  async post(endpoint, data = {}) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(`API POST ${endpoint} Error:`, error);
      return { success: false, message: error.message };
    }
  },

  async patch(endpoint, data = {}) {
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(`API PATCH ${endpoint} Error:`, error);
      return { success: false, message: error.message };
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error(`API DELETE ${endpoint} Error:`, error);
      return { success: false, message: error.message };
    }
  }
};

window.API = API;
