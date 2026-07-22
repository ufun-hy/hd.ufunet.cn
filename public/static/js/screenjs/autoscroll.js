/*
* @Author: 赞木
* @Date:   2022-07-03 20:30:03
* @Last Modified by:   赞木
* @Last Modified time: 2022-07-29 14:31:33
*/
define('autoscroll',['anime'],function(anime){
var autoscroll = {
	scrollY:30,
	initautoScroll:function(classname,scrolltype){
		var self = this;
		if($(classname).length <= 0){
			return false;
		}
		anime.remove(classname);
		$(classname).scrollTop(0);
		var self = this,scrollHeight = $(classname)[0].scrollHeight,height = $(classname).outerHeight(),maxscrollH = Math.ceil(scrollHeight - height);
		if(maxscrollH > 0){
			var animeobj = anime({
				targets:classname,
				scrollTop:maxscrollH,
				duration:(maxscrollH / self.scrollY ) * 1e3,
				direction: 'alternate',
  				loop: true,
				autoplay:true,
				delay:2e3,
				easing: 'linear',
				name:'autoscroll'
			});
			$(classname).hover(function() {
				animeobj.pause();
			}, function() {
				animeobj.play();
			});
		} 
	},
};
return autoscroll;
});
