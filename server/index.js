if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config({
    path : './env-dev.env'
  })
}

const express = require('express')
const cookieSession = require('cookie-session')
const compression = require('compression')
const path = require('path')
const app = express()
const proxy = require('express-http-proxy')
const fs = require('fs')
const bodyParser = require('body-parser')
const axios = require('axios')

var cors = require('cors')

const articleAPIEndpoint = 'https://wboe-api-retro.acdh-dev.oeaw.ac.at/exist/restxq/wboe-api/v1.0/';

// This app runs behind an
// application load balancer
// which handles the Certificate
// Negotiation for us, so we must
// trust them if they say it’s https.
app.enable('trust proxy')


app.use(cors())

// redirect to https if it’s a
// http call.
app.use((request, response, next) => {
  const host = request.headers.host
  const protocol = request.protocol
  if (process.env.REDIRECT_HTTPS && protocol === 'http') {
    response.redirect(301, 'https://' + host + request.url)
  } else {
    next()
  }
})

app.use(compression())
app.use(bodyParser.json())
app.get('/api/articles', async (req, res) => {

  const reqUrl = articleAPIEndpoint + 'articles?'
  + (req.query.initial ? '&initial='+ encodeURIComponent(req.query.initial) : '')
  + (req.query.status ? '&status=' + encodeURIComponent(req.query.status) : '')
  + (req.query.pageNr ? '&pageNr=' + req.query.pageNr : '')
  + (req.query.pageSize ? '&pageSize=' + req.query.pageSize : '');
  console.log(reqUrl);

  const r = (await axios({
    url: reqUrl,
    headers: {
      Accept: 'application/json'
    }
  })).data



  res.send(r)
})
app.get('/api/articles/:article', async (req, res) => {
  console.log(req.params.article)
  const r = (await axios({
    url: articleAPIEndpoint + 'articles/'+ encodeURIComponent(req.params.article),
    headers: {
      Accept: 'application/xml'
    }
  })).data
  res.send(r)
})

app.get('/api/articles-version', async (_req, res) => {
  try {
    const r = (await axios({
      url: articleAPIEndpoint + 'version',
      headers: {
        Accept: 'application/json'
      }
    })).data;
    res.send(r);
  } catch(e) {
    console.log(e.response.data)
    res.send(500, e.response.data)
  }
})

app.post('/es-query', async (req, res) => {
  const q = req.body
  try {
    const r = (await axios({
      method: 'POST',
      data: q,
      url: 'https://walk-want-grew.acdh.oeaw.ac.at/dboe/_search?_source_excludes=location*&version=true'
    })).data
    res.send(r)
  } catch (e) {
    console.log(e.response.data)
    res.send(500, e.response.data)
  }
})

app.get('/es-count', async (req, res) => {
  const q = req.body.query || JSON.parse(req.query.query)
  const data = {query:q}
  const rdata = {
    method: 'GET',
    url: 'https://walk-want-grew.acdh.oeaw.ac.at/dboe/_count'
  }
  if (q) {
    rdata['data'] = data;
  }
  try {
    const r = (await axios(
      rdata
    )).data
    res.send(r)
  } catch (e) {
    console.log(e)
    res.send(500, e.response.data)
  }
})

app.use('/', express.static(path.join(__dirname, '../dist/')))
app.use('*', express.static(path.join(__dirname, '../dist/index.html')))
const port = process.env.NODE_PORT || process.env.PORT || 3333
app.listen(port, () => {
  console.log(`Started server on port ${port}`)
})
