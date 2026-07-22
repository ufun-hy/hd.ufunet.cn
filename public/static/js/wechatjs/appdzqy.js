define('appdzqy',['appsocket','wechatcore'],function(appsocket,wechatcore){
	var lasttime = 0;
	var appdzqy = {
		device:'',
		rotateinfo:null,
		appbg:null,
		canvas:null,
		ctx:null,
		canvasw:0,
		canvash:0,
		drawstatus:false,
		drawtype:1,
		startp:null,
		linewidth:10,
		linecolor:"",
		img:null,
		maoconfig:{
			l:20,
			radius:0,
			linemin:20,
			linemax:40,
			linepressure:1,
			smoothness:90,
			has:[],
			arr:[],
		},
		init:function(rotate){
			var self = this;
			if(rotate!=''){
				self.initcanvas(rotate.mydevice);
			}
			self.bindEvent();
			self.initsocket();
		},
		resizeinit:function(rotate){
			var self = this;
			if(rotate!=''){
				self.initcanvas(rotate.mydevice);
			}
			self.bindEvent();
		},
		initsocket:function(){
			var self = this,params={};
			params.onmessage = function(data){
				if(data.type=='connected'){
					appsocket.isclose = false;
					self.connectsocket({clientid:data.clientid,rotateid:rotateInfo.id||'0',device:self.device});
				}else if(data.type=='clientrefresh'){
					wechatcore.reloadpage();
				}else if(data.type=='clientclear'){
					self.clear('2');
				}else if(data.type=='clientshowreadyimg'){
					self.clear('2');	
				}else if(data.type=='clientnextround'){
					window.location.href = data.url;
				}else if(data.type=='reselclient'){
					window.location.href = selClientBase + "&rotateid="+data.rotateid;
				}else if(data.type=='goto'){
					wechatcore.goto(data);
				}else if(data.type=='luckeruserids'){
					wechatcore.layerAsklucker(data);
				}
			};
			appsocket.init(params);
		},
		connectsocket:function(data){
			var self = this;
			data.module = XCV3Config.gametype;
			wechatcore.ajaxSubmit("/wechat/dzqy/binduid",data).then(function(data){
				if(data.code!=0){
					wechatcore.msg(data.msg);
				}else{
					console.log(data.msg);
				}
			}, function(){
				wechatcore.msg('网络太差链接socket服务失败，请稍后重试');
			});
		},
		senddata:function(obj){
			var self = this;
			var senddata = {
				type:'dzqydraw',
				hdid:XCV3Config.rhdid,
				rotateid:(rotateInfo.id||'0'),
				device:self.device,
			};
			$.extend(senddata,obj);
			appsocket.wssend(senddata);
		},
		initcanvas:function(mydevice){
			var self = this;
			if(!mydevice) return;
			var layindex = wechatcore.loading('正在连接云签约系统...');
			self.img = $(".maoimg")[0];
			self.device = 'device-'+mydevice.id;
			self.drawtype = mydevice.drawtype;
			self.linewidth = mydevice.linewidth;
			self.linecolor = mydevice.linecolor;
			self.maoconfig.l = mydevice.linewidth * 2;
			self.maoconfig.linemin = mydevice.linewidth * 1;
			self.maoconfig.linemax = mydevice.linewidth * 2;
			self.canvasw = window.innerWidth;
			self.canvash = window.innerHeight;
			self.canvas = $(".dzqybox")[0];
			self.canvas.style.width = self.canvasw + "px";
            self.canvas.style.height = self.canvash + "px";
            var dr = window.devicePixelRatio ? window.devicePixelRatio : 4;
			self.canvas.width = self.canvasw * dr;
			self.canvas.height = self.canvash * dr;
            var ctx = self.canvas.getContext("2d");
            ctx.scale(dr, dr);
			self.ctx = ctx;
			self.appbg = new Image;
			self.appbg.src = mydevice.appbg;
			self.appbg.onload = function () {
				self.ctx.drawImage(self.appbg, 0, 0,window.innerWidth, window.innerHeight);
				setTimeout(function(){
					wechatcore.close(layindex);
				},1e3);
			}
			self.appbg.onerror = function () {
				wechatcore.close(layindex);
			}
		},
		bindEvent:function(){
			var self = this,startX,startY,endX,endY;
			$(self.canvas).off("touchstart touchmove touchend").on("touchstart touchmove touchend", function (e) {
				switch (e.type) {
                    case "touchstart":
						self.drawstart(e);
                        break;
                    case "touchmove":
                        e.preventDefault();
						self.drawmoving(e);
                        break;
                    case "touchend":
						self.drawend(e);
                        break;
                }
			});
			$(self.canvas).off("mousedown mousemove mouseup").on("mousedown mousemove mouseup", function (e) {
				switch (e.type) {
                    case "mousedown":
						self.drawstart(e);
                        break;
                    case "mousemove":
                        e.preventDefault();
						self.drawmoving(e);
                        break;
                    case "mouseup":
						self.drawend(e);
                        break;
                }
			});
			self.canvas.addEventListener("contextmenu", function(e){ e.preventDefault() }, false);
			$(".clearcanvas").on('click',function(){
				self.clear();
			});
		},
		drawstart:function(e){
			var self = this;
			self.drawstatus = true;
			var point = self.getpoint(e);
			self.drawtype=='1'?self.drawLine(point):self.drawMao(point);
		},
		drawLine:function(p){
			var self = this;
			self.startp = p;
			self.senddata({point:p,isstart:1});
		},
		drawMao:function(p){
			var self = this;
			self.startp = p;
			self.maoconfig.arr.unshift(p);
			self.maoconfig.has = [];
			self.senddata({point:p,isstart:1});
		},
		drawmoving:function(e){
			var self = this;
			if(!self.drawstatus) return;
			var point = self.getpoint(e);
			self.drawtype=='1'?self.drawLineMoving(point):self.drawMaoMoving(point);
		},
		drawLineMoving:function(p){
			var self = this;
			self.ctx.beginPath();
			self.ctx.lineCap = "round";
			self.ctx.moveTo(self.startp.x, self.startp.y);
			self.ctx.lineTo(p.x, p.y);
			self.ctx.closePath();
			if(self.linecolor!=''){
				self.ctx.strokeStyle = self.linecolor;
			}
			self.ctx.lineWidth = self.linewidth;
			self.ctx.stroke();
			self.senddata({point:p,isstart:2});
			self.startp = p;
		},
		drawMaoMoving:function(p){
			var self = this;
			var nowtime = new Date().getTime();
			if(nowtime - lasttime < 1) {
				return;
			}else{
				lasttime = nowtime;
			}
			var oldpoint = self.startp;
			var bj = self.maoconfig.radius;
			self.maoconfig.has.unshift({time: nowtime,dis:self.distance(oldpoint,p)});
			var dis = 0;
			var time = 0;
			for (var n = 0; n < self.maoconfig.has.length-1; n++) {
				dis += self.maoconfig.has[n].dis;
				time += self.maoconfig.has[n].time - self.maoconfig.has[n+1].time;
				if (dis > self.maoconfig.smoothness) break;
			}
			var newbj = Math.min( time / dis * self.maoconfig.linepressure + self.maoconfig.linemin , self.maoconfig.linemax) / 2;
			var len = Math.round(self.maoconfig.has[0].dis / 2) + 1;
			for (var i = 0; i < len; i++) {
				var x = oldpoint.x + (p.x - oldpoint.x)/len*i;
				var y = oldpoint.y + (p.y - oldpoint.y)/len*i;
				var r = bj + (newbj - bj)/len*i;
				self.ctx.beginPath();
				self.ctx.lineCap = "round";
				x = x - self.maoconfig.l / 2;
				y = y - self.maoconfig.l / 2;
				self.maoconfig.arr.unshift({x,y});
				self.ctx.drawImage(self.img,x,y,self.maoconfig.l,self.maoconfig.l);
				self.maoconfig.l = self.maoconfig.l - 0.2;
				if(self.maoconfig.l < self.maoconfig.linemin) self.maoconfig.l = self.maoconfig.linemin;
			}
			self.maoconfig.radius = newbj;
			self.senddata({point:p,isstart:2,nowtime:nowtime});
			self.startp = p;
		},
		drawend:function(e){
			var self = this;
			self.drawstatus = false;
			if(self.drawtype=='2'){
				  self.maoconfig.l = self.linewidth * 2;
				  if(self.maoconfig.arr.length > 100){
					for(var j = 0; j < 60 ;j++){
					  self.maoconfig.arr[j].x = self.maoconfig.arr[j].x-self.maoconfig.l / 4;
					  self.maoconfig.arr[j].y = self.maoconfig.arr[j].y - self.maoconfig.l / 4;
					  //self.ctx.drawImage(self.img,self.maoconfig.arr[j].x,self.maoconfig.arr[j].y,self.maoconfig.l,self.maoconfig.l);
					  self.maoconfig.l = self.maoconfig.l - 0.3;
					  if(self.maoconfig.l < self.maoconfig.linemin/2) self.maoconfig.l = self.maoconfig.linemin/2;
					}
					self.maoconfig.l = self.maoconfig.linemax;
					self.maoconfig.arr = [];
				  }
				  if (self.maoconfig.arr.length==1) {
					self.maoconfig.arr = [];
				  }
				  self.senddata({isstart:3});
			}
		},
		getpoint:function(e){
			var self = this;
			var x = e.clientX?e.clientX:e.originalEvent.touches[0].clientX;
			var y = e.clientY?e.clientY:e.originalEvent.touches[0].clientY;
			return {
				x : x,
				y : y
			};
		},
		distance:function(a,b){
			var x = b.x - a.x , y = b.y - a.y;
			return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
		},
		clear:function(type){
			var self = this;
			self.startp = null;
			self.maoconfig.l = self.linewidth * 2;
			self.maoconfig.arr = [];
			self.maoconfig.has = [];
			self.ctx.clearRect(0, 0,self.canvas.width, self.canvas.height);
			self.ctx.drawImage(self.appbg, 0, 0,window.innerWidth, window.innerHeight);
			!type&&self.senddata({isstart:4});
		},
	};
	return appdzqy;
});