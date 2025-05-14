import { useEffect, useState } from 'react';

export function useBasePath() {
  const [basePath, setBasePath] = useState('');
  
  useEffect(() => {
    // En el cliente, podemos acceder a la variable de entorno
    setBasePath(process.env.NEXT_PUBLIC_BASE_PATH || '');
  }, []);
  
  return basePath;
}