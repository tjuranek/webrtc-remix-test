import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
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
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    (async () => {
      const _connection = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
            ],
          },
        ],
      });
      setConnection(_connection);

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 640, ideal: 1920, max: 1920 },
          height: { min: 480, ideal: 1080, max: 1080 },
        },
        audio: false,
      });
      const remoteStream = new MediaStream();

      localStream.getTracks().forEach((track) => {
        _connection.addTrack(track, localStream);
      });

      _connection.ontrack = (event) => {
        console.log("track");
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      if (localVideoRef.current && remoteVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        remoteVideoRef.current.srcObject = remoteStream;
      }
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
      connection.onicecandidate = async (event) => {
        console.log("created ice");
        if (event.candidate) {
          const generatedOffer = connection.localDescription;

          fetcher.submit(
            {
              intent: "submitOffer",
              offer: JSON.stringify(generatedOffer),
            },
            {
              method: "post",
              action: `/room/events?name=${name}`,
            }
          );
        }
      };

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      return;
    }

    if (message.action === "HasCaller") {
      if (connection.localDescription) return;

      connection.onicecandidate = async (event) => {
        if (event.candidate) {
          const generatedAnswer = connection.localDescription;

          fetcher.submit(
            {
              intent: "submitAnswer",
              answer: JSON.stringify(generatedAnswer),
            },
            {
              method: "post",
              action: `/room/events?name=${name}`,
            }
          );
        }
      };

      const offer = JSON.parse(message.payload.offer);
      // here is the issue, offer isn't right type?
      await connection.setRemoteDescription(offer);

      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      return;
    }

    if (message.action === "HasCallee") {
      console.log("why am i here");
      if (connection.remoteDescription) return;

      const answer = JSON.parse(message.payload.answer);
      if (!connection.currentRemoteDescription) {
        await connection.setRemoteDescription(answer);
      }

      return;
    }

    throw new Error(`An unsupported message action came in: ${message.action}`);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <video
              ref={localVideoRef}
              autoPlay={true}
              playsInline={true}
            ></video>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <video
              ref={remoteVideoRef}
              autoPlay={true}
              playsInline={true}
            ></video>
          </div>
        </div>
      </div>
    </>
  );
}
