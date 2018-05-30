import fetch from "node-fetch";

it("Reject: Sends invalid link to redis", async () => {
  const response = await fetch(`${process.env.TEST_HOST}/confirm/333333`);
  const text = await response.text();
  expect(text).toEqual("invalid");
});
