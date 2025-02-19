import { expect, test } from "vitest";

test("fetches user data", async () => {
  const response = await fetch("https://example.com/user");
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data).toEqual({
    id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
    firstName: "John",
    lastName: "Maverick",
  });
});
