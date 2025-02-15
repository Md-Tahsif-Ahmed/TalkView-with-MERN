import axios from 'axios';
import { useEffect, useState } from 'react';

const BASE_URL = import.meta.env.VITE_APP_PROD_BACKEND_URL;

if (!BASE_URL) throw new Error('Missing backend URL');

function useProfile({ onid, user }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get(
          `${BASE_URL}/api/social/get_profile?onid=${onid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setProfile(response.data);
      } catch (err) {
        console.error(err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    };

    if (onid) {
      fetchProfile();
    }
  }, [onid]);

  return profile;
}

export default useProfile;
