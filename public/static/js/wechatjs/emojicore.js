define('emojicore',['jquery','swiper'],function($,Swiper){
var emojicore = {
	emotions:{
	"1": ["[微笑]", XCV3Config.staticurl+"images/wechat/emoji/1.png"],
	"2": ["[撇嘴]", XCV3Config.staticurl + "images/wechat/emoji/2.png"],
	"3": ["[色]", XCV3Config.staticurl + "images/wechat/emoji/3.png"],
	"4": ["[发呆]", XCV3Config.staticurl + "images/wechat/emoji/4.png"],
	"5": ["[得意]", XCV3Config.staticurl + "images/wechat/emoji/5.png"],
	"6": ["[流泪]", XCV3Config.staticurl + "images/wechat/emoji/6.png"],
	"7": ["[害羞]", XCV3Config.staticurl + "images/wechat/emoji/7.png"],
	"8": ["[闭嘴]", XCV3Config.staticurl + "images/wechat/emoji/8.png"],
	"9": ["[睡]", XCV3Config.staticurl + "images/wechat/emoji/9.png"],
	"10": ["[大哭]", XCV3Config.staticurl + "images/wechat/emoji/10.png"],
	"11": ["[尴尬]", XCV3Config.staticurl + "images/wechat/emoji/11.png"],
	"12": ["[发怒]", XCV3Config.staticurl + "images/wechat/emoji/12.png"],
	"13": ["[调皮]", XCV3Config.staticurl + "images/wechat/emoji/13.png"],
	"14": ["[龇牙]", XCV3Config.staticurl + "images/wechat/emoji/14.png"],
	"15": ["[惊讶]", XCV3Config.staticurl + "images/wechat/emoji/15.png"],
	"16": ["[难过]", XCV3Config.staticurl + "images/wechat/emoji/16.png"],
	"17": ["[酷]", XCV3Config.staticurl + "images/wechat/emoji/17.png"],
	"18": ["[冷汗]", XCV3Config.staticurl + "images/wechat/emoji/18.png"],
	"19": ["[抓狂]", XCV3Config.staticurl + "images/wechat/emoji/19.png"],
	"20": ["[吐]", XCV3Config.staticurl + "images/wechat/emoji/20.png"],
	"21": ["[偷笑]", XCV3Config.staticurl + "images/wechat/emoji/21.png"],
	"22": ["[冷酷]", XCV3Config.staticurl + "images/wechat/emoji/22.png"],
	"23": ["[白眼]", XCV3Config.staticurl + "images/wechat/emoji/23.png"],
	"24": ["[傲慢]", XCV3Config.staticurl + "images/wechat/emoji/24.png"],
	"25": ["[饥饿]", XCV3Config.staticurl + "images/wechat/emoji/25.png"],
	"26": ["[困]", XCV3Config.staticurl + "images/wechat/emoji/26.png"],
	"27": ["[惊恐]", XCV3Config.staticurl + "images/wechat/emoji/27.png"],
	"28": ["[流汗]", XCV3Config.staticurl + "images/wechat/emoji/28.png"],
	"29": ["[憨笑]", XCV3Config.staticurl + "images/wechat/emoji/29.png"],
	"30": ["[大兵]", XCV3Config.staticurl + "images/wechat/emoji/30.png"],
	"31": ["[奋斗]", XCV3Config.staticurl + "images/wechat/emoji/31.png"],
	"32": ["[咒骂]", XCV3Config.staticurl + "images/wechat/emoji/32.png"],
	"33": ["[疑问]", XCV3Config.staticurl + "images/wechat/emoji/33.png"],
	"34": ["[嘘]", XCV3Config.staticurl + "images/wechat/emoji/34.png"],
	"35": ["[晕]", XCV3Config.staticurl + "images/wechat/emoji/35.png"],
	"36": ["[折磨]", XCV3Config.staticurl + "images/wechat/emoji/36.png"],
	"37": ["[哀]", XCV3Config.staticurl + "images/wechat/emoji/37.png"],
	"38": ["[骷髅]", XCV3Config.staticurl + "images/wechat/emoji/38.png"],
	"39": ["[敲打]", XCV3Config.staticurl + "images/wechat/emoji/39.png"],
	"40": ["[再见]", XCV3Config.staticurl + "images/wechat/emoji/40.png"],
	"41": ["[擦汗]", XCV3Config.staticurl + "images/wechat/emoji/41.png"],
	"42": ["[抠鼻]", XCV3Config.staticurl + "images/wechat/emoji/42.png"],
	"43": ["[鼓掌]", XCV3Config.staticurl + "images/wechat/emoji/43.png"],
	"44": ["[糗大了]", XCV3Config.staticurl + "images/wechat/emoji/44.png"],
	"45": ["[坏笑]", XCV3Config.staticurl + "images/wechat/emoji/45.png"],
	"46": ["[左哼哼]", XCV3Config.staticurl + "images/wechat/emoji/46.png"],
	"47": ["[右哼哼]", XCV3Config.staticurl + "images/wechat/emoji/47.png"],
	"48": ["[哈欠]", XCV3Config.staticurl + "images/wechat/emoji/48.png"],
	"49": ["[鄙视]", XCV3Config.staticurl + "images/wechat/emoji/49.png"],
	"50": ["[委屈]", XCV3Config.staticurl + "images/wechat/emoji/50.png"],
	"51": ["[快哭了]", XCV3Config.staticurl + "images/wechat/emoji/51.png"],
	"52": ["[阴险]", XCV3Config.staticurl + "images/wechat/emoji/52.png"],
	"53": ["[亲亲]", XCV3Config.staticurl + "images/wechat/emoji/53.png"],
	"54": ["[吓]", XCV3Config.staticurl + "images/wechat/emoji/54.png"],
	"55": ["[可怜]", XCV3Config.staticurl + "images/wechat/emoji/55.png"],
	"56": ["[菜刀]", XCV3Config.staticurl + "images/wechat/emoji/56.png"],
	"57": ["[西瓜]", XCV3Config.staticurl + "images/wechat/emoji/57.png"],
	"58": ["[啤酒]", XCV3Config.staticurl + "images/wechat/emoji/58.png"],
	"59": ["[篮球]", XCV3Config.staticurl + "images/wechat/emoji/59.png"],
	"60": ["[乒乓]", XCV3Config.staticurl + "images/wechat/emoji/60.png"],
	"61": ["[咖啡]", XCV3Config.staticurl + "images/wechat/emoji/61.png"],
	"62": ["[饭]", XCV3Config.staticurl + "images/wechat/emoji/62.png"],
	"63": ["[猪头]", XCV3Config.staticurl + "images/wechat/emoji/63.png"],
	"64": ["[玫瑰]", XCV3Config.staticurl + "images/wechat/emoji/64.png"],
	"65": ["[凋谢]", XCV3Config.staticurl + "images/wechat/emoji/65.png"],
	"66": ["[示爱]", XCV3Config.staticurl + "images/wechat/emoji/66.png"],
	"67": ["[爱心]", XCV3Config.staticurl + "images/wechat/emoji/67.png"],
	"68": ["[心碎]", XCV3Config.staticurl + "images/wechat/emoji/68.png"],
	"69": ["[蛋糕]", XCV3Config.staticurl + "images/wechat/emoji/69.png"],
	"70": ["[闪电]", XCV3Config.staticurl + "images/wechat/emoji/70.png"],
	"71": ["[炸弹]", XCV3Config.staticurl + "images/wechat/emoji/71.png"],
	"72": ["[刀]", XCV3Config.staticurl + "images/wechat/emoji/72.png"],
	"73": ["[足球]", XCV3Config.staticurl + "images/wechat/emoji/73.png"],
	"74": ["[瓢虫]", XCV3Config.staticurl + "images/wechat/emoji/74.png"],
	"75": ["[便便]", XCV3Config.staticurl + "images/wechat/emoji/75.png"],
	"76": ["[月亮]", XCV3Config.staticurl + "images/wechat/emoji/76.png"],
	"77": ["[太阳]", XCV3Config.staticurl + "images/wechat/emoji/77.png"],
	"78": ["[礼物]", XCV3Config.staticurl + "images/wechat/emoji/78.png"],
	"79": ["[拥抱]", XCV3Config.staticurl + "images/wechat/emoji/79.png"],
	"80": ["[强]", XCV3Config.staticurl + "images/wechat/emoji/80.png"],
	"81": ["[弱]", XCV3Config.staticurl + "images/wechat/emoji/81.png"],
	"82": ["[握手]", XCV3Config.staticurl + "images/wechat/emoji/82.png"],
	"83": ["[胜利]", XCV3Config.staticurl + "images/wechat/emoji/83.png"],
	"84": ["[抱拳]", XCV3Config.staticurl + "images/wechat/emoji/84.png"],
	},
	emotionDataIndexs:{
	"[微笑]":1,
	"[撇嘴]":2,
	"[色]":3,
	"[发呆]":4,
	"[得意]":5,
	"[流泪]":6,
	"[害羞]":7,
	"[闭嘴]":8,
	"[睡]":9,
	"[大哭]":10,
	"[尴尬]":11,
	"[发怒]":12,
	"[调皮]":13,
	"[龇牙]":14,
	"[惊讶]":15,
	"[难过]":16,
	"[酷]":17,
	"[冷汗]":18,
	"[抓狂]":19,
	"[吐]":20,
	"[偷笑]":21,
	"[冷酷]":22,
	"[白眼]":23,
	"[傲慢]":24,
	"[饥饿]":25,
	"[困]":26,
	"[惊恐]":27,
	"[流汗]":28,
	"[憨笑]":29,
	"[大兵]":30,
	"[奋斗]":31,
	"[咒骂]":32,
	"[疑问]":33,
	"[嘘]":34,
	"[晕]":35,
	"[折磨]":36,
	"[哀]":37,
	"[骷髅]":38,
	"[敲打]":39,
	"[再见]":40,
	"[擦汗]":41,
	"[抠鼻]":42,
	"[鼓掌]":43,
	"[糗大了]":44,
	"[坏笑]":45,
	"[左哼哼]":46,
	"[右哼哼]":47,
	"[哈欠]":48,
	"[鄙视]":49,
	"[委屈]":50,
	"[快哭了]":51,
	"[阴险]":52,
	"[亲亲]":53,
	"[吓]":54,
	"[可怜]":55,
	"[菜刀]":56,
	"[西瓜]":57,
	"[啤酒]":58,
	"[篮球]":59,
	"[乒乓]":60,
	"[咖啡]":61,
	"[饭]":62,
	"[猪头]":63,
	"[玫瑰]":64,
	"[凋谢]":65,
	"[示爱]":66,
	"[爱心]":67,
	"[心碎]":68,
	"[蛋糕]":69,
	"[闪电]":70,
	"[炸弹]":71,
	"[刀]":72,
	"[足球]":73,
	"[瓢虫]":74,
	"[便便]":75,
	"[月亮]":76,
	"[太阳]":77,
	"[礼物]":78,
	"[拥抱]":79,
	"[强]":80,
	"[弱]":81,
	"[握手]":82,
	"[胜利]":83,
	"[抱拳]":84
	},
	init:function() {	
			if($(".zam-app-facebox .emo-list li").length>0) return;
			var e = this;
			var arr = Object.keys(e.emotions);
			var i = 0;
			var emo_html  = '<div class="emo-box"><div class="swiper-container" id="emo-slider">';
			emo_html  += '<div class="swiper-wrapper">';
			for (var index in e.emotions) {
				if(i%20==0){
					emo_html  += '<ul class="emo-list swiper-slide clearfix">';
					emo_html  += '<li class="emo-item zam-app-flex-ajCenter2"><img class="normalemoji" src="'+e.emotions[index][1]+'" id="'+e.emotions[index][0]+'"/> </li>';
					if((i+1)==arr.length){
						emo_html  += '<li class="emo-item delemojili zam-app-flex-ajCenter2"><img  class="delemoji" src="'+XCV3Config.staticurl+'images/wechat/emoji/fdel.png" /></li>';
						emo_html  += '</ul>';
					}
				}else{
					emo_html  += '<li class="emo-item zam-app-flex-ajCenter2"><img  class="normalemoji" src="'+e.emotions[index][1]+'" id="'+e.emotions[index][0]+'" /> </li>';
					if((i+1)%20==0 || (i+1)==arr.length){
						emo_html  += '<li class="emo-item delemojili zam-app-flex-ajCenter2"><img class="delemoji" src="'+XCV3Config.staticurl+'images/wechat/emoji/fdel.png"/></li>';
						emo_html  += '</ul>';
					}
				}
				i++;
			}
			emo_html  += '</div>'; 
			emo_html  += '<div class="swiper-pagination emo-page"></div>'; 
			emo_html  += '</div></div>';
			$(emo_html).appendTo($(".zam-app-facebox"));
			var option = {
				pagination: {
					el: '.emo-page',
					clickable:true
				},
				autoplay:false,
			};
			//if($(".zam-app-facewrapper").length > 0){
				option.observer = true;
				option.observeParents = true;
			//}
			new Swiper('#emo-slider',option);
	},
	emoToimg:function (txt) {
		if(!txt) return '';
		var e = this;
		txt = txt.toString();
		var patternemoji = /\[[\u4e00-\u9fa5]+\]/g;
		return txt.replace(patternemoji, function(match) {
			if(e.emotionDataIndexs[match]){
				return '<img src="' + e.emotions[e.emotionDataIndexs[match]][1] + '" class="faceImg" />'
			}
		})
	},
};
return emojicore;
});

