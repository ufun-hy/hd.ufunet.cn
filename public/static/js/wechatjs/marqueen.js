define('marqueen',['jquery'],function($){
	var marqueen = {
	timer:null,
	init:function(fclass,speed,nextTime,maxcount){
		var speed = speed||false;
		var nextTime = nextTime||false;
		var self = this;
		self.nextTime = nextTime||5e3;
		self.speed = speed||0.03;
		self.fclass = fclass;
		self.maxcount = maxcount||0;
		self.timer = setInterval(function(){
			self.gotoNext();
		},self.nextTime);
	},
	gotoNext:function(){
		var self = this;
		var nextEle = $(this.fclass).find('li').eq(0);
		if(nextEle.length == 0) return false;
		if(self.maxcount > 0){
			if($(this.fclass).find('li').length < self.maxcount) $(this.fclass).append(nextEle.clone());
		}else{
			$(this.fclass).append(nextEle.clone());
		}
		var rollwidth = self.isneedRoll(nextEle);
		if(rollwidth>0){
			clearInterval(self.timer); 
			var needTime = (rollwidth/self.speed/1000).toFixed(2);
			var h = "transform " + needTime + "s linear";
			nextEle.css({
				transition: h,
				"-moz-transition": h,
				"-webkit-transition": h,
				"-o-transition": h,
			}).css("transform", "translate(" + -(rollwidth+30) + "px)");
			nextEle[0].addEventListener("transitionend",function(){
				nextEle.animate({
					"margin-top":-nextEle.height(),
				},2e2,function(){
					nextEle.remove();
					self.timer = setInterval(function(){
						self.gotoNext();
					},self.nextTime);
					
				});
			}, true);
		}else{
			nextEle.animate({
				"margin-top":-nextEle.height(),
			},2e2,function(){
				nextEle.remove();
			});
		}
	},
	isneedRoll:function(nextEle){
		var rollwidth = nextEle[0].scrollWidth - $(this.fclass).width();
		return rollwidth>0?rollwidth:0;
	},
	destory:function(){
		clearInterval(this.timer); 
	},
};
return marqueen;
});
