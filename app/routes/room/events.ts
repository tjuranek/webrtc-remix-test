import type { LoaderArgs } from "@remix-run/node";
import { setupEmitterListener } from "~/services";
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
