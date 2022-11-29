import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useServerSentEvents } from "~/hooks";
import { connectToRoom } from "~/services/room.service";

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  if (!name) {
    throw new Error("Name required when joining a room.");
  }

  return json({ name });
}

export async function action({ request }: ActionArgs) {
  const { name } = Object.fromEntries(await request.formData());

  if (!name) {
    throw new Error("Name required when connecting to a room.");
  }

  connectToRoom(name as string);
  return json({});
}

export default function Room() {
  const { name } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const { connectionStatus, messages } = useServerSentEvents({
    href: `/room/events?name=${name}`,
    onConnect: onSseConnect,
    onMessage: onSseMessage,
  });

  function onSseConnect() {
    fetcher.submit({ name }, { method: "post" });
  }

  function onSseMessage(message: any) {
    console.log(message);
  }

  return (
    <>
      <h1>Room</h1>
      <p>{connectionStatus}</p>
      <p>{messages?.[0] || "waiting..."}</p>
    </>
  );
}
