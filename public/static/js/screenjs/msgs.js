define('msgs',['jquery','template','screencore','layerBox','layerExt'],function($,template,screencore,layerBox){
var msgs = {
msgNums:3,//大屏显示消息条数
rollTime:6,//大屏滚动时间间隔
isshowBigImg:'1',//是否开启放大图片
showBigImgtype:'2',//放大图片模式 1遇到图片就放大 2 仅放大一次 【刷新页面重来放大】
msgsList: [],
newmsgsList:[],
holdscreen:[],
ishold:false,
holdtimer:null,
index: 0,//开始
istransition: false,
bigindex:-1,
isbigtransition:false,
msgRender:null,
msgBigRender:null,
timer: void(0),
init:function(config){
	var e = this;
	e.msgNums = parseInt(config.msgnums)||3;
	e.rollTime = parseInt(config.rolltime)||6;
	e.isshowBigImg = config.showbigimg||'1';
	if(config.onlydm=='1'){
		e.isshowBigImg = '2';
	}
	e.showBigImgtype = config.bigimgtype||'2';
	e.historynums = config.historynums;
	e.showBigImgtime = parseInt(config.bigimgtime)||4;
	e.msgRender = template('msg-tpl');
	e.msgBigRender = template('msgbig-tpl');
	e.getMsgsList();
	$(".msgwall-lists").css({"display":"block","opacity":"1"});
	screencore.anicss(".msgwall-lists","bounceInUp");
},
getMsgsList: function() {
	var e = this;
	screencore.ajaxSubmit("/screen/msg/ajaxmsg",{hisnum:e.historynums}).then(function(data){
		if(data.code==0){
			var ajaxmsgs = data.msg.rows;
			var msgLength = ajaxmsgs.length;
			if(msgLength>0){
				ajaxmsgs = ajaxmsgs.reverse();
				for (var m=0;m<msgLength;m++) {
						var oneMsg = ajaxmsgs[m];
						e.msgsList.push({
							id:oneMsg.id,
							type:oneMsg.type,
							content: (oneMsg.content==''?'无消息内容':(oneMsg.type=='1'?screencore.emoToimg(oneMsg.content):oneMsg.content)),
							nickname:oneMsg.nickname,
							avatar:oneMsg.avatar,
							create_time:oneMsg.create_time,
						});
				};
				e.nextpage();
			}else{
				e.nextpage();
			}
			$(".joinPeople").html('<span>'+data.msg.total+'</span>条消息');
		}else{
			layerBox.showMsg(data.msg);
		}
	},function(){
		layerBox.showMsg('加载出错');
	});
},
nextpage:function(){
	var e = this;
	e.transition('after');
},
prevpage:function(){
	var e = this;
	e.transition('before');
},
firstpage:function(){
	var e = this;
	if(e.index == e.msgNums){
		layerBox.showMsg('已经到了第一页啦');
		return false;
	}
	e.transition('first');
},
lastpage:function(){
		var e = this;
		if(e.index==0||e.index==e.msgsList.length){
			layerBox.showMsg('已经到了最后一页啦');
			return false;
		}
		e.transition('last');
},
// 定时器初始化
startNext: function() {
	var e = this;
	if (e.timer != undefined) {
		 clearTimeout(e.timer);
	}
	e.timer = setTimeout(function() {
		e.nextpage();
	}, e.rollTime * 1000);
},
stopNext: function() {
	var e = this;
	if (e.timer != undefined) {
		 clearTimeout(e.timer);
	}
},
beforeTransition: function(state) {
		var e = this;
		if(state=='before'){
				if (e.msgsList.length <= e.msgNums) {//当消息总数小于等于4
					var start = 0;
					var end = e.msgsList.length;
				}else{ //大于4 
					if(e.index>0){//不是第一页
						if(e.index - e.msgNums>0){//剩余消息数量足一页
							var start = e.index - e.msgNums*2;
							var end = e.index-e.msgNums;
							e.index = end;//开启选取元素的位置
						}else{
							layerBox.showMsg('已经到了第一页');
							return false;
						}
					}else{//已经自动重置到了第一页
						//index = 0;
						if (e.msgsList.length % e.msgNums > 0) {//消息总数大于每页倍数
							var flag = e.msgsList.length - e.msgsList.length % e.msgNums;// 9 - 9%4 = 8
							var start = flag - e.msgNums;
							var end = flag;
						}else{//消息总数是每页倍数
							var start = e.msgsList.length - e.msgNums*2;// 8 - 8  = 0
							var end = e.msgsList.length - e.msgNums;// 8 - 4 = 4;
						}
						e.index = end;
						
					}
				}
				var items = e.msgsList.slice(start, end);//获取4条数据
				var html = '';
				for (var i = 0; i < items.length; i++) {
					items[i].content = items[i].content;
					html += e.msgRender(items[i]);
				}
				$('.wall-list').prepend(html);
				$('.wall-list .wall-item').addClass("newmsg wallnum-"+e.msgNums);
				return true;
		}else if(state=='after'){
				if (e.msgsList.length <= e.msgNums) {//当消息总数小于等于4
					var start = 0;
					var end = e.msgsList.length;//[1,2,3,4] length=4
					e.index = end;
					var items = e.msgsList.slice(start, end);//获取4条数据 不含end (0,4)
				}else{
					if(e.index<0){
						e.index = 0;		
					}
					if(e.msgsList.length - e.index>=e.msgNums){//剩余消息数量存在大于等于一页的数量
						var start = e.index;//0 4 
						var end = e.index  + e.msgNums;//4 8
						e.index = end;
						var items = e.msgsList.slice(start, end);
						if(e.newmsgsList.length>0){//检测是否有新发送的消息
							items = e.newmsgsList.splice(0,e.msgNums);//从新消息列表内取一页的数量
							var needNums = e.msgNums-items.length;
							if(needNums>0&&e.msgsList.length>e.msgNums){//新消息不足以一页
								e.index = e.index - items.length;
								if(e.index<0||e.index>=e.msgsList.length){
									e.index = 0;
								}
								var olditems = e.msgsList.slice(start,end-items.length);
								items = items.concat(olditems);
							}
						}else{
							if(e.index>=e.msgsList.length){
								e.index = 0;
							}
						}
				    }else{
						var start = e.index;
						var end = e.msgsList.length;
						var items = e.msgsList.slice(start, end);
						e.index = 0;//到了最后一页重置 改成从头开始
						
					}
				}
				var html = '';
				for (var i = 0; i < items.length; i++) {
					html += e.msgRender(items[i]);
				}
				$('.wall-list').append(html);
				$('.wall-list .wall-item').addClass("newmsg wallnum-"+e.msgNums);
				return true;
		}else if(state=='last'){//最后一页
			if (e.msgsList.length % e.msgNums > 0) {//总条数不满页 如多 1条 2条等
				e.index = e.msgsList.length - e.msgsList.length % e.msgNums;
			} else {
				e.index = e.msgsList.length - e.msgNums;
			};
			if(e.msgsList.length - e.index>=e.msgNums){//剩余消息数量足一页
				var start = e.index;//0 4 
				var end = e.index  + e.msgNums;//4 8
				e.index = end;
				if(e.index==e.msgsList.length){
					e.index = 0;
				}
			}else{
				var start = e.index;
				var end = e.msgsList.length;
				e.index = 0;//到了最后一页重置 改成从头开始
			}
			var items = e.msgsList.slice(start, end);
			var html = '';
			for (var i = 0; i < items.length; i++) {
				html += e.msgRender(items[i]);
			}
			$('.wall-list').append(html);
			$('.wall-list .wall-item').addClass("newmsg wallnum-"+e.msgNums);
			return true;
		}else if(state=='first'){//第一页
			var start = 0;
			var end = e.msgNums;
			e.index = end;
			var items = e.msgsList.slice(start, end);//获取4条数据
			var html = '';
			for (var i = 0; i < items.length; i++) {
				html += e.msgRender(items[i]);
			}
			$('.wall-list').prepend(html);
			$('.wall-list .wall-item').addClass("newmsg wallnum-"+e.msgNums);
			return true;
		}	
},

// 多个消息轮播切换
transition: function(state) {//after
	var e = this;
	if(state=='before'||state=='first'){
		//console.log(e.istransition);
	}
	if (e.istransition || !e.beforeTransition(state)) {
		return e.startNext();
	};
	e.istransition = true;
	var pageall = $('.wall-list');
	var itemall = $('.wall-list .wall-item');
	var scrollHei=  -(itemall.eq(0).outerHeight())*$('.wall-list .oldmsg').length + "px";
	if(itemall.length > e.msgNums){
		if(state=='after'||state=='last'){
			pageall.animate({
				"margin-top": scrollHei
			}, 500, function() {
				$('.wall-list .oldmsg').remove();
				itemall.removeClass("newmsg").addClass('oldmsg');
				pageall.css("margin-top", "0px");
				setTimeout(function(){
					e.istransition = false;
					if(e.isshowBigImg!='1'){
						e.startNext();
					}else{
						var needshowImg = e.showImgbox();
						if(!needshowImg){
							e.startNext();
						}
					}
				},3e2)
			});
			
		}else if(state=='before'||state=='first'){
			pageall.css({
				"margin-top": scrollHei
			});
			pageall.animate({
				"margin-top": "0px"
			}, 500, function() {
				$('.wall-list .oldmsg').remove();
				itemall.removeClass("newmsg").addClass('oldmsg');
				setTimeout(function(){
					e.istransition = false;
					if(e.isshowBigImg!='1'){
						e.startNext();
					}else{
						var needshowImg = e.showImgbox();
						if(!needshowImg){
							e.startNext();
						}
					}
				},3e2)
			});
		}
	}else{
		pageall.animate({
				"margin-top": scrollHei
		}, 500, function() {
			$('.wall-list .oldmsg').remove();
			itemall.removeClass("newmsg").addClass('oldmsg');
			pageall.css("margin-top", "0px");
			setTimeout(function(){
					e.istransition = false;
					if(e.isshowBigImg!='1'){
						e.startNext();
					}else{
						var needshowImg = e.showImgbox();
						if(!needshowImg){
							e.startNext();
						}
					}
			},3e2)
		});
		
	}
},
addOneMsgs:function(data){
  var e = this;
  var msgIndex = e.isExists(data.id);
  if(msgIndex==-1){
	var addMsg = {
		id:data.id,
		type:data.type,
		content: (data.content==''?'无消息内容':(data.type=='1')?screencore.emoToimg(data.content):data.content),
		nickname:data.nickname,
		avatar:data.avatar,
		sex:data.sex,
		create_time:data.create_time
	};
	if(e.msgsList.length > e.msgNums){
		e.newmsgsList.push(addMsg);
	}
	e.msgsList.push(addMsg);
	$(".joinPeople").html('<span>'+(parseInt($(".joinPeople span").text())+1)+'</span>条消息');
  }
},
isExists:function(msgid){
	var e = this;
	var msgindex = -1;
	for (var i = 0, len = e.msgsList.length; i < len; i++) {
		if (msgid == e.msgsList[i].id) {
			 msgindex = i;
			 break;
		}
	}	
	return msgindex;
},
delOneMsgs: function(msgid) {
	var e = this;
	var msgIndex = e.isExists(msgid);
	//删除消息
	if(msgIndex!=-1){
		 if ($('.msg-' + msgid).length > 0) {
			$('.msg-' + msgid).remove();
		 }
		 e.msgsList.splice(msgIndex,1);
	}
	if ($('.wall-list .wall-item').length == 0) {
		e.index = 0;
	}
	var totalNums = parseInt($(".joinPeople span").text())-1;
	$(".joinPeople").html('<span>'+(totalNums<0?0:totalNums)+'</span>条消息');
},
resetMsg:function(){
	var e = this;
	e.index = 0;
	e.msgsList = [];
	e.newmsgsList = [];
	$(".wall-list").empty();
	$(".joinPeople span").text(0);
},
pausestartclick:function(){
	var obj = $('.pause-start-page');
	if(XCV3Config.isiframe){
		obj = $(window.parent.document).find(".pause-start-page");
	}
	obj.trigger('click');
},
showImgbox:function () {
		var e = this;
        var p = [];
		var imgBox = e.showBigImgtype=='2'?$('.wall-list .oldmsg .msgImg').not('[data-hadshow="1"]'):$('.wall-list .oldmsg .msgImg');
        imgBox.length>0&&imgBox.each(function (r, q) {
			var n = $(this).attr("src"),msgid = $(this).attr("data-msgid").replace('msg-','');
			p.push({msgid:msgid,index: r,src: n})
		});
		if(p.length>0){
			e.pausestartclick();
			window.timerImg = 0;
			var o = layer.preview({
				photos: {
					data: p
				},
				tab: function (r, q, s) {
					var imgMsgindex = e.isExists(r.msgid);
					if(imgMsgindex!=-1){
						e.msgsList[imgMsgindex].hadshow = '1';
					}
					clearTimeout(window.timerImg),
					window.timerImg = setTimeout(function () {
						o && o.imgnext()
					}, e.showBigImgtime*1000)
				},
				limitArea: [$("body").width() - 100, $("body").height() - 100],
				last: function () {
					layer.close(o.index);
					e.pausestartclick();
				},
				previewClose: function () {
					layer.close(o.index);
					clearTimeout(window.timerImg);
					e.pausestartclick();
				}
			});
			return true;
		}else{
			return false;
		}
},
};
return msgs;
});
