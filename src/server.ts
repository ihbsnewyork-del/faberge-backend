import app from "./app";
import { config } from "./config";
import { connectDB } from "./config/db";
import { seedAdmin } from "./config/seedAdmin";
import { startCleanupScheduler } from "./modules/booking/booking.controller";
import http from "http";

connectDB().then(async () => {
  await seedAdmin();
  const PORT = config.port;
  const HOST = config.host;
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running at ${HOST}:${PORT}`);
    startCleanupScheduler();
  });
});
