import { useEffect, useRef, useState } from "react";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

export default function Index() {
  // webrtc peer connection
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();

  // local stream values
  const [localStream, setLocalStream] = useState<MediaStream>();
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // update local stream video object when local stream set
  useEffect(() => {
    if (!localStream || !localVideoRef.current) {
      return;
    }

    localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  // remote stream values
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // initialize local stream when the component renders on the client
  useEffect(() => {
    startLocalStream();
  }, []);

  useEffect(() => {
    if (localStream && remoteStream) {
      createOffer();
    }
  }, [localStream, remoteStream]);

  // get the user camera and set the stream as the local stream
  async function startLocalStream() {
    const cameraAudioStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
      },
      audio: false,
    });

    setLocalStream(cameraAudioStream);
    setRemoteStream(new MediaStream());
  }

  async function createOffer() {
    const connection = new RTCPeerConnection(servers);

    localStream?.getTracks().forEach((track) => {
      connection.addTrack(track, localStream);
    });

    connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream?.addTrack(track);
      });
    };

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    setPeerConnection(connection);
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
          <video
            ref={remoteVideoRef}
            autoPlay={true}
            playsInline={true}
          ></video>
        </div>
      </div>
    </div>
  );
}
