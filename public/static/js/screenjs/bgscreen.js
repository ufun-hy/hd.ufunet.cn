define('bgscreen',['jquery','videocontrol','swiper','layerBox'],function($,videocontrol,Swiper,layerBox){
var bgscreen = {
	bgbox:null,
	imgbox:null,
	imgswiper:null,
	videobox:null,
    playList:null,
    playData:null,
    init:function(imgList,playList,playData,fuc){
		var self = this;
		self.bgbox = $(".pcbgBox");
		self.bgbox.html('<div class="bgimgbox"></div><div id="bgvideobox" style="display:none"><div class="bgvideoboxCover"></div></div>');
		self.imgbox = self.bgbox.find('.bgimgbox');
		self.videobox = self.bgbox.find('#bgvideobox');
		self.imgList = imgList;
        self.playList = playList;
        self.playData = playData;
		fuc&&fuc();
    },
	initimgbox:function(){
		var self = this;
		self.destroyimgbox();
		if(self.imgList == null || self.imgList.length == 0){
            return layerBox.showMsg('请在后台设置大屏背景图');
		}
		self.imgbox.show();
		var html = '<div class="swiper-container swiper-bg">';
		html += '<div class="swiper-wrapper">';
			$.each(self.imgList,function(i,v){
				html += '<div class="swiper-slide" style="background-image:url('+v+')"></div>';
			});
		html += '</div>';
		html += '</div>';
		self.imgbox.html(html);
		self.imgswiper = new Swiper ('.swiper-bg', {
			autoplay: {
				delay: 10e3,
				stopOnLastSlide: false,
				disableOnInteraction: true,
			},
			effect : 'fade',
		});  
	},
	destroyimgbox:function(){
		var self = this;
		if(self.imgswiper != null) self.imgswiper.destroy();
		self.imgbox.hide();
	},
    setbgtype:function(x){
		var self = this;
		if(x=='1'){
			self.bgbox.show();
			self.videobox.hide();
            videocontrol.loop.close();
            self.videobox.find('video').remove();
			self.initimgbox();
		}else if(x=='2'){
			self.bgbox.show();
			self.videobox.show();
            self.destroyimgbox();
            if(self.playList==null || self.playList.length==0){
                return layerBox.showMsg('请在后台设置大屏背景视频');
			}
            self.setvideolight(5);
            videocontrol.loop.play(self.playList,self.playData,'bgvideobox');
        }else if(x=='3'){
			self.bgbox.show();
			self.destroyimgbox();
			self.videobox.hide();
            videocontrol.loop.close();
            self.videobox.find('video').remove();
		}else{
			self.bgbox.hide();
            self.destroyimgbox();
			self.videobox.hide();
            videocontrol.loop.close();
            self.videobox.find('video').remove();
        }
    },
    setvideolight:function(x){
		var self = this;
        var x = (10 - x) / 10;
        self.videobox.find('.bgvideoboxCover').css({opacity:x});
    }
};
return bgscreen;
});