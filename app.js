const express = require('express')
const ddos = require('ddos')
const app = express()
var dos = new ddos ({burst:10, limit:15})

//Import routes
const routes = require('./routes.js')

app.use(express.urlencoded({ extended: true }))

//Use view engine
app.set('view engine', 'ejs')

//Middleware route
app.use('/', routes)
app.use(express.static('assets'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server starting at ${PORT}`)
})
