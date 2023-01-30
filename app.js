// Full Documentation - https://docs.turbo360.co
const vertex = require('vertex360')({ site_id: process.env.TURBO_APP_ID })
const express = require('express')

const app = express()

const config = {
  views: 'views', 
  static: 'public', 
  logging: true,
}

vertex.configureApp(app, config)

// import routes
const index = require('./routes/index')
const api = require('./routes/api')
const loginApi = require('./routes/login')


// set routes
app.use('/', index)
app.use('/home', api)
app.use('/', loginApi)


module.exports = app
