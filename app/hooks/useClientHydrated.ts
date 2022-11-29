import { useEffect, useState } from "react";

let clientHydrating = true;

export function useClientHydrated() {
  const [clientHydrated, setClientHydrated] = useState(() => !clientHydrating);

  useEffect(() => {
    clientHydrating = false;
    setClientHydrated(true);
  }, []);

  return clientHydrated;
}
