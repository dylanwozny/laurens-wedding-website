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



window.addEventListener("load", function (event) {
  let menuOpen = false;
  const mobileMenuButton = document.querySelector("#mobile-menu-button");
  const menuLinks = document.querySelectorAll(".mobile-link");
  const menuPanel = document.querySelector("#menu-panel");

});