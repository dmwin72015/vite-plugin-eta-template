import { Plugin } from "vite";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { shared } from "../shared";
import { writeFile } from "../utils/file";
import etaTmpl from "../utils/eta_template";

export const serve = {
  rewriteUrl: (url: URL) => url as URL | undefined,
};

function tempName(entry: string) {
  return `${shared.tempDir}/${entry}`;
}

const servePlugin: Plugin = {
  name: "serve-php",
  apply: "serve",
  enforce: "post",
  configResolved() {
    const gitIgnoreFile = resolve(`${shared.tempDir}/.gitignore`);
    if (!existsSync(gitIgnoreFile)) {
      writeFile(gitIgnoreFile, "*\r\n**/*");
    }

    shared.entries.forEach((entry) => {
      etaTmpl.fromFile(entry).applyEnv().write(tempName(entry));
    });
  },
  // configureServer(server) {
  //   server.middlewares.use(async (req, res, next) => {
  //     next();
  //   });
  // },
  handleHotUpdate({ server, file }) {
    const entry = shared.entries.find(
      (entryFile) => resolve(entryFile) === resolve(file)
    );

    if (entry) {
      etaTmpl.fromFile(entry).applyEnv().write(tempName(entry));

      server.moduleGraph.invalidateAll();
    }

    if (
      entry ||
      (!file.startsWith(resolve(shared.tempDir)) && file.includes(".eta"))
    ) {
      server.ws.send({
        type: "full-reload",
      });
    }
  },
};

export default servePlugin;
