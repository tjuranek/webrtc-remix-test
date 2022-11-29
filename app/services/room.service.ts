import { getEmitMessage } from "~/services";

interface Room {
  name: string;
  offer?: Object;
  answer?: Object;
}

let rooms: Map<string, Room>;

declare global {
  var __rooms: Map<string, Room> | undefined;
}

if (process.env.NODE_ENV === "production") {
  rooms = new Map<string, Room>();
} else {
  if (!global.__rooms) {
    global.__rooms = new Map<string, Room>();
  }

  rooms = new Map<string, Room>();
}

export function connectToRoom(name: string) {
  const doesRoomExist = Boolean(rooms.get(name));

  if (!doesRoomExist) {
    rooms.set(name, { name });
  }

  const room = rooms.get(name) as Room;
  const emitMessage = getEmitMessage(name);

  if (!room.offer) {
    emitMessage({ action: "NeedsOffer", payload: "payload" });
    return;
  }

  if (room.offer && !room.answer) {
    emitMessage({ action: "NeedsAnswer", payload: "payload" });
    return;
  }

  throw new Error("An error occurred connection to the room.");
}
