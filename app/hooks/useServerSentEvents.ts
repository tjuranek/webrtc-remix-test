import { useEffect, useState } from "react";
import { EventSourceStatus } from "~/enums";
import { useClientHydrated } from "~/hooks/useClientHydrated";

type OnConnectFunction = () => void;
type OnMessageFunction = (data: MessageData) => void;

interface UseServerSentEventsParams {
  href: string;
  onConnect?: OnConnectFunction;
  onMessage?: OnMessageFunction;
}

export interface MessageData {
  action: String;
  payload: any;
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
      const message = JSON.parse(event.data) as MessageData;
      messages.push(message);

      onMessage?.(message);
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
