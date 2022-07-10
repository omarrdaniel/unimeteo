const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
//const morgan = require('morgan')
const app = express()

//Togliamo morgan perchè LOG presenti in herokuApp
//var accessLogStream = fs.createWriteStream('access.log')
//app.use(morgan('combined', {stream:accessLogStream}))

//Import routes
const routes = require('./routes.js')

app.use(express.urlencoded({ extended: true }))
app.use(helmet())

//Use view engine
app.set('view engine', 'ejs')

//Middleware route
app.use('/', routes)
app.use(express.static('assets'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server starting at ${PORT}`)
})
