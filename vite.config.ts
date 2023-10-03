import { execSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(() => {
  const branchName = execSync("git rev-parse --abbrev-ref HEAD").toString().trimEnd();
  const commitHash = execSync("git rev-parse HEAD").toString().trimEnd();
  const tag = execSync("git describe --always --tags").toString().trimEnd();

  return {
    define: {
      "import.meta.env.VITE_APP_GIT_BRANCH_NAME": JSON.stringify(branchName),
      "import.meta.env.VITE_APP_GIT_COMMIT_HASH": JSON.stringify(commitHash),
      "import.meta.env.VITE_APP_GIT_TAG": JSON.stringify(tag),
    },
    plugins: [
      /**
       * Vite does not polyfill node.js built-ins like webpack.
       * Currently, we still use `process` in client code,
       * and some dependencies like `vuex-class-component` assume `global`.
       */
      nodePolyfills(),
      vue(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 8080,
    },
  };
});
