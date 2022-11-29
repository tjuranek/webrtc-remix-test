import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { getEmitter } from "~/events/emitter.server";
import { useEventSource } from "~/events/useEventSource";

export async function action({ request }: ActionArgs) {
  const { message } = Object.fromEntries(await request.formData());

  const emitter = getEmitter("1234");

  return json({ ok: true });
}

export default function ChatRoom() {
  let message = useEventSource("/chat/events");

  const chatRoom = useFetcher();

  return (
    <div>
      <h1>Chat room</h1>
      {message || "waiting..."}
      <chatRoom.Form method="post">
        <input type="text" name="message"></input>

        <button type="submit">submit</button>
      </chatRoom.Form>
    </div>
  );
}
