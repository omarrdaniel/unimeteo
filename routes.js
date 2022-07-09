const router = require('express').Router()
require('dotenv').config()
const fetch = require('node-fetch')

async function getImage (city,key) {
  var random = Math.floor(Math.random()*10)
  const unsplashUrl = `http://api.unsplash.com/search/photos?query=${city}&client_id=${key}`
  var backgroundLink
  try{
    await fetch (unsplashUrl)
      .then(res => res.json())
      .then(data => backgroundLink = data.results[random].urls.regular)
  } catch (err) {
    console.log("Errore con il caricamento dello sfondo")
    backgroundLink = "/img/landscape.webp"
  }
  return backgroundLink
}

async function getAQ (lat,lon,key) {
  const aqiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`
  var aq
  try{
    await fetch(aqiUrl)
      .then(res => res.json())
      .then(data => aq = data.list[0].main.aqi)
  } catch (err) {
    console.log("Errore nella chiamata fetch API per AIR QUALITY INDEX!")
  }
  return aq
}

router.get('/', (req,res) => {
  res.render("index")
})

router.get('/meteo', async (req,res) => {
  const ipUrl = `https://ipinfo.io/json?token=${process.env.IPINFO_KEY}`
  var city, coords, lat, lon
  try{
    await fetch (ipUrl)
      .then(res => res.json())
      .then(data => {
        city = data.city
        coords = data.loc.split(',')
        lat = coords[0];
        lon = coords[1];
      })
  } catch (err) {
    console.log("Errore chiamata GET e recupero location tramite IP")
    res.render("meteo", {
      city: null,
      temp: null,
      description: null,
      humidity: null,
      wind: null,
      imgsrc: null,
      aq: null,
      min: null,
      max: null,
      imgtoday: null,
      imgtom: null,
      mintom: null,
      maxtom: null,
      imgdayafter: null,
      mindayafter: null,
      maxdayafter: null,
      unsplash: "/img/landscape.webp",
      day1: null,
      day2: null,
      day3: null,
      imgday3: null,
      min3: null,
      max3: null
    })
  }
  var aq = await getAQ(lat,lon,process.env.API_KEY)
  var backgroundLink = await getImage(city,process.env.UNSPLASH_KEY)
  if(coords[0] || coords[1] && aq){
    //onecall 1.0 api
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly&appid=${process.env.API_KEY}`
    const index = ["Good", "Fair", "Moderate", "Poor", "Very poor"]
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    var date = new Date ()
    try{
      await fetch(weatherUrl)
        .then(res => res.json())
        .then(data => {
          if(data.message === 'city not found' || data.message === 'wrong latitude' || data.message === 'wrong longitude'){
            res.render('meteo', {
              city: data.message,
              temp: null,
              description: null,
              humidity: null,
              wind: null,
              imgsrc: null,
              aq: null,
              min: null,
              max: null,
              imgtoday: null,
              imgtom: null,
              mintom: null,
              maxtom: null,
              imgdayafter: null,
              mindayafter: null,
              maxdayafter: null,
              unsplash: "/img/landscape.webp",
              day1: null,
              day2: null,
              day3: null,
              imgday3: null,
              min3: null,
              max3: null
            })
          } else {
            res.render('meteo', {
              city: city,
              temp: data.current.temp,
              description: data.current.weather[0].description,
              humidity: data.current.humidity,
              wind: data.current.wind_speed,
              imgsrc: "https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png",
              aq: index[aq-1],
              min: data.daily[0].temp.min,
              max: data.daily[0].temp.max,
              imgtoday: "https://openweathermap.org/img/w/" + data.daily[0].weather[0].icon + ".png",
              imgtom: "https://openweathermap.org/img/w/" + data.daily[1].weather[0].icon + ".png",
              mintom: data.daily[1].temp.min,
              maxtom: data.daily[1].temp.max,
              imgdayafter: "https://openweathermap.org/img/w/" + data.daily[2].weather[0].icon + ".png",
              mindayafter: data.daily[2].temp.min,
              maxdayafter: data.daily[2].temp.max,
              unsplash: backgroundLink,
              day1: days[(date.getDay() + 1) % 7],
              day2: days[(date.getDay() + 2) % 7],
              day3: days[(date.getDay() + 3) % 7],
              imgday3: "https://openweathermap.org/img/w/" + data.daily[3].weather[0].icon + ".png",
              min3: data.daily[3].temp.min,
              max3: data.daily[3].temp.max
            })
          }
        })
    } catch (err) {
      console.log("Errore nel Weather API Call")
      res.render('meteo', {
        city: "Something went wrong with weather!",
        temp: null,
        description: null,
        humidity: null,
        wind: null,
        imgsrc: null,
        aq: null,
        min: null,
        max: null,
        imgtoday: null,
        imgtom: null,
        mintom: null,
        maxtom: null,
        imgdayafter: null,
        mindayafter: null,
        maxdayafter: null,
        unsplash: "/img/landscape.webp",
        day1: null,
        day2: null,
        day3: null,
        imgday3: null,
        min3: null,
        max3: null
      })
    }
  } else {
    console.log("Errore nelle coordinate o nell'air quality index. CONTROLLARE API")
  }
})

router.post('/meteo', async (req,res) => {
  const city = req.body.city
  var backgroundLink = await getImage(city,process.env.UNSPLASH_KEY)
  var lat,lon
  const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${process.env.API_KEY}`
  try{
    await fetch(geocodingUrl)
      .then(res => res.json())
      .then(data => {
        lat = data[0].lat;
        lon = data[0].lon;
      })
    } catch (err) {
      console.log("Errore nel Geocoding API Call")
      res.render('meteo', {
        city: "Something went wrong with coordinates!",
        temp: null,
        description: null,
        humidity: null,
        wind: null,
        imgsrc: null,
        aq: null,
        min: null,
        max: null,
        imgtoday: null,
        imgtom: null,
        mintom: null,
        maxtom: null,
        imgdayafter: null,
        mindayafter: null,
        maxdayafter: null,
        unsplash: "/img/landscape.webp",
        day1: null,
        day2: null,
        day3: null,
        imgday3: null,
        min3: null,
        max3: null
      })
    }
    var aq = await getAQ(lat,lon,process.env.UNSPLASH_KEY)
    if(lat || lon && aq){
      //onecall 1.0 api
      const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly&appid=${process.env.API_KEY}`
      const index = ["Good", "Fair", "Moderate", "Poor", "Very poor"]
      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
      var date = new Date ()
      try{
        await fetch(weatherUrl)
          .then(res => res.json())
          .then(data => {
            if(data.message === 'city not found' || data.message === 'wrong latitude' || data.message === 'wrong longitude'){
              res.render('meteo', {
                city: data.message,
                temp: null,
                description: null,
                humidity: null,
                wind: null,
                imgsrc: null,
                aq: null,
                min: null,
                max: null,
                imgtoday: null,
                imgtom: null,
                mintom: null,
                maxtom: null,
                imgdayafter: null,
                mindayafter: null,
                maxdayafter: null,
                unsplash: "/img/landscape.webp",
                day1: null,
                day2: null,
                day3: null,
                imgday3: null,
                min3: null,
                max3: null
              })
            } else {
              res.render('meteo', {
                city: city,
                temp: data.current.temp,
                description: data.current.weather[0].description,
                humidity: data.current.humidity,
                wind: data.current.wind_speed,
                imgsrc: "https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png",
                aq: index[aq-1],
                min: data.daily[0].temp.min,
                max: data.daily[0].temp.max,
                imgtoday: "https://openweathermap.org/img/w/" + data.daily[0].weather[0].icon + ".png",
                imgtom: "https://openweathermap.org/img/w/" + data.daily[1].weather[0].icon + ".png",
                mintom: data.daily[1].temp.min,
                maxtom: data.daily[1].temp.max,
                imgdayafter: "https://openweathermap.org/img/w/" + data.daily[2].weather[0].icon + ".png",
                mindayafter: data.daily[2].temp.min,
                maxdayafter: data.daily[2].temp.max,
                unsplash: backgroundLink,
                day1: days[(date.getDay() + 1) % 7],
                day2: days[(date.getDay() + 2) % 7],
                day3: days[(date.getDay() + 3) % 7],
                imgday3: "https://openweathermap.org/img/w/" + data.daily[3].weather[0].icon + ".png",
                min3: data.daily[3].temp.min,
                max3: data.daily[3].temp.max
              })
            }
          })
      } catch (err) {
        console.log("Errore nel Weather API Call")
        res.render('meteo', {
          city: "Something went wrong with weather!",
          temp: null,
          description: null,
          humidity: null,
          wind: null,
          imgsrc: null,
          aq: null,
          min: null,
          max: null,
          imgtoday: null,
          imgtom: null,
          mintom: null,
          maxtom: null,
          imgdayafter: null,
          mindayafter: null,
          maxdayafter: null,
          unsplash: "/img/landscape.webp",
          day1: null,
          day2: null,
          day3: null,
          imgday3: null,
          min3: null,
          max3: null
        })
      }
    } else {
      console.log("Errore nelle coordinate o nell'air quality index. CONTROLLARE API")
    }
})

module.exports = router
