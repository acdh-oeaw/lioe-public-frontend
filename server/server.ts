import type { ParsedUrlQuery } from 'node:querystring'
import { fileURLToPath } from 'node:url'

import compression from "compression";
import cors from "cors";
import express from "express";
import { createUrl, createUrlSearchParams, request } from "@acdh-oeaw/lib";
import { errorHandler } from "./error";

const app = express();

app.enable("trust proxy");
app.use(cors());
app.use(compression());
app.use(express.json());
/** Use `node:querystring` instead of `qs`. */
app.set('query parser', 'simple')

/** eXist db instance. */
const wboeApiBaseUrl =
  "https://wboe-api-retro.acdh-dev.oeaw.ac.at/exist/restxq/wboe-api/v1.0/";
/** Elasticsearch instance. */
const dboeApiBaseUrl = "https://walk-want-grew.acdh.oeaw.ac.at/dboe/";

app.get("/api/articles", async (req, res, next) => {
  const url = createUrl({
    baseUrl: wboeApiBaseUrl,
    pathname: "articles",
    searchParams: createUrlSearchParams(req.query as ParsedUrlQuery),
  });

  try {
    const data = await request(url, {
      responseType: "json",
			timeout: 100_000
    });
    res.send(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/articles/:id", async (req, res, next) => {
  const url = createUrl({
    baseUrl: wboeApiBaseUrl,
    pathname: `articles/${encodeURIComponent(req.params.id)}`,
  });

  try {
    const data = await request(url, {
			headers: { Accept: 'application/xml' },
      responseType: "text",
    });
    res.send(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/articles-version", async (_req, res, next) => {
  const url = createUrl({
    baseUrl: wboeApiBaseUrl,
    pathname: "version",
  });

  try {
    const data = await request(url, {
      responseType: "json",
    });
    res.send(data);
  } catch (error) {
    next(error);
  }
});

app.post("/es-query", async (req, res, next) => {
  const url = createUrl({
    baseUrl: dboeApiBaseUrl,
    pathname: "_search",
    searchParams: createUrlSearchParams({
      _source_excludes: "location*",
      version: true,
    }),
  });

  try {
    const data = await request(url, {
      method: "post",
      body: req.body,
      responseType: "json",
    });
    res.send(data);
  } catch (error) {
    next(error);
  }
});

app.post("/es-count", async (req, res, next) => {
  const url = createUrl({
    baseUrl: dboeApiBaseUrl,
    pathname: "_count",
  });

  try {
    const data = await request(url, {
      method: "post",
      body: req.body,
      responseType: "json",
    });
    res.send(data);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(fileURLToPath(new URL("..", import.meta.url))));

app.use(errorHandler)

export { app as server }
