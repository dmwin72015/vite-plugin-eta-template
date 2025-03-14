import { Plugin } from "vite";
import fastGlob from "fast-glob";
import consoleHijack from "./utils/consoleHijack";
import servePlugin, { serve } from "./plugins/serve";
import buildPlugin from "./plugins/build";
import { shared } from "./shared";

export type UseEtaTemplateConfig = {
  entry?: string | string[];
  rewriteUrl?: (requestUrl: URL) => URL | undefined;
  tempDir?: string;
  ext?: string | string[];
};

function useEtaTemplate(cfg: UseEtaTemplateConfig = {}): Plugin[] {
  const { entry } = cfg;

  serve.rewriteUrl = cfg.rewriteUrl ?? serve.rewriteUrl;
  shared.entries = entry ? (Array.isArray(entry) ? entry : [entry]) : [];
  shared.tempDir = cfg.tempDir ?? shared.tempDir;

  return [
    {
      name: "init-eta",
      enforce: "post",
      config(config, env) {
        shared.entries = [
          ...new Set(
            shared.entries.filter(Boolean).flatMap((entry) => {
              return fastGlob.globSync(entry, {
                dot: true,
                onlyFiles: true,
                unique: true,
                ignore: [shared.tempDir, config.build?.outDir || "dist"],
              });
            })
          ),
        ];
        consoleHijack();
        return {
          build: {
            rollupOptions: { input: shared.entries },
          },
          optimizeDeps: { entries: shared.entries },
        };
      },
      configResolved(_config) {
        shared.viteConfig = _config;
      },
    },
    servePlugin,
    buildPlugin,
  ];
}

export default useEtaTemplate;
