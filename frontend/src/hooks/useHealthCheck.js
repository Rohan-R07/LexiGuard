import { useState, useEffect } from 'react';
import { getHealth } from '../services/api';

/**
 * Custom hook to verify backend API connectivity on load.
 */
export function useHealthCheck() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [serviceInfo, setServiceInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkBackend() {
      try {
        const data = await getHealth();
        if (isMounted) {
          if (data && data.status === 'ok') {
            setStatus('connected');
            setServiceInfo(data);
          } else {
            setStatus('disconnected');
          }
        }
      } catch (err) {
        if (isMounted) {
          setStatus('disconnected');
        }
      }
    }

    checkBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  return { status, serviceInfo };
}
