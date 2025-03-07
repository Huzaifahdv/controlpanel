(function(){
    const closeBanners = document.querySelectorAll(".js-banner__close");
    closeBanners.forEach( closeBanners => {
        closeBanners.addEventListener("click", event => {
            const banner = event.target.parentNode;
            banner.classList.add("collapse");

            banner.addEventListener("transitionend", function(event){
                if (event.target === this){
                    this.remove();
                }
            })
        })
    })
})();