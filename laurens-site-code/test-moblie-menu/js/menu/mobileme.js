 

window.onload = function() {
   const mobileMenuButton = document.querySelector('#mobile-menu-button')
   const mobileMenu = document.querySelector("#mobile-menu")
   let isOpen =false;
   mobileMenuButton.addEventListener("click", onRequestMenu);
  
  
   function onRequestMenu(e){
      console.log(click)
     mobileMenu.classList.add("show-mobile-menu") 
        isOpen = !isOpen;
        mobileMenu.classList.toggle("show-mobile-menu");
        mobileMenu.classList.toggle("hide-mobile-menu")
   
      
     }
  };


 
 