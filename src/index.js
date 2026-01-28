import { connect } from "cloudflare:sockets";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("VLESS over WebSocket", { status: 200 });
    }

    const uuid = env.UUID;
    if (!uuid) {
      return new Response("UUID not set", { status: 500 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    server.addEventListener("message", async (event) => {
      try {
        const socket = connect({
          hostname: "www.cloudflare.com",
          port: 443,
        });

        const writer = socket.writable.getWriter();
        await writer.write(event.data);

        const reader = socket.readable.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          server.send(value);
        }
      } catch (e) {
        server.close();
      }
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};
