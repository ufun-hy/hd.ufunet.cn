define('bthreed',['jquery'],function($){
var bthreed = { 
		init:function(params){
			var e = this;
			e.params  = params;
			e.canvas = document.getElementById("cas");
			e.context = e.canvas.getContext('2d');
			e.canvas.width = params.width||1366;
			e.canvas.height = params.height||727;
			e.cjd = params.cjd||16;
			e.tjd = params.tjd||14;
			e.ljd = params.ljd||15;
		},
		textShape:function(text,tjd){
			var e = this;
			e.canvas.width = e.params.width||1366;
			e.canvas.height = e.params.height||727;
			var fontSize = (text.length < 5 ? 330 : (text.length==5 ? 280 : (text.length==6 ? 230 : (text.length==7 ? 200 : 170))));
			if(text.toString().indexOf('/') != -1){
				fontSize = Math.min(fontSize, e.canvas.width / e.context.measureText(text).width * 1 * fontSize, e.canvas.height / fontSize * 0.45 * fontSize);
				var fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, microsoft yahei, sans-serif';
				e.context.font = "bold " + fontSize + "px " + fontFamily;//fontSize + "px bold";
				e.context.textAlign = "center";
				e.context.textBaseline = "middle";
				e.context.fillText(text.substr(0,text.toString().indexOf('/')), e.canvas.width / 2, e.canvas.height * 0.25);
				e.context.fillText(text.substr(text.toString().indexOf('/')+1), e.canvas.width / 2, e.canvas.height * 0.75);
			}else{
				e.context.font = fontSize + "px bold";
				e.context.textAlign = "center";
				e.context.textBaseline = "middle";
				e.context.fillText(text, e.canvas.width / 2, e.canvas.height / 2);
			}
			var ddots = e.getDots(!tjd?e.tjd:tjd);
			return  JSON.stringify(ddots);
		},
		logoShape:function(src,callback,ljd){
			var e = this;
			var img = new Image();
			img.onload = function() {
				var proportion = img.naturalWidth / img.naturalHeight;//宽高比
				var cas_h =  e.canvas.height;
				var cas_w = proportion * cas_h;
				if (cas_w > $(window).width()) {
					cas_w = $(window).width();
					cas_h = cas_w / proportion
                 }
				e.canvas.width = cas_w;
				e.canvas.height = cas_h;
				e.context.drawImage(img,0,0,cas_w,cas_h);
				var ddots = e.getDots(!ljd?e.ljd:ljd);
				ddots = JSON.stringify(ddots);
				callback(ddots);
				
			}
			img.src = src;		
		},
		countShape:function(text,cjd){
					var e = this;
					e.canvas.width = e.params.width||1366;
					e.canvas.height = e.params.height||727;
					var fontSize = 600;
					var fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, microsoft yahei, sans-serif';
					e.context.font = "bold " + fontSize + "px " + fontFamily;//fontSize + "px bold";
					e.context.textAlign = "center";
					e.context.textBaseline = "middle";
					e.context.fillText(text, e.canvas.width / 2, e.canvas.height / 2);
					var ddots = e.getDots(!cjd?e.cjd:cjd);
					ddots = JSON.stringify(ddots);
					return ddots;
		},
		getDots:function(d){
			  d = parseInt(d);
			  var e = this;
			  var imgData = e.context.getImageData(0, 0, e.canvas.width, e.canvas.height);
			  var pixs = imgData.data;
			  e.context.clearRect(0, 0, e.canvas.width, e.canvas.height);
			  var dots = [];
			  for (var x = 0; x < imgData.width; x += d) {
				for (var y = 0; y < imgData.height; y += d) {
				  var i = (y * imgData.width + x) * 4;
				  if (pixs[i + 3] > 128) {
					dots.push({
						  x:x - imgData.width / 2, 
						  y:y - imgData.height / 2,
					});
				  }
				}
			  }
			  return dots;
		},		
};
return bthreed;
});