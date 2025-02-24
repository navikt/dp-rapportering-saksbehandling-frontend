export function loader() {
  return new Response("isReady", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
