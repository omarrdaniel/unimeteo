var scelta = document.getElementById("switch")

function setLight () {
  document.getElementById('card').style.backgroundColor = "rgba(255, 255, 255, 0.8)"
  document.getElementById('card').style.color = "black"
  document.getElementById('search-bar').style.backgroundColor = "rgba(135, 135, 135, 0.7)"
  document.getElementById('search').style.backgroundColor = "rgba(135, 135, 135, 0.7)"
}

function setDark () {
  document.getElementById('card').style.backgroundColor = "#000000d0"
  document.getElementById('card').style.color = "white"
  document.getElementById('search-bar').style.backgroundColor = "#7c7c7c2b"
  document.getElementById('search').style.backgroundColor = "#7c7c7c2b"
}

document.addEventListener('DOMContentLoaded', function () {
  //funzione per leggere il json e impostare switch dark mode
  const choice = JSON.parse(localStorage.getItem('mode'))
  if(choice.lightMode){
    scelta.checked=true
    setLight()
  } else {
    scelta.checked=false
    setDark()
  }
});

scelta.addEventListener('change', function () {
  if(scelta.checked){
    const obj = {
      lightMode: true,
    }
    localStorage.setItem('mode', JSON.stringify(obj));
  } else {
    const obj = {
      lightMode: false,
    }
    localStorage.setItem('mode', JSON.stringify(obj));
  }
});
