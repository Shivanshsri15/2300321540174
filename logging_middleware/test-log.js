require("dotenv").config();

const { Log, setAccessToken } = require("./dist/index");

setAccessToken(process.env.EVALUATION_ACCESS_TOKEN);

async function run() {
  await Log("backend", "error", "handler", "received string, expected bool");
  await Log("backend", "fatal", "db", "Critical database connection failure.");
  console.log("done");
}

run();