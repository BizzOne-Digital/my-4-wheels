/** Local test helper: starts an in-memory MongoDB replica and prints its URI. */
import { MongoMemoryServer } from "mongodb-memory-server";

(async () => {
  const server = await MongoMemoryServer.create({ instance: { port: Number(process.env.MEMDB_PORT || 27099) } });
  console.log("MEMDB_URI=" + server.getUri() + "my4wheels");
  process.on("SIGINT", async () => {
    await server.stop();
    process.exit(0);
  });
  setInterval(() => {}, 1 << 30);
})();
