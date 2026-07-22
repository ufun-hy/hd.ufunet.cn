define('screensocket', [], function () {
	var screensocket = {
		parmas: null,
		wsClient: null,
		senddata: null,
		isclose: true,//开屏即为socket关闭状态
		forceoff: false,
		beatTimer: null,
		init: function (params) {
			var self = this;
			self.parmas = params;
			self.senddata = {};
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
			self.wsClient.onmessage = function (evt) {
				var data = JSON.parse(evt.data);
				params.onmessage && params.onmessage(data);
			};
			self.wsClient.onclose = function (evt) {
				self.isclose = true;
				if (params.onclose) {
					params.onclose(evt);
				} else {
					console.log('通讯服务器断开..');
					self.reconnect();
				}
			};
			self.wsClient.onerror = function (evt) {
				self.isclose = true;
				if (params.onerror) {
					params.onerror(evt);
				} else {
					console.log('连接通讯服务器异常..');
				}
			};
		},
		reconnect: function () {
			var self = this;
			!self.forceoff && self.init(self.parmas);
		},
		wssend: function (data) {
			var self = this;
			!self.isclose && self.wsClient.send(JSON.stringify(data));
		},
		wsloginsend: function (data) {//旨在用于open状态发送消息
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
		sendData: function (obj) {
			var self = this, objdata = self.senddata;
			$.extend(objdata, obj);
			self.wssend(objdata);
		},
	};
	return screensocket;
});



