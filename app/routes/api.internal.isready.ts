export function clientLoader() {
  return new Response("isReady", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
