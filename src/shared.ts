import { ResolvedConfig } from "vite";

export const shared = {
  viteConfig: undefined as undefined | ResolvedConfig,
  entries: [] as string[],
  tempDir: ".php-tmp",
};
