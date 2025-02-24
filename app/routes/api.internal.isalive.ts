export function loader() {
  return new Response("isAlive", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
