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
  if(isNaN(aq))
    aq = "Errore!"
  return aq
}

router.get('/', (req,res) => {
  res.render("index")
})

router.get('/meteo', async (req,res) => {
  //passaggio per prendere reale indirizzo IP client e non del server che effettua la richiesta
  //SE ESEGUITO IN LOCALE VA TOLTO
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr){
    var list = ipAddr.split(",");
    ipAddr = list[list.length-1];
  } else {
    ipAddr = req.connection.remoteAddress;
  }
  const ipUrl = `http://ip-api.com/json/${ipAddr}`
  var city, lat, lon
  try{
    await fetch (ipUrl)
      .then(res => res.json())
      .then(data => {
        city = data.city
        lat = data.lat
        lon = data.lon
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
      max3: null,
      feels: null,
      day4: null,
      imgday4: null,
      min4: null,
      max4: null,
      day5: null,
      imgday5: null,
      min5: null,
      max5: null,
      sunrise: null,
      sunset: null
    })
  }
  var aq = await getAQ(lat,lon,process.env.API_KEY)
  var backgroundLink = await getImage(city,process.env.UNSPLASH_KEY)
  if(lat || lon && aq){
    //onecall 1.0 api
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly&appid=${process.env.API_KEY}`
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
              max3: null,
              feels: null,
              day4: null,
              imgday4: null,
              min4: null,
              max4: null,
              day5: null,
              imgday5: null,
              min5: null,
              max5: null,
              sunrise: null,
              sunset: null
            })
          } else {
            const index = ["Good", "Fair", "Moderate", "Poor", "Very poor"]
            const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
            var date = new Date ()
            var sunrise = new Date (data.current.sunrise * 1000)
            if(sunrise.getMinutes()<10){
              var sunrmin = '0' + sunrise.getMinutes()
            } else {
              var sunrmin = sunrise.getMinutes()
            }
            var sunset = new Date (data.current.sunset * 1000)
            if(sunset.getMinutes()<10){
              var sunsmin = '0' + sunset.getMinutes()
            } else {
              var sunsmin = sunset.getMinutes()
            }
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
              max3: data.daily[3].temp.max,
              feels: data.current.feels_like,
              day4: days[(date.getDay() + 4) % 7],
              imgday4: "https://openweathermap.org/img/w/" + data.daily[4].weather[0].icon + ".png",
              min4: data.daily[4].temp.min,
              max4: data.daily[4].temp.max,
              day5:  days[(date.getDay() + 5) % 7],
              imgday5: "https://openweathermap.org/img/w/" + data.daily[5].weather[0].icon + ".png",
              min5: data.daily[5].temp.min,
              max5: data.daily[5].temp.max,
              sunrise: (sunrise.getHours()+2) + ":" + sunrmin,
              sunset: (sunset.getHours()+2) + ":" + sunsmin
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
        max3: null,
        feels: null,
        day4: null,
        imgday4: null,
        min4: null,
        max4: null,
        day5: null,
        imgday5: null,
        min5: null,
        max5: null,
        sunrise: null,
        sunset: null
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
        max3: null,
        feels: null,
        day4: null,
        imgday4: null,
        min4: null,
        max4: null,
        day5: null,
        imgday5: null,
        min5: null,
        max5: null,
        sunrise: null,
        sunset: null
      })
    }
    var aq = await getAQ(lat,lon,process.env.UNSPLASH_KEY)
    if(lat || lon && aq){
      //onecall 1.0 api
      const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly&appid=${process.env.API_KEY}`
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
                max3: null,
                feels: null,
                day4: null,
                imgday4: null,
                min4: null,
                max4: null,
                day5: null,
                imgday5: null,
                min5: null,
                max5: null,
                sunrise: null,
                sunset: null
              })
            } else {
              const index = ["Good", "Fair", "Moderate", "Poor", "Very poor"]
              const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
              var date = new Date ()
              var sunrise = new Date (data.current.sunrise * 1000)
              if(sunrise.getMinutes()<10){
                var sunrmin = '0' + sunrise.getMinutes()
              } else {
                var sunrmin = sunrise.getMinutes()
              }
              var sunset = new Date (data.current.sunset * 1000)
              if(sunset.getMinutes()<10){
                var sunsmin = '0' + sunset.getMinutes()
              } else {
                var sunsmin = sunset.getMinutes()
              }
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
                max3: data.daily[3].temp.max,
                feels: data.current.feels_like,
                day4: days[(date.getDay() + 4) % 7],
                imgday4: "https://openweathermap.org/img/w/" + data.daily[4].weather[0].icon + ".png",
                min4: data.daily[4].temp.min,
                max4: data.daily[4].temp.max,
                day5:  days[(date.getDay() + 5) % 7],
                imgday5: "https://openweathermap.org/img/w/" + data.daily[5].weather[0].icon + ".png",
                min5: data.daily[5].temp.min,
                max5: data.daily[5].temp.max,
                sunrise: (sunrise.getHours() + 2) + ":" + sunrmin,
                sunset: (sunset.getHours() + 2) + ":" + sunsmin
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
          max3: null,
          feels: null,
          day4: null,
          imgday4: null,
          min4: null,
          max4: null,
          day5: null,
          imgday5: null,
          min5: null,
          max5: null,
          sunrise: null,
          sunset: null
        })
      }
    } else {
      console.log("Errore nelle coordinate o nell'air quality index. CONTROLLARE API")
    }
})

module.exports = router
