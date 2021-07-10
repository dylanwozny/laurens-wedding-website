 

   const mobileMenuButton = document.querySelector('#mobile-menu-button')
   const mobileMenu = document.querySelector("#mobile-menu")
   let isOpen =false;

   // event listener
   mobileMenuButton.addEventListener("click", onRequestMenu);

   // toggle menu function
   function onRequestMenu(){
      mobileMenu.classList.toggle("show-mobile-menu");  
   }

   // close menu on scroll
   window.onscroll = function(){
      if(mobileMenu.classList.contains('show-mobile-menu')){
         mobileMenu.classList.toggle("show-mobile-menu"); 
      }
      
   }

   // GOOD EXPLINATION ON THIS 
   // https://gomakethings.com/checking-event-target-selectors-with-event-bubbling-in-vanilla-javascript/

   // hide menu when mouse has been clicked outside
   // when the mouse clicks anything other than the hamburger menu or the 
   // mobile menu 
   window.addEventListener('click', function(e){
      if (!mobileMenu.contains(e.target) && (!mobileMenuButton.contains(e.target))){
         mobileMenu.classList.remove("show-mobile-menu"); 
    } 
  })
   



   



 
 