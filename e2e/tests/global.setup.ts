import { createUrl } from "@acdh-oeaw/lib";
import { test as setup } from "@playwright/test";

// TODO: move to environment variable
const matomoUrl = "https://matomo.acdh.oeaw.ac.at"

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
