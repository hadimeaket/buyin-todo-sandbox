type NodeLikeProcess = {
  env?: Record<string, string | undefined>;
};

type GlobalWithProcess = typeof globalThis & {
  process?: NodeLikeProcess;
};

type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | undefined>;
};

const runtime = globalThis as GlobalWithProcess;
const nodeFlag = runtime.process?.env?.RUN_LEGACY_UI_SPECS === "true";
const viteFlag =
  typeof import.meta !== "undefined"
    ? (import.meta as ImportMetaWithEnv).env?.RUN_LEGACY_UI_SPECS === "true"
    : false;

export const isLegacySuiteEnabled = nodeFlag || viteFlag;
