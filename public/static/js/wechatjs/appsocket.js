define('appsocket', [], function () {
	var appsocket = {
		parmas: null,
		isclose: true,
		wsClient: null,
		beatTimer: null,
		init: function (params) {
			var self = this;
			self.parmas = params;
			self.senddata = {
				hdid: XCV3Config.rhdid,
			};
			self.wsClient = new WebSocket(XCV3Config.wsAddress);
			self.wsClient.onopen = function () {
				if (params.onopen) {
					params.onopen();
				} else {
					clearInterval(self.beatTimer);
					self.beatTimer = setInterval(function () {
						self.heartBeat();
					}, 6e3);
				}
			};
			self.wsClient.onmessage = function (evt) {//收到消息
				var data = JSON.parse(evt.data);
				params.onmessage && params.onmessage(data);
			};
			self.wsClient.onclose = function (evt) {//链接关闭
				self.isclose = true;
				self.wsClient = null;
				if (params.onclose) {
					params.onclose(evt);
				} else {
					self.reconnect();
				}
			};
			self.wsClient.onerror = function (evt) {//链接失败
				if (params.onerror) {
					params.onerror(evt);
				} else {
					console.log('连接通讯服务器异常..');
				}
			};
			/*window.onbeforeunload = function() {
				self.closeClient();
			};*/
		},
		reconnect: function () {
			var self = this;
			self.init(self.parmas);
		},
		wssend: function (data) {
			var self = this;
			!self.isclose && self.wsClient.send(JSON.stringify(data));
		},
		wsloginsend: function (data) {
			var self = this;
			self.wsClient.send(JSON.stringify(data));
		},
		heartBeat: function () {
			var self = this;
			!self.isclose && self.wsClient.send('{"type":"ping"}');
		},
		closeClient: function () {
			var self = this;
			!self.isclose && self.wsClient.close();
		},
		sendgamedata: function (data) {
			var self = this, rotateid = data.rotateid || '0', myscore = data.myscore || '0', myteam = data.myteam || '0';
			self.wssend({
				hdid: XCV3Config.rhdid,
				rotateid: rotateid,
				userid: XCV3Config.userid,
				openid: XCV3Config.openid,
				nickname: XCV3Config.nickname,
				avatar: XCV3Config.avatar,
				type: XCV3Config.gametype,
				myscore: parseInt(myscore),
				myteam: myteam,
			});
		},
	};
	return appsocket;
});



