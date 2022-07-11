const express = require('express')
const Ddos = require('ddos')
const app = express()
var ddos = new Ddos ({burst:3, limit:40})

//Import routes
const routes = require('./routes.js')

app.use(express.urlencoded({ extended: true }))
app.use(ddos.express)

//Use view engine
app.set('view engine', 'ejs')

//Middleware route
app.use('/', routes)
app.use(express.static('assets'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server starting at ${PORT}`)
})
