type CleanupFunction = () => void;
type SendFunction = (data: string) => void;
type InitFunction = (send: SendFunction) => CleanupFunction;

export function createEventStreamResponse(
  request: Request,
  init: InitFunction
) {
  let stream = new ReadableStream({
    start(controller) {
      let encoder = new TextEncoder();
      let send = (data: any) => {
        const stringifiedData = JSON.stringify(data);

        if (!stringifiedData) {
          throw new Error(
            "Tried to send an event with data not JSON compatible."
          );
        }

        controller.enqueue(encoder.encode(`event: message\n`));
        controller.enqueue(encoder.encode(`data: ${stringifiedData}\n\n`));
      };
      let cleanup = init(send);

      let closed = false;
      let close = () => {
        if (closed) return;
        cleanup();
        closed = true;
        request.signal.removeEventListener("abort", close);
        controller.close();
      };

      request.signal.addEventListener("abort", close);
      if (request.signal.aborted) {
        close();
        return;
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
