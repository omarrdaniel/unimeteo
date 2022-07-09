const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const helmet = require('helmet')
const app = express()

var accessLogStream = fs.createWriteStream('access.log')
app.use(morgan('combined', {stream:accessLogStream}))
app.use(helmet())

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
