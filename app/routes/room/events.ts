import type { LoaderArgs } from "@remix-run/node";
import { getEmitter } from "~/services";
import { createEventStreamResponse } from "~/utils";

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  if (!name) {
    throw new Error("Name required when subscribing to room event stream.");
  }

  return createEventStreamResponse(request, (send) => {
    const emitter = getEmitter(name);

    emitter.addListener("NeedsOffer", handleNeedsOffer);
    function handleNeedsOffer() {
      send("message", "NeedsOffer");
    }

    return () => {
      emitter.removeListener("NeedsOffer", handleNeedsOffer);
    };
  });
}
