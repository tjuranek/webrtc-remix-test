import { useEffect, useRef, useState } from "react";

export default function Index() {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream>();

  useEffect(() => {
    (async () => {
      await startLocalStream();
    })();
  }, []);

  async function startLocalStream() {
    const cameraAudioStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
      },
      audio: false,
    });

    if (!localVideoRef.current) {
      throw new Error("Local video ref was not set.");
    }

    localVideoRef.current.srcObject = cameraAudioStream;
    setLocalStream(cameraAudioStream);
  }

  return (
    <div className="flex gap-6 w-full p-6">
      <div className="overflow-hidden rounded-lg bg-white shadow w-1/2">
        <div className="px-4 py-5 sm:p-6">
          <video ref={localVideoRef} autoPlay={true} playsInline={true}></video>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow w-1/2">
        <div className="px-4 py-5 sm:p-6">
          <video id="playerTwo" autoPlay={true} playsInline={true}></video>
        </div>
      </div>
    </div>
  );
}
