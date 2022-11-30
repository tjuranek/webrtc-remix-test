import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useServerSentEvents } from "~/hooks";
import type { MessageData } from "~/hooks";

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  if (!name) {
    throw new Error("Name required when joining a room.");
  }

  return json({ ok: true });
}

export default function Room() {
  const fetcher = useFetcher();
  const name = new URLSearchParams(useLocation().search).get("name");
  const [connection, setConnection] = useState<RTCPeerConnection>();

  useEffect(() => {
    (async () => {
      const _connection = new RTCPeerConnection();

      // TODO: video refs

      setConnection(_connection);
    })();
  }, []);

  useServerSentEvents({
    href: `/room/events?name=${name}`,
    onConnect: onSseConnect,
    onMessage: onSseMessage,
  });

  function onSseConnect() {
    fetcher.submit(
      {
        intent: "connect",
      },
      {
        method: "post",
        action: `/room/events?name=${name}`,
      }
    );
  }

  async function onSseMessage(message: MessageData) {
    console.log(message);

    if (!connection) throw Error("no conn");

    if (message.action === "Created") {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      fetcher.submit(
        {
          intent: "submitOffer",
          offer: JSON.stringify(offer),
        },
        {
          method: "post",
          action: `/room/events?name=${name}`,
        }
      );

      return;
    }

    if (message.action === "HasCaller") {
      if (connection.localDescription) return;

      const offer = JSON.parse(message.payload.offer);
      await connection.setRemoteDescription(offer);

      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      fetcher.submit(
        {
          intent: "submitAnswer",
          answer: JSON.stringify(answer),
        },
        {
          method: "post",
          action: `/room/events?name=${name}`,
        }
      );

      return;
    }

    if (message.action === "HasCallee") {
      if (connection.remoteDescription) return;

      const answer = JSON.parse(message.payload.answer);
      await connection.setRemoteDescription(answer);

      return;
    }

    throw new Error(`An unsupported message action came in: ${message.action}`);
  }

  return (
    <>
      <h1>Room</h1>
      <p>{connection?.signalingState}</p>
    </>
  );
}
