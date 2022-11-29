import { useEffect, useRef, useState } from "react";

export default function Index() {
  const [connection, setConnection] = useState<RTCPeerConnection>();
  const [genOffer, setGenOffer] = useState("");
  const [copyOffer, setCopyOffer] = useState("");
  const [genAnswer, setGenAnswer] = useState("");
  const [copyAnswer, setCopyAnswer] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    (async () => {
      const _connection = new RTCPeerConnection();

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
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      if (localVideoRef.current && remoteVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        remoteVideoRef.current.srcObject = remoteStream;
      }

      setConnection(_connection);
    })();
  }, []);

  async function createOffer() {
    if (!connection) throw Error("No conn.");

    connection.onicecandidate = async (event) => {
      if (event.candidate) {
        setGenOffer(JSON.stringify(connection.localDescription));
      }
    };

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
  }

  async function createAnswer() {
    if (!connection) throw Error("No conn.");

    connection.onicecandidate = async (event) => {
      if (event.candidate) {
        setGenAnswer(JSON.stringify(connection.localDescription));
      }
    };

    const offer = JSON.parse(copyOffer);
    await connection.setRemoteDescription(offer);

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
  }

  async function setAnswer() {
    if (!connection) throw Error("No conn.");

    const answer = JSON.parse(copyAnswer);
    if (!connection.currentRemoteDescription) {
      connection.setRemoteDescription(answer);
    }
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

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
              <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="ml-4 mt-2">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Generated Offer
                  </h3>

                  <p>Call generates offer.</p>
                </div>
                <div className="ml-4 mt-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={createOffer}
                    className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Generate Offer
                  </button>
                </div>
              </div>
            </div>

            <textarea
              rows={4}
              name="comment"
              id="comment"
              className="block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue={genOffer}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
              <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="ml-4 mt-2">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Copied Offer
                  </h3>

                  <p>Callee copies generated offer.</p>
                </div>
              </div>
            </div>

            <textarea
              rows={4}
              name="comment"
              id="comment"
              className="block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              onChange={(event) => setCopyOffer(event.target.value)}
              value={copyOffer}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
              <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="ml-4 mt-2">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Generated Answer
                  </h3>

                  <p>Callee generates answer.</p>
                </div>
                <div className="ml-4 mt-2 flex-shrink-0">
                  <button
                    type="button"
                    className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={createAnswer}
                  >
                    Generate Answer
                  </button>
                </div>
              </div>
            </div>

            <textarea
              rows={4}
              name="comment"
              id="comment"
              className="block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue={genAnswer}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
              <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="ml-4 mt-2">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Copied Answer
                  </h3>

                  <p>Caller copies generated answer and sets it.</p>
                </div>
                <div className="ml-4 mt-2 flex-shrink-0">
                  <button
                    type="button"
                    className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={setAnswer}
                  >
                    Set Answer
                  </button>
                </div>
              </div>
            </div>

            <textarea
              rows={4}
              name="comment"
              id="comment"
              className="block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              onChange={(event) => setCopyAnswer(event.target.value)}
              value={copyAnswer}
            />
          </div>
        </div>
      </div>
    </>
  );
}
