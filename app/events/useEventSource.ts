import { useEffect, useState } from "react";

let clientHydrating = true;

export function useEventSource(href: string, callback: Function) {
  let [clientHydrated, setClientHydrated] = useState(() => !clientHydrating);
  let [data, setData] = useState("");

  useEffect(() => {
    clientHydrating = false;
    setClientHydrated(true);
  }, []);

  useEffect(() => {
    if (!clientHydrated) return;

    let eventSource = new EventSource(href);
    eventSource.addEventListener("message", handler);

    function handler(event: MessageEvent) {
      console.log("message");
      setData(event.data || "unknown");
    }

    setTimeout(() => {
      callback();
    }, 1);

    return () => {
      eventSource.removeEventListener("message", handler);
    };
  }, [clientHydrated]);

  return data;
}
