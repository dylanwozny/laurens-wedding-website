 

window.onload = function() {
   const mobileMenuButton = document.querySelector('#mobile-menu-button')
   const mobileMenu = document.querySelector("#mobile-menu")
   let isOpen =false;

   mobileMenuButton.addEventListener("click", onRequestMenu);
   console.log(isOpen);

   // close menu
   function closeMenu(){
      mobileMenu.classList.toggle("hide-mobile-menu");
   }
  
   //   open on click
   function onRequestMenu(e){
      console.log("click");
      mobileMenu.classList.toggle("show-mobile-menu");        
   }

   // ----Creating logic for closing when anything else is clicked---
   // onclick >>>>>>
   // scrolling closes menu
   if(mobileMenu.classList("show-mobile-menu")){
      isOpen = true;
      console.log(isOpen);

   }

   else{
      isOpen = false;
      console.log(isOpen);

   }


   }




 
 