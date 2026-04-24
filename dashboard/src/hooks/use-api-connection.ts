import { useEffect, useState } from 'react';

export function useAPIConnection() {
  const [connected, setConnected] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${apiUrl}/health`, {
          mode: 'cors',
          credentials: 'omit',
        });
        setConnected(response.ok);
      } catch {
        setConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, [apiUrl]);

  return { connected, apiUrl };
}
