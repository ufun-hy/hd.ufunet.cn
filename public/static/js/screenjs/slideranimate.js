define('slideranimate',['jquery'],function($){
var slideranimate = function(data){	
	this.id = ('pc-holdscreenAni-'+Math.random()+new Date().getTime()).replace('.','');
	this.data = data;
	this.isClose = false;
	this.firstDelay = data.firstDelay||0;
	this.first = true;
	this.offsetX = this.data.offsetX||0;
	this.offsetY = this.data.offsetY||0;
	this.hasOffset = this.data.hasOffset==null?true:this.hasOffset;
	this.bg = this.data.bg||'#999';
	this.init();
}
slideranimate.prototype = {
	init:function(){
		this.type = null;
		this.action = [this.animate1,this.animate2,this.animate3,this.animate4];
		var t = this;
		var e = this.data.img;
		this.boxTop = 0;
		this.boxLeft = 0;
		if(this.data.isNew){
			this.boxLeft = (e.parentNode.offsetWidth-e.width)/2;	
			this.boxTop = (e.parentNode.offsetHeight-e.height)/2;
			this.boxLeft = this.boxLeft<0?0:this.boxLeft;
			this.boxTop = this.boxTop<0?0:this.boxTop;	
		}
		$(window).bind('resize.slideranimate',function(){
			if(t.type==null){
				return;
			}
			if(e.naturalWidth/e.naturalHeight>=1){	
				t.boxLeft = (e.parentNode.offsetWidth - e.width)/2;	
				t.boxTop = (e.parentNode.offsetHeight-e.height)/2;
				t.boxLeft = t.boxLeft<0?0:t.boxLeft;
				t.boxTop = t.boxTop<0?0:t.boxTop;
				t.reset.call(t);			
			}else{
				var w = $('body').height()*(e.naturalWidth/e.naturalHeight);
				$(e.parentNode).css({width:w});
				setTimeout(function(){
					t.boxLeft = (e.parentNode.offsetWidth - e.width)/2;	
					t.boxTop = (e.parentNode.offsetHeight-e.height)/2;
					t.boxLeft = t.boxLeft<0?0:t.boxLeft;
					t.boxTop = t.boxTop<0?0:t.boxTop;
					t.reset.call(t);	
				},2e2);
			}
		});
	},
	createOne:function(x,y,z,img,offsetLeft,offsetTop){
		var box = document.createElement('div');
		$(box).css({
			'width':x,'height':y,left:offsetLeft*-1,top:offsetTop*-1,
			'-webkit-perspective':(x)+'px',
			'perspective':(x)+'px'
		});
		box.className = 'oneSliderOut';		
		var div = document.createElement('div');
		div.className = 'oneSliderInner';
		$(div).css({
			'width':'100%','height':'100%','position':'relative',
			'z-index':9,
			'transform-style':'preserve-3d',
			'transform':'translateZ('+(z/2*-1)+'px) rotateY(0deg)'
		}).attr({tz:z/2*-1});
		var div1 = document.createElement('div');
		$(div1).css({
			'width':'100%','height':'100%',
			'transform':'translateZ('+z*0.5+'px)'
		});
		div1.innerHTML = '<img style="left:'+(offsetLeft+this.data.offsetX)+'px; top:'+(offsetTop+this.data.offsetY)+'px; width:'+img.width+'px; height:'+img.height+'px; " src="'+img.src+'" />';
		var div2 = document.createElement('div');
		$(div2).css({
			'width':z,'height':'100%',
			'left':z*-1,top:0,
			'transform-origin':'right', 
			'transform':'translateZ('+z*0.5+'px) rotateY(-90deg)'
		});
		var div3 = document.createElement('div');
		$(div3).css({
			'width':z,'height':'100%',
			'left':x,top:0,
			'transform-origin':'left', 
			'transform':'translateZ('+z*0.5+'px) rotateY(90deg)'
		});
		var div3 = document.createElement('div');
		$(div3).css({
			'width':z,'height':'100%',
			'left':x,top:0,
			'transform-origin':'left', 
			'transform':'translateZ('+z*0.5+'px) rotateY(90deg)'
		});
		var div4 = document.createElement('div');
		$(div4).css({
			'width':'100%','height':z,
			'left':0,top:z*-1,
			'transform-origin':'bottom', 
			'transform':'translateZ('+z*0.5+'px) rotateX(90deg)'
		});

		var div5 = document.createElement('div');
		$(div5).css({
			'width':'100%','height':z,
			'left':0,top:y,
			'transform-origin':'top', 
			'transform':'translateZ('+z*0.5+'px) rotateX(-90deg)'
		});
		var div6 = document.createElement('div');
		$(div6).css({
			'width':'100%','height':'100%',
			'left':0,top:0,
			'transform-origin':'top', 
			'transform':'translateZ('+z*-0.5+'px) rotateY(-180deg)'
		}).addClass('oneSliderBack');
		div6.innerHTML = '<img style="left:'+(offsetLeft+this.data.offsetX)+'px; top:'+(offsetTop+this.data.offsetY)+'px; width:'+img.width+'px; height:'+img.height+'px; " src="'+img.src+'" />';
		div.innerHTML = div1.outerHTML+div2.outerHTML+div3.outerHTML+div4.outerHTML+div5.outerHTML+div6.outerHTML;
		box.innerHTML = div.outerHTML;
		return box.outerHTML;
	},
	create:function(img,box,num){
		num = num==null?0:num;	
		var width = img.parentNode.offsetWidth,height = img.parentNode.offsetHeight;

		var div = document.createElement('div');
		div.id = this.id;
		div.className = 'sliderImageBox';
		$(div).css({left:this.boxLeft,top:this.boxTop,width:width,height:height});
		var len = this.cutX*this.cutY;
		var oneWidth = Math.ceil(width/this.cutX);
		var oneHeight = Math.ceil(height/this.cutY);
		var html = '';
		for(var x=0;x<len;x++){
			var offsetLeft = (x%this.cutX)*oneWidth*-1;
			var offsetTop = parseInt(x/this.cutX)*oneHeight*-1;
			offsetLeft = Math.ceil(offsetLeft);
			offsetTop = Math.ceil(offsetTop);
			html += this.createOne(oneWidth,oneHeight,this.z,img,offsetLeft,offsetTop,num);
		}
		html += '<div style="clear:both"></div>';
		div.innerHTML = html;
		$('.sliderImageBox').remove();
		$(div).appendTo(box);
	},
	getRandom:function(begin,end){
		return parseInt(Math.random()*((end>begin?end-begin:begin-end)+1)+(end>begin?begin:end));	
	},
	animate1:function(){
		this.type = 1;
		this.cutX = 4;
		this.cutY = 5;
		this.z = 10;
		this.create(this.data.img,this.data.box);
		$(this.data.img).css({visibility:'hidden'});
		var box = this.data.box;
		var list = ['animate1_s1','animate1_s2','animate1_s3','animate1_s4','animate1_s5','animate1_s6','animate1_s7'];
		var t = this;
		var arr = $(box).find('.oneSliderInner');
		setTimeout(function(){
			for(var x=0;x<arr.length;x++){
				(function(x){
					var cn = list[t.getRandom(0,6)];
					var delay = t.getRandom(0,200);
					setTimeout(function(){
						$(arr[x]).addClass(cn);	
					},delay);				
				})(x);
			}			
		},t.first?t.firstDelay:0);
		setTimeout(function(){
			$('#'+t.id).remove();
			$(t.data.img).css({visibility:'visible'});	
		},t.first?(t.firstDelay+2300):2300);
	},
	animate2:function(){
		this.type = 2;
		this.cutX = 1;
		this.cutY = 10;
		this.z = 80;
		this.create(this.data.img,this.data.box);
		$(this.data.img).css({visibility:'hidden'});	
		var box = this.data.box;
		var t = this;
		var arr = $(box).find('.oneSliderInner');
		setTimeout(function(){
			for(var x=0;x<arr.length;x++){
				(function(x){
					setTimeout(function(){
						$(arr[x]).addClass('animate2_s1');	
					},x*80);				
				})(x);
			}
		},t.first?t.firstDelay:0);
		setTimeout(function(){
			$('#'+t.id).remove();
			$(t.data.img).css({visibility:'visible'});	
		},t.first?(t.firstDelay+2000):2000);
	},
	animate3:function(){
		this.type = 3;
		this.cutX = 1;
		this.cutY = 8;
		this.z = 10;
		this.create(this.data.img,this.data.box);
		$(this.data.img).css({visibility:'hidden'});	
		var box = this.data.box;
		var t = this;
		var arr = $(box).find('.oneSliderInner');
		setTimeout(function(){
			for(var x=0;x<arr.length;x++){
				(function(x){
					setTimeout(function(){
						$(arr[x]).addClass('animate3_s1');	
					},x*60);				
				})(x);
			}
		},t.first?t.firstDelay:0);
		setTimeout(function(){
			$('#'+t.id).remove();
			$(t.data.img).css({visibility:'visible'});	
		},t.first?(t.firstDelay+1500):1500);
	},
	animate4:function(){
		this.type = 4;
		this.cutX = 3;
		this.cutY = 5;
		var len = this.cutX*this.cutY;
		var half = (len-1)/2;
		this.z = 10;
		this.create(this.data.img,this.data.box,'4');
		$(this.data.img).css({visibility:'hidden'});	
		var box = this.data.box;
		var t = this;
		var arr = $(box).find('.oneSliderInner');
		setTimeout(function(){
			for(var x=0;x<arr.length;x++){
				if(x==0||x==2||x==4||x==6||x==8||x==10||x==12||x==14)
					$(arr[x]).addClass('animate4_s1');
				else
					$(arr[x]).addClass('animate4_s2');
			}
		},t.first?t.firstDelay:0);
		setTimeout(function(){
			$('#'+t.id).remove();
			$(t.data.img).css({visibility:'visible'});	
		},t.first?(t.firstDelay+1400):1400);
	},
	auto:function(){
		var t = this; 
		var fn = function(){
			if(t.action.length==0)
				t.action = [t.animate1,t.animate2,t.animate3,t.animate4];
			var x = t.getRandom(0,t.action.length-1);
			t.action[x].call(t);
			t.action.splice(x,1);
			t.first = false;				
		}
		setTimeout(function(){
			fn();				
		},0);
		this.timeout = setInterval(function(){
			if(!t.isClose)
				fn();			
		},7000);
	},
	reset:function(){
		if(this.type==null)
			return;
		this.create(this.data.img,this.data.box,this.type);	
	},
	close:function(){
		this.isClose = true;
		clearInterval(this.timeout);
		$(window).unbind('resize.slideranimate');	
	}
};
return slideranimate;
});

