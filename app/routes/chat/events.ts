import { getEmitter } from "~/events/emitter.server";
import type { LoaderFunction } from "@remix-run/node";
import { eventStream } from "~/events/event-stream";

export let loader: LoaderFunction = ({ request }) => {
  return eventStream(request, (send) => {
    const emitter = getEmitter("1234");
    emitter.addListener("messageReceived", handleChatMessage);

    function handleChatMessage(chatMessage: string) {
      send("message", chatMessage);
    }

    return () => {
      emitter.removeListener("messageReceived", handleChatMessage);
    };
  });
};
