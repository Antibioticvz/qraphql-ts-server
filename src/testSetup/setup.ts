import { startServer } from "../startServer";

export const setup = async () => {
  const app = await startServer();
  const { port } = app.address();

  // console.log("...........................server>>>>>>");
  // console.log(app.address());
  // console.log(port);
  process.env.TEST_HOST = `http://127.0.0.1:${port}`;
  // process.env.TEST_HOST = `http://127.0.0.1:$6262`;
};
