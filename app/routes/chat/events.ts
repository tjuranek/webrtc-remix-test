import { emitter } from "~/events/emitter.server";
import type { LoaderFunction } from "@remix-run/node";
import { eventStream } from "~/events/event-stream";

export let loader: LoaderFunction = ({ request }) => {
  return eventStream(request, (send) => {
    emitter.addListener("messageReceived", handleChatMessage);

    console.log("loader");
    console.log("emitter", emitter.eventNames());

    function handleChatMessage(chatMessage: string) {
      console.log("in handle chat");
      send("message", chatMessage);
    }

    return () => {
      console.log("in return");
      emitter.removeListener("messageReceived", handleChatMessage);
    };
  });
};
