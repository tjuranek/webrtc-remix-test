import { EventEmitter } from "events";

let emitters: Map<string, EventEmitter>;

declare global {
  var __emitters: Map<string, EventEmitter> | undefined;
}

if (process.env.NODE_ENV === "production") {
  emitters = new Map<string, EventEmitter>();
} else {
  if (!global.__emitters) {
    global.__emitters = new Map<string, EventEmitter>();
  }

  emitters = global.__emitters;
}

const MESSAGE_EVENT_NAME = "emittedMessage";

type OnMessageFunction = (...args: any[]) => void;

export function getEmitMessage(name: string) {
  const emitter = createOrGetEmitter(name);

  return (dataToEmit: any) => {
    emitter.emit(MESSAGE_EVENT_NAME, dataToEmit);
  };
}

export function setupEmitterListener(
  name: string,
  onMessage: OnMessageFunction
) {
  const emitter = createOrGetEmitter(name);
  emitter.addListener(MESSAGE_EVENT_NAME, onMessage);

  return () => {
    emitter.removeListener(MESSAGE_EVENT_NAME, onMessage);
  };
}

function createOrGetEmitter(name: string) {
  if (!emitters.get(name)) {
    emitters.set(name, new EventEmitter());
  }

  const emitter = emitters.get(name);

  if (!emitter) {
    throw new Error(
      "Emitter not found after it was created. Is the require cache being cleared?"
    );
  }

  return emitter;
}
