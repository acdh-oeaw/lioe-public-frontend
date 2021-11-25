LIÖ Website
===========

This repository contains the two parts of the environment/container making up the lioe website

* in server you find a small server that contains a few endpoints that translate between a more browser friendly api
  and the elasticsearch native API
* the rest of the sources are running in the browser

Development
-----------

For development if you want to do anything with involving data in elasticsearch you need to run the server part in addition
to the usual TypeScript dev server. This is already preconfigured for you when running `npm run dev`
Note that this sets teh `NODE_ENV` environment variable to `dev` and therefore loads the environment from the `.env-dev.env` file.
If you want to change any of the settings introduced in the code using a `process.env.XXX` parameter you need to set and/or
change it there. (In addition setting an environment varaible on your dev machine/in `launch.json` may also work)

Building
--------

You can test building the site using `npm run build`.
Note that this sets the `NODE_ENV` environment variable to `production` and therefore loads the environment from the `.env-production.env` file.
By default this sets `process.env.API_HOST` to `""`. So the respective URLs work relative to whatever host the container is running on.
This is deliberate as these endpoints are meant to be only used by the frontend served from exactly this host.

Developing tests
----------------

For testing (cypress e2e testing) the code is built for production (`npm run build`). After it is build
you can launch the test development environment using `npm run test:interactive`. Every test should run without
error in this environment.
To be sure you can also run `npm run test` before you push because this is what runs on the build server.

Test the container image locally
--------------------------------

You can test the container image from the build server locally (e.g. the dev branch):

```bash
docker run --rm -it -p 8080:8080 -e PORT=8080 registry.gitlab.com/acdh-oeaw/dboe/lioe-website/dev start
```

`NODE_PORT` works the same as `PORT`
If the container should redirect all traffic from http:// to https:// you need to set the environmen variable `REDIRECT_HTTPS`.
*Note*: NODE_ENV here does not change anything anymore for the frontend code in the browser as this is fixed during the build process
