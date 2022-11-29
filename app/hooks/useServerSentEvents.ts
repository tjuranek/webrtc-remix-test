import { useEffect, useState } from "react";
import { EventSourceStatus } from "~/enums";
import { useClientHydrated } from "~/hooks/useClientHydrated";

type OnConnectFunction = () => void;
type OnMessageFunction = (data: any) => void;

interface UseServerSentEventsParams {
  href: string;
  onConnect?: OnConnectFunction;
  onMessage?: OnMessageFunction;
}

export function useServerSentEvents(params: UseServerSentEventsParams) {
  const { href, onConnect, onMessage } = params;

  const clientHydrated = useClientHydrated();

  const [connectionStatus, setConnectionStatus] = useState<EventSourceStatus>(
    () => {
      return href ? EventSourceStatus.CONNECTING : EventSourceStatus.CLOSED;
    }
  );

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!clientHydrated) return;

    let eventSource = new EventSource(href);

    eventSource.onopen = () => {
      setConnectionStatus(EventSourceStatus.OPEN);
    };

    eventSource.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      setMessages([...messages, message]);
      onMessage?.(event.data);
    };

    eventSource.onerror = () => {
      setConnectionStatus(EventSourceStatus.CLOSED);
    };

    setTimeout(() => {
      onConnect?.();
    }, 1);
  }, [clientHydrated]);

  return { connectionStatus, messages };
}
