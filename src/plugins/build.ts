import { Plugin } from "vite";
import { shared } from "../shared";
import etaTmpl from "../utils/eta_template";

const buildPlugin: Plugin = {
  name: "build-eta",
  apply: "build",
  enforce: "pre",
  resolveId(source, importer, options) {
    if (shared.entries.includes(source)) {
      return {
        // Rename ids because Vite transforms only .html files: https://github.com/vitejs/vite/blob/0cde495ebeb48bcfb5961784a30bfaed997790a0/packages/vite/src/node/plugins/html.ts#L330
        id: `${source}.html`,
        resolvedBy: "vite-plugin-eta-template",
        meta: {
          originalId: source,
        },
      };
    }
  },
  load(id, options) {
    const moduleInfo = this.getModuleInfo(id);
    const entry = moduleInfo?.meta.originalId;
    if (entry) {
      const etaObj = etaTmpl.fromFile(entry).applyEnv().escape();
      return {
        code: etaObj.code,
        meta: { tagMapping: etaObj.mapping },
      };
    }
  },
  generateBundle: {
    order: "post",
    handler(options, bundle, isWrite) {
      Object.entries(bundle).forEach(([key, item]) => {
        if (item.type === "asset") {
          const moduleInfo = this.getModuleInfo(item.fileName);
          if (moduleInfo?.meta.originalId) {
            const meta = moduleInfo.meta;

            item.fileName = meta.originalId;

            if (meta.tagMapping) {
              const res = etaTmpl.unescape(
                item.source.toString(),
                meta.tagMapping
              );
              item.source = res;
            }
            // item.source = fixAssetsInjection(item.source.toString());
          }
        } else if (item.type === "chunk" && item.facadeModuleId) {
          const moduleInfo = this.getModuleInfo(item.facadeModuleId);

          if (moduleInfo) {
            const meta = moduleInfo.meta;
            if (meta.tagMapping) {
              item.code = etaTmpl.unescape(item.code, meta.tagMapping);
            }
            // item.code = fixAssetsInjection(item.code);
          }
        }
      });
    },
  },
};

export default buildPlugin;
