/*
* @Author: 赞木
* @Date:   2021-10-19 11:25:59
* @Last Modified by:   赞木
* @Last Modified time: 2021-10-19 15:25:46
*/
define('screencubecj',['screencore','template','layerBox','fulldm','keyboard','snabbt'],function(screencore,template,layerBox,lotteryani,keyboardJS){
	var screencubecj = {
	prizeIndex:0,
	prizeInfo:null,
	alluser:[],
	changeTimer:null,
	luckerRender:null,
	luckerids:[],
	init:function(){
		var self = this;
		self.luckerRender = template('lucker-tpl');
		self.initdata();
	},
	initdata:function(){
		var self = this;
		screencore.ajaxSubmit('/screen/lottery/initdata',{'gametype':XCV3Config.gametype}).then(function(json){
			if(json.code==0){
				self.alluser = json.msg.list;
				if(self.alluser.length > 0 ) self.maxid = self.alluser[0].userid;
				$(".left-joinnums span").text(json.msg.total);
				self.prizeInfo = json.msg.prizelist;
				if(self.prizeInfo.length>0){
					self.initprizeinfo(true);
					self.bindevent();
					$(".start-btn").removeClass('stopclick');
					$(".lottery-wrapper").removeClass('hidden').animateControl('bounceInDown');
				}else{
					$(".lottery-mainbox .emptybox").removeClass('display-none');
				}
			}else{
				layerBox.showMsg(json.msg);
			}
		}, function(){
		   layerBox.showMsg('网络异常，数据加载出错');
		});
	},
	initprizeinfo:function(isfirst){
		var self = this,isfirst = isfirst||false,leftBox = $(".lottery-left"),prizeOne = self.prizeInfo[self.prizeIndex];
		if(!prizeOne) return;
		leftBox.find('.left-award').text(prizeOne.awardname);
		leftBox.find('.left-prizename').text(prizeOne.prizename);
		leftBox.find('.left-prizeimg img').attr('src',prizeOne.prizeimg);
		leftBox.find('#prize_number').val(prizeOne.onceout);
		$(".lottery-right .title-left span").text(prizeOne.prizenum);
		self.getprizelucker(prizeOne.id);
		if(isfirst){
			self.init3d({shape:prizeOne.anishape,shapeTime:10e3});
		}else{
			self.changeShape(prizeOne.anishape);
		}
		
	},
	bindevent:function(){
		var self = this;
		$(".start-btn").click(function(){
				var $this = $(this);
				if(self.prizeInfo.length <= 0){
					return layerBox.showMsg('请到后台添加奖品');
				}
				if(self.alluser.length <= 0){
					return layerBox.showMsg('抽奖人数不足');
				}
				var selnum = $("#prize_number").val();
				if(!selnum || selnum==''){
					return layerBox.showMsg('请设置抽奖人数');
				}
				if($(".right-reward-box .right-lucker").length >= self.prizeInfo[self.prizeIndex].prizenum){
					return layerBox.showMsg('当前奖品已抽满');
				}
				if($this.hasClass('stopclick')) return false;
				$this.addClass('stopclick');
				self.changeuser(selnum);
				$(".lottery-userBox").removeClass('hidden');
				$(".signthreed-wall-block").animateControl('zoomIn');
				$(".lottery-wrapper").addClass('hidden');
				$(".wall3d").removeClass('hidden');
				screencore.ajaxSubmit('/screen/lottery/savelucker',{gametype:XCV3Config.gametype,prizeid:self.prizeInfo[self.prizeIndex].id,selnum:selnum}).then(function(json){
					if(json.code==0){
						$(".lottery-stop-btn").show();
						self.luckerids = json.msg.luckerids;
						$(".title-right span").text(json.msg.total);
						var outluckerRender = template('outlucker-tpl');
						var luckerRender = template('lucker-tpl');
						var html = '';
						var luckhtml = '';
						$.each(json.msg.list,function(i,v){
							var nickname = '';
							if(v.showitems.length > 0){
								var bdval = '';
								$.each(v.showitems,function(index,val){
									  bdval += '<div>'+val+'</div>';
								});
								nickname += bdval;
							}else{
								nickname += '<div>'+v.nickname+'</div>';
							}
							v.nickname = nickname;
							html += outluckerRender(v);
							luckhtml += luckerRender(v);
						});
						$(".lottery-popBox-prize span").eq(0).text(self.prizeInfo[self.prizeIndex].awardname);
						$(".lottery-popBox-prize span").eq(1).text(self.prizeInfo[self.prizeIndex].prizename);
						$(".lottery-luckers-wrapper").html(html);
						$(".right-reward-box").prepend(luckhtml);
						
					}else{
						$(".wall3d").addClass('hidden');
						$(".lottery-userBox").addClass('hidden');
						$(".lottery-stop-btn").hide();
						$(".lottery-luckers").addClass('hidden');
						$(".lottery-wrapper").removeClass('hidden').animateControl('bounceInDown');
						layerBox.showMsg(json.msg);
						clearInterval(self.changeTimer);
					}
					setTimeout(function(){
						$this.removeClass('stopclick');
					},1e3);
				}, function(){
				  $this.removeClass('stopclick');
				  clearInterval(self.changeTimer);
				  $(".lottery-luckers-wrapper").empty();
				  layerBox.showMsg('网络异常，抽奖出错');
				});
				
		});
		$(".lottery-stop-btn").on('click',function(){
				$(".wall3d").addClass('hidden');
				$(".lottery-userBox").addClass('hidden');
				$(".lottery-stop-btn").hide();
				$(".lottery-luckers").removeClass('hidden').addClass('lottery-popBox-ani');
				clearInterval(self.changeTimer);
				screencore.ajaxSubmit('/screen/common/sendluckeralert',{gametype:'lottery',luckerids:self.luckerids}).then(function(e){
					self.luckerids = [];
				});
				
		});
		$(".lottery-close-btn").on('click',function(){
				$(".lottery-luckers").removeClass('lottery-popBox-ani').addClass('hidden');
				$(".lottery-wrapper").removeClass('hidden').animateControl('bounceInDown');
		});
		$(".lottery-wrapper .next").on('click',function(){
			var leftBox = $(".lottery-left");
			self.prizeIndex++;
			if(self.prizeIndex >= self.prizeInfo.length){
				self.prizeIndex = 0;
			}
			self.initprizeinfo();
		});
		$(".lottery-wrapper .prev").on('click',function(){
			var leftBox = $(".lottery-left");
			self.prizeIndex--;
			if(self.prizeIndex < 0){
				self.prizeIndex = self.prizeInfo.length - 1;
			}
			self.initprizeinfo();
		});
		$("#prize_decrement").on('click',function(){
			var denum = parseInt($("#prize_number").val());
			if(denum>1){
				denum--;
			}else{
				denum = 1;
			}
			var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".right-reward-box .right-lucker").length;
			if(cannums==0){
				denum = cannums;
			}
			$("#prize_number").val(denum);
		});
		$("#prize_increment").on('click',function(){
			var denum = parseInt($("#prize_number").val());
			denum++;
			if(denum>=self.prizeInfo[self.prizeIndex].prizenum){
				denum = self.prizeInfo[self.prizeIndex].prizenum;
			}
			var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".right-reward-box .right-lucker").length;
			if(denum>=cannums){
				denum = cannums;
			}
			$("#prize_number").val(denum);
		});
		$("#prize_number").on('blur',function(){
			var denum = parseInt($("#prize_number").val());
			if(!denum||denum==''){
				denum = 1;
			}
			if(denum>=self.prizeInfo[self.prizeIndex].prizenum){
				denum = self.prizeInfo[self.prizeIndex].prizenum;
			}
			var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".right-reward-box .right-lucker").length;
			if(denum>=cannums){
				denum = cannums;
			}
			$("#prize_number").val(denum);
		});
		$(".right-reward-box").on('click',".right-luckerdel",function(){
			var $this = $(this),recordid = $this.attr('data-id');
			layerBox.showConfirm('警告','删除将无法恢复，确定要删除此中奖用户么?',['确定','取消'],function(){
				screencore.ajaxSubmit('/screen/lottery/dellucker',{recordid:recordid,prizeid:self.prizeInfo[self.prizeIndex].id,gametype:XCV3Config.gametype},'').then(function(json){
					if(json.code==0){
						$this.parent().parent().remove();
						$(".title-right span").text(json.msg);
						layerBox.showMsg('删除成功');
					}else{
						layerBox.showMsg(json.msg);
					}
				});
			});
		});
		keyboardJS.bind('space', function(e) {
			if($(".lottery-luckers").is(":hidden")){
				if($(".wall3d").is(":hidden")&&$(".lottery-stop-btn").is(":hidden")) {
					$(".start-btn").trigger('click');
				}else{
					$(".lottery-stop-btn").trigger('click');
				}
			}else{
				$(".lottery-close-btn").trigger('click');
			}
		});
		keyboardJS.bind('left', function(e) {
			$(".lottery-wrapper .prev").trigger('click');
		});
		keyboardJS.bind('/', function(e) {
			layerBox.showConfirm('警告','清空将删除当前奖品的所有中奖用户，并且无法恢复，您确定要清空？',['确定','取消'],function(){
				screencore.ajaxSubmit('/screen/lottery/delalllucker',{prizeid:self.prizeInfo[self.prizeIndex].id,gametype:XCV3Config.gametype},'').then(function(e){
					if(e.code==0){
						self.getprizelucker(self.prizeInfo[self.prizeIndex].id);
						layerBox.showMsg('清空成功');
					}else{
						layerBox.showMsg(e.msg);
					}
				});
			});
		});
		keyboardJS.bind('right', function(e) {
			$(".lottery-wrapper .next").trigger('click');
		});
		keyboardJS.bind('up', function(e) {
			$("#prize_increment").trigger('click');
		});
		keyboardJS.bind('down', function(e) {
			$("#prize_decrement").trigger('click');
		});
	},
	getprizelucker:function(id){
		var self = this;
		screencore.ajaxSubmit('/screen/lottery/ajaxlucker',{prizeid:id,gametype:XCV3Config.gametype},'').then(function(e){
				if(e.code==0){
					var lucker = e.msg.list,html = '';
					$.each(lucker,function(i,v){
						var nickname = '';
						if(v.showitems.length > 0){
							var bdval = '';
							$.each(v.showitems,function(index,val){
								  bdval += '<div>'+val+'</div>';
							});
							nickname += bdval;
						}else{
							nickname += '<div>'+v.nickname+'</div>';
						}
						v.nickname = nickname;
						html += self.luckerRender(v);
					});
					$(".right-reward-box").html(html);
					$(".title-right span").text(Object.keys(lucker).length);
				}
		});
	},
	changeuser:function (num){
		var self = this,popone = template('popuser-item');
		$(".lottery-userBox-item").remove();
		var pophtml = '';
		if(num >= 12){
			num = 12;
		}
		for(var m = 0;m < num; m++){
			pophtml += popone();
		}
		$(".lottery-userBox-wrapper").append(pophtml);
		var userBox = $(".lottery-userBox-item");
		clearInterval(self.changeTimer);
		self.changeTimer = setInterval(function(){
			userBox.each(function(){
				var userInfo = self.alluser[Math.floor((Math.random()*self.alluser.length))];
				var nickname = '';
				if(userInfo.showitems.length > 0){
					var bdval = '';
					$.each(userInfo.showitems,function(index,val){
						  bdval += '<div>'+val+'</div>';
					});
					nickname += bdval;
				}else{
					nickname += '<div>'+userInfo.nickname+'</div>';
				}
				$(this).find("img").attr('src',userInfo.avatar);
				$(this).find("p").html(nickname);
			});
		},100);
	},
	stageObj: $(".wall3d ul"),
	shape:'sphere',
	nullCount:0,
	shapeTime:10e3,
	isImg:!0,
	Utils:{},
	Stage:{},
	Card:{},
	wall:{},
	sphere:{},
	wall2:{},
	cylinder:{},
	cube:{},
	cube2:{},
	screw:{},
	deg:function(o) {
		return Math.PI / 180 * o
	},
	maxid:0,
	Countobj:[],
	Logoobj:[],
	Textobj:[],
	posfrom:[
			[800,-800,3e3],
			[800,800,3e3],
			[-800,800,3e3],
			[-800,-800,3e3],
	],
	shapes:['sphere','wall','cube','cube2','cylinder','screw','tours'],
	init3d:function(params){
		if(!params) return;
		var e = this;
		e.shape = e.shapes[(params.shape-1)] || 'sphere';
		e.shapeTime = params.shapeTime||10e3;
		e.Stage = e.makeStage();
		e.Utils = e.makeUtils();
		e.Card = e.makeCard();
		e.wall = e.makeWall();
		e.wall2 = e.makeWall2();
		e.sphere = e.makeSphere();
		e.cylinder = e.makeCylinder();
		e.cube = e.makeCube();
		e.cube2 = e.makeCube2();
		e.screw = e.makeScrew();
		e.tours = e.makeTours();
		e.changeShape();
		setTimeout(function(){
			e.getnewUser();
		},10e3);
	},
	getnewUser:function(){
		var e = this;
		screencore.ajaxSubmit('/screen/lottery/getmoreuser',{maxid:e.maxid}).then(function(json){
			if(json.code==0){
				$(".left-joinnums span").text(json.msg.total);
				var newuser = json.msg.list,noavatars = $(".signthreed-wall-block .wall3d li").filter(function(o, i) {
					return "N" == $(i).attr("data-avatar")
			    });
			    if(newuser.length>0){
					e.maxid = newuser[0].userid;
				}
				if(noavatars.length > 0 && newuser.length > 0){
					$.each(newuser,function(i,v){
						 e.alluser.push(v);
						 noavatars.eq(i).find('img').attr('src',v.avatar);
						 noavatars.eq(i).attr('data-avatar','Y')
					});
				}else{
					var hadavatars = $(".signthreed-wall-block .wall3d li").filter(function(o, i) {
						return "Y" == $(i).attr("data-avatar")
			    	});
			    	if(hadavatars.length > 0 && newuser.length > 0){
						$.each(newuser,function(i,v){
							 e.alluser.push(v);
							 hadavatars.eq(i).find('img').attr('src',v.avatar);
						});
					}
				}
			}
			setTimeout(function(){
				e.getnewUser();
			},5e3);
		}, function(){
			setTimeout(function(){
				e.getnewUser();
			},5e3);
		});
		
	},
	makeUtils:function() {
		var self = this;
		var o = window.innerWidth,
			i = window.innerHeight,
			n = [],
			e = 0,
			s = function() {
				if (n.length && !(e > 2)) {
					++e;
					var o = n.shift(),
						i = o.item,
						t = o.url,
						a = new Image;
					a.onload = function() {
						i.append(a),$(a).fadeIn(), --e, setTimeout(s, 100)
					}, a.onerror = function() {
						--e, setTimeout(s, 100)
					}, a.src = t, setTimeout(s, 150)
				}
			};
		return {
			width: o,
			height: i,
			in:function() {
				var o = $.Deferred(),
					i = self.stageObj.find("li");
				var inpos = {};
				inpos.position = [-3e3, 0, -700];
				inpos.duration = 0;
				inpos.allDone =  o.resolve;
				
				return i.length ? (self.Stage.stop(), i.snabbt(inpos)) : o.resolve(), o.promise()
			},
			leave: function() {
				var o = $.Deferred(),
					i = self.stageObj.find("li");
				var leavepos = {};
				leavepos.position = [3e3, 0, -700];
				leavepos.duration = 500;
				leavepos.delay = function(o, i) {
						return 1e3 * Math.random()
				};
				leavepos.allDone =  o.resolve;
				return i.length ? (self.Stage.stop(), i.snabbt(leavepos)) : o.resolve(), o.promise()
			},
			loadImg: function(o) {
				n.push(o), s()
			}
		}
	},
	makeStage:function() {
		var self = this;
		var o = {
			fromRotation: [0, 0, 0],
			rotation: [0, 2 * Math.PI, 0],
			duration: 35e3,
			complete: function() {
				i()
			}
		},
		i = function() {
			 self.Stage.stop(),self.Stage.snabbt(o)
		};
		return {//          stage 
			default:function(n) {
				n.transformOrigin || (n.transformOrigin = [0, 0, 0]);
				n.duration || (n.duration = 35e3);
				Object.keys(n).forEach(function(i) {
					o[i] = n[i]
				});
				self.Stage.snabbt({
					position: [0, 0, 0],
					duration:100,
					complete: i
				})
			}, 
			snabbt: self.stageObj.snabbt.bind(self.stageObj),
			stop: function() {
				self.stageObj.snabbt("stop")
			},
			reset: function(o) {
				self.stageObj.css("transform", "")
			}
		}
	},
	makeCard:function() {
		var self = this;
		var o = -1,
			i = [],
			n = function(key) {
				var o = $('<li class="card"></li>'),
					n = 335 * Math.random() | 0;
					if(self.isImg){
						self.Utils.loadImg({
							item: o,
							url:self.alluser[key]?self.alluser[key].avatar:(self.alluser.length>0?self.alluser[Math.floor(Math.random()*self.alluser.length)].avatar:defaultimg)
						})
					}
					i.push(o);
					self.stageObj.append(o);
					if(!self.alluser[key]){
						o.attr('data-avatar','N');
					}else{
						o.attr('data-avatar','Y');
					}
			};
		return {
			count: function() {
				return i.length;
			},
			init: function(o) {
				var t = o - i.length;
				if (t > 0){
					for (var e = i.length; e < o; e++){
						n(e);
					}
				}
			},
			reset: function() {
				o = -1, $("li.card").removeClass("activate")
			},
			next: function() {
				if (++o, i[o]) return i[o]
			}
		}
	},
	makeWall:function() {
		var self = this;
		for (var o = [], i = h = 50 * Math.sqrt(2), n = self.Utils.height / h | 0, e = self.Utils.width / i | 0, s = 0; s < n; s++) for (var a = 0; a < e; a++) {
			var l = (e - 1) / 2 - a,
				r = (n - 1) / 2 - s;
			o.push({
				position: [l * i, r * h, 0],
				rotation: [0, 0, Math.PI / 4]
			})
		}
		return {
			card: {
				count: o.length,
				allCard: o,
				perspective: 3500
			},
			stage: {
				position: [0, 0, 0],
				duration:self.shapeTime
			}
		}
	},
	makeWall2:function() {
		var self = this;
		for (var o = [], i = h = 55 * Math.sqrt(2), n = 17, e = 20, s = 0; s < n; s++) for (var a = 0; a < e; a++) {
			var l = (e - 1) / 2 - a,
				r = (n - 1) / 2 - s,
				c = 0;
			s % 2 == 0 && (c = h / 2), o.push({
				position: [l * i + c, r * h / 2, 0],
				rotation: [0, 0, Math.PI / 4]
			})
		}
		return {
			card: {
				count: o.length,
				allCard: o,
				perspective: 3500
			},
			stage: {
				position: [0, 0, 0],
				duration: self.shapeTime
			}
		}
	},
	makeSphere:function() {
		var self =  this;
		for (var o = [], t = 380, e = 16, s = 30, a = {}, l = e / 2 | 0, r = 0; r < e; r++) {
			var c = (Math.sin(Math.PI / (e - 1) * r) * s | 0) + 1;
			a[r] = c
		}
		return Object.keys(a).forEach(function(i) {
			for (var s = l - i, r = a[i], c = 0; c < r; c++) {
				var p = 180 / e * s,
					u = 360 / r * c;
				1 == r && (p = p > 0 ? 90 : -90);
				var d = i * self.deg(180 / (e - 1)),
					f = c * self.deg(360 / r),
					h = t * Math.sin(d) * Math.cos(f),
					g = t * Math.sin(d) * Math.sin(f),
					v = .9 * t * Math.cos(d);
				o.push({
					position: [g, -v, h],
					rotation: [-self.deg(p), -self.deg(u), 0],
				})
			}
		}), {
			card: {
				count: o.length,
				allCard: o,
				perspective: 3500
			},
			stage: {
				position: [0, 0, 0],
				duration: self.shapeTime
			}
		}
	},
	makeTours:function(){
			var self = this;
			var o = [];							
			var deg = function(o) {
				return Math.PI / 180 * o
			};
			var e = 360;
			var s = 10;
			var a = 15;
			var l = self.Utils.width/(a*6);
			var r = 360 / a;
			for ( var c = 0; c < s; c++){
				for (var u = 0; u < a; u++) {
						var p = s / 2 | 0,
						d = a / 2 | 0,
						f = deg(r * u),
						x = e * Math.cos(f),
						y = e * Math.sin(f),
						z = (c - p) * a * l + (u - d) * l;
						o.push({
							position: [x, y, z],
							rotation: [0, 0, 0],
							
						})
				}
			}
			return {
				card: {
					count: o.length,
					allCard: o,
					perspective:3500
				},
				stage: function() {
					var i = function() {
						self.Stage.snabbt({
							fromRotation: [0, 0, 0],
							rotation: [0, 0, 2 * Math.PI],
							duration: self.shapeTime,
							complete: function() {
								i();
							}
						})
					};
					return i
				}
				
			}
			
	},
	makeCylinder:function() {
		var self = this;
		for (var o = [], i = 500, t = 500, e = 7, s = 45, a = t / e | 0, l = e / 2 | 0, r = 0; r < e; r++) for (var c = 360 / s, p = 0; p < s; p++) {
			var u = 0,
				d = 0,
				f = 0,
				h = 0;
			u = i * Math.sin(self.deg(p * c)), d = (r - l) * a, f = i * Math.cos(self.deg(p * c)), h = p * c, o.push({
				position: [u, d, f],
				rotation: [0, -self.deg(h), 0]
			})
		}
		return {
			card: {
				count: o.length,
				allCard: o,
				perspective: 3500
			},
			stage: {
				position: [0, 0, 0],
				duration: self.shapeTime*2
			}
		}
	},
	makeCube:function() {
		var self = this;
		for (var o = [], i = h = d = 100, t = 5, n = 9, e = 8, s = 0; s < e; s++) for (var a = 0; a < t; a++) for (var l = 0; l < n; l++) {
			var r = (n - 1) / 2 - l,
				c = (t - 1) / 2 - a,
				p = (e - 1) / 2 - s;
			o.push({
				position: [r * i, c * h, p * d],
				rotation: [0, 0, 0]
			})
		}
		return {
			card: {
				count: o.length,
				allCard: o,
				perspective: 3500
			},
			stage: {
				position: [0, 0, 0],
				duration: self.shapeTime
			}
		}
	},
	makeCube2:function() {
		var self = this;
		for (var o = [], i = 9, n = 57, e = (length / 2, []), s = [], a = [], l = 0; l < i; l++) for (var r = 0; r < i; r++) {
			var c = (i - 1) / 2,
				p = (c - l) * n,
				u = (c - r) * n,
				d = c * n + n / 2;
			e.push({
				position: [p, u, d],
				rotation: [0, 0, 0]
			}), e.push({
				position: [p, u, -d],
				rotation: [Math.PI, 0, 0]
			}), s.push({
				position: [-d, p, u],
				rotation: [0, Math.PI / 2, 0]
			}), s.push({
				position: [d, p, u],
				rotation: [0, -Math.PI / 2 * 3, Math.PI]
			}), a.push({
				position: [u, -d, p],
				rotation: [Math.PI / 2 * 3, 0, 0]
			}), a.push({
				position: [u, d, p],
				rotation: [Math.PI / 2, 0, 0]
			})
		}
		return o = e.concat(s, a), {
			card: {
				count: o.length,
				allCard: o,
				perspective: 3500
			},
			stage: function() {
				var i = function() {
					self.Stage.snabbt({
						fromRotation: [0, 0, 0],
						rotation: [2 * Math.PI, 2 * Math.PI, 0],
						duration: self.shapeTime,
						complete: function() {
							i();
						}
					})
				};
				return i
			}
		}
	},
	makeScrew:function() {
		var self = this;
		for (var o = [], e = 300, s = 7, a = 25, l = self.Utils.width / s / a, r = 360 / a, c = 0; c < s; c++) for (var p = s / 2 | 0, u = 0; u < a; u++) {
			var d = a / 2 | 0,
				f = self.deg(r * u),
				h = (c - p) * a * l + (u - d) * l,
				g = e * Math.sin(f),
				v = e * Math.cos(f),
				m = f,
				b = 0,
				w = 0;
			o.push({
				position: [h, g, v],
				rotation: [m, b, w],
				skew: [0, self.deg(6)]
			})
		}
		return {
			card: {
				count: o.length,
				allCard: o,
				perspective: 3500
			},
			stage: function() {
				var n = function() {
					self.Stage.snabbt({
						fromRotation: [0, 0, 0],
						rotation: [2 * Math.PI, 0, 0],
						duration:self.shapeTime,
						complete: function() {
							n()
						}
					})
				};
				return  n;
			}
		}
	},
	Build:function() {
		var self = this;
		var o = self[self.shape];
		if (o) {
			var i = o.stage,
				n = o.card,
				e = function() {};
			if (i && "function" == typeof i ){
				//self rotate
				e = i();
			}else{
				//stage rotate
				self.Stage.default(i);
			}
			self.Card.reset();
			for (var s = 0, a = 0; a < n.count; a++) {
				var l = self.Card.next();
				if (l) {
					l.addClass("activate");
					var r = n.allCard[a];
					var c = {
						rotation: r.rotation,
						position: r.position,
						scale: r.scale || [1, 1],
						complete: function() {
							++s, s == n.count && e();
						}
					};
					c.duration = 0;
					c.delay = 0;
					r.skew || (r.skew = [0, 0]), c.skew = r.skew, l.snabbt(c)
				}
			}
		}
	},
	changeShape:function(shape){
		var self = this;
		if(shape) self.shape = self.shapes[(shape - 1)];
		var shapeobj = self[self.shape];
		self.Card.init(shapeobj.card.count);
		self.Build();
	},
};
return screencubecj;
});