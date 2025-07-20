var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ✅ Handle CORS preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/products" && request.method === "GET") {
      try {
        const selectedFile = await env.SELECTED_KV.get("selectedFile");

        if (!selectedFile) {
          return new Response(JSON.stringify({ error: "No file selected in KV" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        const object = await env.MY_BUCKET.get(selectedFile);

        if (!object) {
          return new Response(JSON.stringify({ error: "File not found in R2" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        const body = await object.text();

        return new Response(body, {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new Response("Not Found", {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};

export {
  worker_default as default
};
