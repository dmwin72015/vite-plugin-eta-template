import makeID from "./makeID";
import initReplaceEnv from "./replaceEnv";
import { readFile, writeFile } from "./file";

// eta 模板语法

// TODO: 可以灵活自定义匹配的 模板语法 tag
export const eatPattern = /<%[~=\-]?\s+.*?%>/g;

class etaTmpl {
  file = "";
  code = "";
  mapping = new Map<string, string>();

  static fromFile(file: string) {
    const inst = new this(readFile(file));
    inst.file = file;

    return inst;
  }

  constructor(code: string) {
    this.code = code;
    return this;
  }

  applyEnv() {
    const replaceEnv = initReplaceEnv();

    this.code = replaceEnv(this.code, this.file || "");

    return this;
  }

  escape() {
    const isML = this.file.endsWith(".html") || this.file.endsWith(".eta");

    this.code = this.code.replace(eatPattern, (match) => {
      let token = makeID();
      if (isML) {
        token = `__ETA_TAG__${token}`;
      }
      this.mapping.set(token, match);
      return token;
    });

    return this;
  }

  write(file: string, mapping = false) {
    writeFile(file, this.code);
    mapping && writeFile(file + ".json", JSON.stringify(this.mapping));
  }

  static unescape(code: string, mapping: Map<string, string>) {
    let out = code;

    mapping.forEach((code, token) => {
      out = out.replace(token, code);
    });
    return out;
  }
}

export default etaTmpl;
