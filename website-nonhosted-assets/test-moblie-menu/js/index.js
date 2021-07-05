"use strict";

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
    TweenLite.to(menuPanel, 0.4, { top: 45, ease: Power1.easeOut });
    menuOpen = true;
  };

  const closeMobileMenu = (e) => {
    menuPanel.removeEventListener("mouseleave", onLeavePanel);
    TweenLite.to(menuPanel, 0.4, {
      top: -menuPanel.clientHeight,
      ease: Power1.easeOut,
    });
    menuOpen = false;
  };
});

// Initialize and add the map
function initMap() {
  // The location of Uluru
  var dubrovnik = { lat: 42.65, lng: 18.092 };
  // The map, centered at Uluru
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: dubrovnik,
  });
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({ position: dubrovnik, map: map });
}
