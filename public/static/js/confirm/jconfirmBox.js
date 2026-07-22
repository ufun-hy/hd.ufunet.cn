define('jconfirmBox', ['jquery', 'webcore', 'confirm'], function ($, webcore) {
	var jconfirmBox = {
		confirm: function (title, content, fuc, fuc2, columnClass, type, buttontxts, onOpen) {
			var fuc = fuc || false;
			var fuc2 = fuc2 || false;
			var type = type || false;
			var buttontxts = buttontxts || false;
			var onOpen = onOpen || false;
			var confirmBox = $.confirm({
				title: title,
				content: "<div class='jconfirmBox-text'>" + content + "</div>",
				closeIcon: true,
				columnClass: columnClass || 'col-lg-6 col-lg-offset-3',
				animation: 'none',
				closeAnimation: 'scale',
				buttons: {
					ok: {
						isHidden: buttontxts && buttontxts[0].hidden ? true : false,
						text: buttontxts && buttontxts[0].txt ? buttontxts[0].txt : "确定",
						btnClass: 'btn-primary',
						keys: ['enter'],
						action: function () {
							if (fuc) {
								fuc(this);
								if (type) {
									return false;
								}
							}
						}
					},
					cancel: {
						isHidden: buttontxts && buttontxts[1].hidden ? true : false,
						text: buttontxts && buttontxts[1].txt ? buttontxts[1].txt : "取消",
						btnClass: 'btn-default btn-normalborder',
						action: function () {
							if (fuc2) {
								fuc2();
							}
						}
					}
				},
				onOpen: function () {
					onOpen && onOpen();
				},
			});
			if (type) {
				return confirmBox;
			}
		},
		alert: function (title, content, fuc, columnClass) {
			var fuc = fuc || false;
			$.confirm({
				title: title,
				columnClass: columnClass || 'col-md-6 col-md-offset-3',
				content: "<div class='jconfirmBox-text'>" + content + "</div>",
				animation: 'none',
				closeAnimation: 'scale',
				closeIcon: true,
				buttons: {
					ok: {
						text: "确定",
						btnClass: 'btn-primary',
						keys: ['enter'],
						action: function () {
							if (fuc) {
								fuc(this);
							}
						}
					}
				}
			});
		},
		ajaxconfirm: function (title, ajaxUrl, data, dataType, columnClass, fuc, fuc2, hasbuttons, buttontxts, hasclose, onOpen) {
			var fuc = fuc || false;
			var fuc2 = fuc2 || false;
			var hasbuttons = !hasbuttons ? '1' : hasbuttons;
			var buttons = hasbuttons == '1' ? {
				ok: {
					isHidden: buttontxts && buttontxts[0].hidden ? true : false,
					text: buttontxts && buttontxts[0].txt ? buttontxts[0].txt : "确定",
					btnClass: 'btn-primary',
					keys: ['enter'],
					action: function () {
						if (fuc) {
							fuc(this.$content)
							return false;
						}
					}
				},
				cancel: {
					isHidden: buttontxts && buttontxts[1].hidden ? true : false,
					text: buttontxts && buttontxts[1].txt ? buttontxts[1].txt : "取消",
					keys: ['esc'],
					btnClass: 'btn-default btn-normalborder',
					action: function () {
						if (fuc2) {
							fuc2(this.$content);
						}
					}
				}
			} : false;
			hasclose = ("undefined" == typeof hasclose ? true : (hasclose ? true : false));
			return $.confirm({
				title: title,
				animation: 'none',
				closeAnimation: 'scale',
				hasbuttons: hasbuttons,
				content: function () {
					var self = this;
					return $.ajax({
						url: webcore.makeurl(ajaxUrl),
						data: data,
						dataType: dataType,
						method: 'post'
					}).done(function (response) {
						if (dataType == 'json') {
							if (response.errno == 0) {
								self.setContent(response.message);
							} else {
								self.setTitle('警告');
								self.setContent(response.message);
							}
						} else {
							if (response.indexOf('{"code":-1') != -1) {
								response = JSON.parse(response);
								self.setContent('<div class="text-center text-danger">' + response.msg + '</div>');
							} else {
								self.setContent(response);
							}
						}
					}).fail(function (jqXHR, textStatus) {
						self.setTitle('请求出现异常了');
						self.setContent('请求' + ajaxUrl + '出现异常，状态值：' + textStatus + "，异常信息：" + jqXHR.responseText || 'error');
					});
				},
				onContentReady: function () {
					onOpen && onOpen(this.$content);
				},
				columnClass: columnClass || 'col-md-6 col-md-offset-3',
				closeIcon: hasclose,
				buttons: buttons,
			});
		}

	}
	return jconfirmBox;
});