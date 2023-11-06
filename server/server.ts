import type { ParsedUrlQuery } from 'node:querystring'
import { fileURLToPath } from 'node:url'

import compression from "compression";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createUrl, createUrlSearchParams, request } from "@acdh-oeaw/lib";
import { errorHandler } from "./error";

function jsonFormat(tokens, req, res) {
  return JSON.stringify({
    "remote-address": tokens["remote-addr"](req, res),
    time: tokens["date"](req, res, "iso"),
    method: tokens["method"](req, res),
    url: tokens["url"](req, res),
    "http-version": tokens["http-version"](req, res),
    "status-code": tokens["status"](req, res),
    "content-length": tokens["res"](req, res, "content-length"),
    referrer: tokens["referrer"](req, res),
    "user-agent": tokens["user-agent"](req, res)
  });
}

const app = express();

app.enable("trust proxy");
app.use(cors());
app.use(morgan(jsonFormat));
app.use(compression());
app.use(express.json());
/** Use `node:querystring` instead of `qs`. */
app.set('query parser', 'simple')

/** eXist db instance. */
const wboeApiBaseUrl =
  "https://wboe-curation.acdh-dev.oeaw.ac.at/exist/restxq/wboe-api/v1.0/";
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
