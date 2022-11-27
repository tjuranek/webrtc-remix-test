import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { CodeBracketIcon } from "@heroicons/react/20/solid";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");

  if (name) {
    return redirect(`/room?name=${name}`);
  }

  return json({
    errors: {
      name: true,
    },
  });
}

export default function Index() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full md:w-4/5 xl:w-3/5 flex flex-col xl:flex-row xl:items-center rounded-lg bg-white shadow gap-8 px-4 xl:px-8 py-8 xl:py-16">
        <div className="xl:basis-1/2">
          <h1 className="font-bold text-4xl">Remix-WebRTC-Chat</h1>

          <p className="mt-2">
            A peer-to-peer video and text chat application. Signaling and
            rendering built in Remix. Audio and video data transmission is
            secure through WebRTC.
          </p>

          <a href="https://github.com/tjuranek">
            <button
              type="button"
              className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <CodeBracketIcon
                className="-ml-0.5 mr-2 h-4 w-4"
                aria-hidden="true"
              />
              View on GitHub
            </button>
          </a>
        </div>

        <div className="xl:basis-1/2">
          <Form
            className="w-full flex flex-wrap gap-2 xl:justify-center"
            method="post"
          >
            <input
              type="text"
              name="name"
              id="name"
              className={`w-full md:w-1/2 xl:w-3/5 rounded-lg ${
                actionData?.errors.name ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              placeholder="Enter a room name..."
              aria-invalid={actionData?.errors.name}
            />

            <button
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="submit"
            >
              Join Room
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
