import { createUrl } from "@acdh-oeaw/lib";
import { test as setup } from "@playwright/test";

import { env } from '~/config/env.config'

const matomoUrl = env.VITE_APP_MATOMO_BASE_URL

if (matomoUrl) {
  const baseUrl = String(createUrl({ baseUrl: matomoUrl, pathname: "/**" }));

  setup.beforeEach(
    "block requests to analytics service",
    async ({ context }) => {
      await context.route(baseUrl, (route) => {
        return route.fulfill({ status: 204, body: "" });
      });
    }
  );
}
