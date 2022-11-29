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

export function getEmitter(name: string) {
  if (!emitters.get(name)) {
    emitters.set(name, new EventEmitter());
  }

  return emitters.get(name) as EventEmitter;
}
