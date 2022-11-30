import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  connectToRoom,
  setRoomAnswer,
  setRoomOffer,
  setupEmitterListener,
} from "~/services";
import { createEventStreamResponse } from "~/utils";

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  if (!name) {
    throw new Error("Name required when subscribing to room event stream.");
  }

  return createEventStreamResponse(request, (send) => {
    return setupEmitterListener(name, (data: any) => {
      send(data);
    });
  });
}

export async function action({ request }: ActionArgs) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  if (!name) {
    throw new Error("Room name required when performing room actions.");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (!intent) {
    throw new Error("Intent required when performing room actions.");
  }

  if (intent === "connect") {
    connectToRoom(name as string);

    return json({});
  }

  if (intent === "submitOffer") {
    const offer = JSON.parse(formData.get("offer") as string);
    setRoomOffer(name, offer);

    return json({});
  }

  if (intent === "submitAnswer") {
    const answer = JSON.parse(formData.get("answer") as string);
    setRoomAnswer(name, answer);

    return json({});
  }

  throw new Error("Intent not supported by room actions.");
}
