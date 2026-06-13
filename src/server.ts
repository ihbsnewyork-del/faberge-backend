import path from "path";
import app from "./app";
import { config } from "./config";
import { connectDB } from "./config/db";
import { seedAdmin } from "./config/seedAdmin";
import { startCleanupScheduler } from "./modules/booking/booking.controller";
import fs from "fs";
import https from "https";
// import http from "http";

connectDB().then(async () => {
  await seedAdmin();

  const PORT = config.port;
  const HOST = config.host;

  const options = {
    key: fs.readFileSync(path.join(process.cwd(), "key.pem")),
    cert: fs.readFileSync(path.join(process.cwd(), "cert.pem")),
  };

  // Create an HTTPS server
  // const server = http.createServer(app);
  const server = https.createServer(options, app);

  server.listen(PORT, () => {
    console.log(`Server running at ${HOST}:${PORT}`);
    startCleanupScheduler();
  });
});
