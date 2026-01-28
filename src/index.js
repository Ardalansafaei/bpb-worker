export default {
  fetch(request, env) {
    const uuid = env.UUID;

    if (!uuid) {
      return new Response("UUID not set", { status: 500 });
    }

    return new Response(
      `
VLESS CONFIG
UUID: ${uuid}
`,
      {
        headers: { "content-type": "text/plain" }
      }
    );
  }
};
