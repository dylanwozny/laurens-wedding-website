// Initialize and add the map
function initMap() {
  // The location of Uluru
  var uluru = { lat: 42.65, lng: 18.08 };
  // The map, centered at Uluru
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: uluru,
  });
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({ position: uluru, map: map });
}

("use strict");

window.addEventListener("load", function (event) {
  let menuOpen = false;
  const mobileMenuButton = document.querySelector("#mobile-menu-button");
  const menuLinks = document.querySelectorAll(".mobile-link");
  const menuPanel = document.querySelector("#menu-panel");

  Array.from(menuLinks).forEach((item) => {
    item.addEventListener("click", function () {
      menuPanel.removeEventListener("mouseleave", onLeavePanel);
      closeMobileMenu();
    });
  });

  mobileMenuButton.onclick = (e) => {
    menuOpen ? closeMobileMenu() : openMobileMenu();
  };
  function onLeavePanel() {
    closeMobileMenu();
  }
  const openMobileMenu = (e) => {
    menuPanel.addEventListener("mouseleave", onLeavePanel);
    TweenLite.to(menuPanel, 0.5, { top: 65, ease: Power1.easeOut });
    menuOpen = true;
  };

  const closeMobileMenu = (e) => {
    menuPanel.removeEventListener("mouseleave", onLeavePanel);
    TweenLite.to(menuPanel, 0.8, {
      top: -550,
      ease: Power1.easeOut,
    });
    menuOpen = false;
  };
});

const API_KEY = "1234";
const options = { write: __dirname + "/data" };
const qpx = require("google-flights-api")(API_KEY, options);

const q = {
  adultCount: 1,
  maxPrice: "EUR5000",
  solutions: 1,
  origin: "DUB",
  destination: "GDN",
  date: "2016-12-14",
};
qpx
  .query(q)
  .then((data) => {
    //data looks like: [ { airline: 'SK', price: 'EUR71.10' } ]
  })
  .catch(console.error);
