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

  rooms = global.__rooms;
}

export function createOrGetRoom(name: string) {
  const doesRoomExist = Boolean(rooms.get(name));

  if (!doesRoomExist) {
    rooms.set(name, { name });
  }

  const room = rooms.get(name) as Room;
  const emitMessage = getEmitMessage(name);

  return { room, emitMessage };
}

export function connectToRoom(name: string) {
  const { room, emitMessage } = createOrGetRoom(name);

  if (!room.offer && !room.answer) {
    emitMessage({ action: "Created" });
    return;
  }

  if (room.offer && !room.answer) {
    emitMessage({
      action: "HasCaller",
      payload: { offer: JSON.stringify(room.offer) },
    });
    return;
  }

  throw new Error(
    "Calls with more than one caller and callee are not supported."
  );
}

export function setRoomOffer(name: string, offer: Object) {
  const { room, emitMessage } = createOrGetRoom(name);

  room.offer = offer;
  emitMessage({
    action: "HasCaller",
    payload: { offer: JSON.stringify(offer) },
  });
}

export function setRoomAnswer(name: string, answer: Object) {
  const { room, emitMessage } = createOrGetRoom(name);

  room.answer = answer;
  emitMessage({
    action: "HasCallee",
    payload: { answer: JSON.stringify(answer) },
  });
}
