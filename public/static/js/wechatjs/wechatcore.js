define('wechatcore', ['jquery', 'ydui', 'layer', 'laytpl', 'slideBox', 'dialog', 'glightbox', (XCV3Config.clienttype == '2' ? 'DouyinOpenJSBridge' : 'template'), (XCV3Config.amconfig.type == '1' ? 'directoss' : (XCV3Config.amconfig.type == '2' ? 'directcos' : (XCV3Config.amconfig.type == '3' ? 'directqiniu' : 'template'))), 'howler'], function ($, YDUI, layer, laytpl, slideBox, dialog, GLightbox, DouyinOpenJSBridge, directup) {
	var wechatcore = {
		newjointimer: null,
		tipzIndex: 2000,
		device: function (type) {
			if (type == 1) {
				return YDUI.device.isIOS;
			} else if (type == 2) {
				return YDUI.device.isMobile;
			} else if (type == 3) {
				return YDUI.device.isWeixin;
			}
		},
		enableCookie: function () {
			var enableCookie = true;
			if (!navigator.cookieEnabled) {
				enableCookie = false;
			}
			return enableCookie
		},
		ios12over: function () {
			//ios12以上13以下
			var self = this;
			var ioscenter = '11.99';
			var ios = false;
			var str = navigator.userAgent.toLowerCase();
			var version = str.match(/cpu iphone os (.*?) like mac os/);
			if (version) {
				ios = version[1].replace(/_/g, ".");
				ios = self.compareVesion(ioscenter, ios);
			}
			return ios;
		},
		ios17over: function () {
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;
			return /iPad|iPhone|iPod/.test(userAgent) && /OS (\d+)_(\d+)_?(\d+)?/.test(userAgent) &&
				(parseInt(RegExp.$1, 10) > 17 ||
					(parseInt(RegExp.$1, 10) === 17 && parseInt(RegExp.$2, 10) >= 1));
		},
		ios134over: function () {
			var self = this;
			var ioscenter = '13.4';
			var ios = false;
			var str = navigator.userAgent.toLowerCase();
			var version = str.match(/cpu iphone os (.*?) like mac os/);
			if (version) {
				ios = version[1].replace(/_/g, ".");
				ios = self.compareVesion(ioscenter, ios);
			}
			return ios;
		},
		compareVesion: function (a, b) {
			var self = this;
			var a = self.toNum(a);
			var b = self.toNum(b);
			if (a == b) {
				return true;
			} else if (a > b) {
				return false;
			} else {
				return true;
			}
		},
		toNum: function (a) {
			var a = a.toString();
			var c = a.split('.');
			var num_place = ["", "0", "00", "000", "0000"], r = num_place.reverse();
			for (var i = 0; i < c.length; i++) {
				var len = c[i].length;
				c[i] = r[len] + c[i];
			}
			var res = c.join('');
			return res;
		},
		openKeyboard(dom, boardtitle, url) {
			var self = this;
			var $keyboard = $(dom);
			// 初始化参数
			$keyboard.keyBoard({
				disorder: false,
				toptitle: boardtitle || '请输入安全密码',
				title: '安全验证',
				maskclose: false,
				showcancel: false,
			});
			$keyboard.keyBoard('open');
			// 六位密码输入完毕后执行
			$keyboard.on('done.ydui.keyboard', function (ret) {
				self.ajaxSubmit('/wechat/login/index', { password: ret.password }, '正在验证密码...').then(function (data) {
					if (data.code == 0) {
						self.showtopmsg('密码验证成功', 1e3, function () {
							window.location.href = url;
						});
					} else {
						$keyboard.keyBoard('error', '对不起，您的安全密码不正确，请重新输入');
					}
				}, function () {
					self.msg('网络异常验证失败，请稍后重试');
				});
				// $keyboard.keyBoard('close');
			});
		},
		setcookie: function (name, val, expires) {
			if (!expires) expires = 86400;
			YDUI.util.cookie.set(name, val, expires);
		},
		getcookie: function (name) {
			return YDUI.util.cookie.get(name);
		},
		setTemplocalStorage: function (key, value) {
			var curTime = new Date().getTime();
			localStorage.setItem(key, JSON.stringify({ data: value, time: curTime }));
		},
		getTemplocalStorage: function (key, exp) {
			var data = localStorage.getItem(key);
			if (data == null) {
				return null;
			}
			var dataObj = JSON.parse(data);
			if ((new Date().getTime() - dataObj.time) / 1e3 > exp) {
				localStorage.removeItem(key);
				return null;
			} else {
				var datatoJson = dataObj.data;
				return datatoJson;
			}
		},
		getlocalStorage: function (key) {
			return YDUI.util.localStorage.get(key);
		},
		setlocalStorage: function (key, value) {
			return YDUI.util.localStorage.set(key, value);
		},
		dellocalStorage: function (key) {
			return YDUI.util.localStorage.remove(key);
		},
		clearlocalStorage: function () {
			return YDUI.util.localStorage.clear();
		},
		getImgBase64: function (obj, callback) {
			return YDUI.util.getImgBase64(obj, callback);
		},
		geturl2Base64: function (imgUrl, func) {
			window.URL = window.URL || window.webkitURL;
			var xhr = new XMLHttpRequest();
			xhr.open("get", imgUrl, true);
			xhr.responseType = "blob";
			xhr.onload = function () {
				if (this.status == 200) {
					var blob = this.response;
					var filereader = new FileReader();
					filereader.readAsDataURL(blob);
					filereader.onloadend = function (e) {
						func && func(filereader.result);
					}
				} else {
					func && func('');
				}
			}
			xhr.send();
		},
		getQueryString: function (key) {
			return YDUI.util.getQueryString(key);
		},
		camSafeUrlEncode: function (str) {
			return encodeURIComponent(str)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A');
		},
		lockpage: function () {
			YDUI.util.pageScroll.lock();
		},
		unlockpage: function () {
			YDUI.util.pageScroll.unlock();
		},
		coundown: function (time, lg, draw, jgtime) {
			var b = setInterval(function () {
				time = time - 1;
				if (time > 0) {//>0
					if (lg) {
						lg(time);
					}
				} else {
					clearInterval(b);
					if (draw) {
						draw()
					}
				}
			}, jgtime || 1e3);
		},
		showtopmsg: function (tips, showTime, fuc) {
			var tipsTpl = $('<div  class="zam-app-tipsmsg zam-app-flex zam-app-justifyCenter">' + tips + '</div>');
			tipsTpl.css({ "z-index": (this.tipzIndex) });
			this.tipzIndex++;
			tipsTpl.appendTo("body");
			tipsTpl.addClass('zam-app-tipsmsghide');
			setTimeout(function () {
				tipsTpl.removeClass('zam-app-tipsmsghide').addClass('zam-app-tipsmsgshow');
				setTimeout(function () {
					tipsTpl.removeClass('zam-app-tipsmsgshow').addClass('zam-app-tipsmsghide');
					setTimeout(function () {
						tipsTpl.remove();
						if (fuc) {
							fuc();
						}
					}, 500)
				}, showTime || 2e3)
			}, 30);
		},
		msg: function (txt, time, pos, dialogClass) {
			/*layer.open({
				content:txt
				,skin: 'msg'
				,classname:'layer-msg-box'
				,time:time||2
			});*/
			$(document).dialog({
				type: 'notice',
				style: "ios",
				infoText: txt,
				autoClose: time || 2e3,
				position: pos || 'center',
				overlayShow: true,
				overlayClose: true,
				dialogClass: `dialogmsg${dialogClass ? ` ${dialogClass}` : ''}`,
			});
		},
		ask: function (title, txt, btns, func, func2, className, shadeClose) {
			var params = {
				shadeClose: shadeClose || false,
				yes: function (index, obj) {
					func && func(index, obj);
				},
				no: function (index) {
					func2 && func2(index);
				}
			};
			params.title = title ? title : false;
			params.content = txt ? txt : false;
			params.className = className ? className : '';
			params.btn = btns ? btns : ['确定', '取消'];
			var layindex = layer.open(params);
			return layindex;
		},
		dialogAsk: function (title, content, buttons) {
			var dialog = $(document).dialog({
				type: 'confirm',
				style: "ios",
				titleText: title,
				closeBtnShow: false,
				content: content,
				buttons: buttons || [
					{
						name: '好的',
						callback: function () {
							dialog.close();
						}
					},
				],
			});
		},
		bask: function (txt, btns, func) {
			var params = {
				shadeClose: false
				, skin: 'footer'
				, yes: function (index) {
					func && func(index);
				}
			};
			params.content = txt ? txt : false;
			params.btn = btns ? btns : ['确定', '取消'];
			var layindex = layer.open(params);
			return layindex;
		},
		bpopup: function (dom, data, stringcss, fn) {
			var self = this, obj = {
				type: 1
				, content: self.tpl(dom, data)
				, anim: 'up'
				, shade: 'background-color: rgba(0,0,0,.3)'
				, style: stringcss || 'position:fixed; bottom:0; left:0; width: 100%;border:none;'
				, success: function (e) {
					fn && fn(e);
				}
			};
			var layindex = layer.open(obj);
			return layindex;
		},
		bpopupbyhtml: function (html, stringcss, skin, callback) {
			var openobj = {
				type: 1,
				content: html,
				anim: 'scale',
				style: stringcss || 'position:fixed; bottom:0; left:0; width: 100%;border:none;'
			};
			if (skin) {
				openobj.skin = skin;
			}
			if (callback) {
				openobj.success = callback;
			}
			return layer.open(openobj);

		},
		bpopupBox: function (html, className) {
			var self = this;
			var openobj = {
				type: 1
				, shadeClose: false
				, content: html
				, anim: 'scale'
			};
			if (className) {
				openobj.className = className;
			}
			return layer.open(openobj);
		},
		loading: function (txt) {
			var index = layer.open({
				type: 2
				, shadeClose: false
				, content: txt
			});
			return index;
		},
		close: function (index) {
			layer.close(index)
		},
		closeall: function () {
			layer.closeAll();
			$(".dialog.dialog-open.dialogmsg").remove();
		},
		ajaxSubmit: function (url, params, tips) {
			var self = this;
			if (tips) {
				var layerindex = self.loading(tips);
			}
			params.hdid = XCV3Config.hdid;
			var ajaxObj = $.Deferred();
			$.ajax({
				url: self.makeurl(url),
				type: 'post',
				data: params,
				dataType: 'json'
			}).then(function (json) {
				if (tips) {
					self.close(layerindex);
				}
				if (json.code == -100) {
					self.msg('登录身份已经过期');
					self.reloadpage();
				} else {
					ajaxObj.resolve(json);
				}
			}, function (json) {
				if (tips) {
					self.close(layerindex);
				}
				ajaxObj.reject(json);
			});
			return ajaxObj.promise();
		},
		makeurl: function (r, hdid) {
			return r;
		},
		tpl: function (dom, data) {
			return laytpl(dom.html()).render(data);
		},
		oneSlideBox: function (config) {
			slideBox.popBoxinit(config);
		},
		anicss: function (element, animationName, callback) {
			var node = document.querySelector(element);
			node.classList.add('animated', animationName);
			function handleAnimationEnd() {
				node.classList.remove('animated', animationName)
				node.removeEventListener('animationend', handleAnimationEnd);
				if (typeof callback === 'function') callback();
			}
			node.addEventListener('animationend', handleAnimationEnd);
		},
		uploadVideo2: function (params, func, func2, seltype) {
			var self = this;
			seltype = seltype || 1;
			var selvideotype = seltype == 1 ? 'capture="camera"' : '';
			var layerindex = self.loading('视频文件上传中...');
			var videofdom = params.obj.parent();
			var upUrl = self.makeurl(params.url, XCV3Config.hdid);
			params.obj.wrap("<form class='ajaxupload' action=" + upUrl + " method='post' enctype='multipart/form-data'></form>");
			$(".ajaxupload").ajaxSubmit({
				dataType: 'json',
				success: function (data) {
					params.obj.unwrap();
					params.obj.remove();
					self.close(layerindex);
					videofdom.append('<input type="file" name="file" accept="video/*" ' + selvideotype + ' class="videofile">');
					func && func(data);
				},
				error: function (data) {
					params.obj.unwrap();
					params.obj.remove();
					self.close(layerindex);
					videofdom.append('<input type="file" name="file" accept="video/*" ' + selvideotype + ' class="videofile">');
					func2 && func2(data);
				}
			});
		},
		//通过media_id以及accesstoken获取图片资源
		uploadImgMediaId: function (params, func, imgnum, txt) {
			var self = this, imgnum = imgnum || 1;
			if (imgnum > 9) imgnum = 9;
			(parent.wx || wx).chooseImage({
				count: imgnum,
				sourceType: ['album', 'camera'],
				success: function (res) {
					var localIds = res.localIds;
					if (localIds.length > imgnum) {
						self.msg(txt || '一次只能上传' + imgnum + '张图片');
					} else {
						$.each(localIds, function (i, v) {
							self.downloadImgMediaId(params, v, func);
						})
					}
				}
			});
		},
		downloadImgMediaId: function (params, localId, func) {
			var self = this;
			(parent.wx || wx).uploadImage({
				localId: localId,
				isShowProgressTips: 1,
				success: function (res) {
					var serverId = res.serverId;
					self.ajaxSubmit(params, { media_id: serverId }, '图片上传中').then(function (data) {
						func && func(data);
					}, function (data) {
						self.msg('网络超时，上传失败');
					});
				}
			});
		},
		//直传或本地传
		uploadImg: function (params, func) {
			var self = this, maxnum = params.maxnum || 1, txt = params.txt || '一次只能上传' + maxnum + '张图片', sourcetype = params.sourcetype || '1', sourcetypes = [];
			if (sourcetype == '2') {
				sourcetypes = ['camera'];
			} else if (sourcetype == '3') {
				sourcetypes = ['album'];
			} else {
				sourcetypes = ['album', 'camera'];
			}
			if (XCV3Config.clienttype == '1') {
				if (maxnum > 9) maxnum = 9;
				(parent.wx || wx).chooseImage({
					count: maxnum,
					sourceType: sourcetypes,
					success: function (res) {
						var localIds = res.localIds;
						if (localIds.length > maxnum) {
							self.msg(txt);
						} else {
							$.each(localIds, function (i, v) {
								self.downUploadImg(params, v, func);
							})
						}
					}
				});
			} else {
				//H5上传
				if (sourcetype == '2') {
					var content = '<div class="cameraphoto">拍照<input type="file" accept=".jpg,.jpeg,.png,.gif" capture="camera"></div>';
				} else if (sourcetype == '3') {
					var content = '<div class="phonephoto">从手机相册选择<input type="file" accept=".jpg,.jpeg,.png,.gif"></div>';
				} else {
					var content = '<div class="cameraphoto">拍照<input type="file" accept=".jpg,.jpeg,.png,.gif" capture="camera"></div><div class="phonephoto">从手机相册选择<input type="file" accept=".jpg,.jpeg,.png,.gif"></div>';
				}
				var uploadlayer = layer.open({
					content: content,
					btn: '取消',
					skin: 'footer',
					anim: 'up',
					className: "zam-app-uploadImgbox",
					success: function (elem) {
						$(elem).find('input').unbind('change').bind('change', function () {
							var file = $(this).get(0).files[0];
							if (file.size == 0) {
								return self.msg('请选择文件');
							}
							self.close(uploadlayer);
							var loadindex = self.loading('图片上传中，请稍后...');
							var amtype = XCV3Config.amconfig.type || '0';
							if (amtype == '0') {
								var formData = new FormData();
								formData.append('hdid', XCV3Config.hdid);
								formData.append('fromtype', params.type);
								formData.append('file', file);
								$.ajax({
									url: '/wechat/common/uploadimgfile',
									type: "POST",
									processData: false,
									contentType: false,
									data: formData,
									success: function (data) {
										self.close(loadindex);
										func && func(data);
									},
									error: function (data) {
										self.close(loadindex);
										func && func(data);
									},
									xhr: function () {
										var xhr = new XMLHttpRequest();
										xhr.upload.addEventListener('progress', function (e) {
											var percent = (e.loaded / e.total) * 100, p = parseFloat(percent).toFixed(2);
											$(".layui-m-layer2 p").text('上传进度 ' + Math.round(p) + '%');
										});
										return xhr;
									},
								});
							} else {
								//file对象
								var mime = file.type.replace('image/', '').toLowerCase(), filepath = "attachment/wechat/" + params.type + "/" + XCV3Config.rhdid + '/' + self.randomString(32) + '.' + mime;
								var appmaxsize = XCV3Config.amconfig.image.appsize || 1024, appexts = XCV3Config.amconfig.image.ext || 'jpg,jpeg,png';
								if (file.size == 0) {
									func && func({ code: '-1', msg: '请选择文件' });
									return false;
								}
								if (file.size > appmaxsize * 1024) {
									func && func({ code: '-1', msg: '只能上传' + parseFloat(appmaxsize / 1024).toFixed(2) + 'M内的图片文件' });
									return false;
								}
								if (appexts.indexOf(mime) == -1) {
									func && func({ code: '-1', msg: '只能上传' + appexts + '格式的图片文件' });
									return false;
								}
								var loadindex = self.loading('图片上传中，请稍后...');
								self.ajaxSubmit('/common/sts/getsts', { type: XCV3Config.amconfig.type }).then(function (json) {
									if (json.code == 0) {
										if (amtype == '1') {
											var client = new directup(json.msg);
											async function putObject() {
												try {
													var result = await client.multipartUpload(
														filepath,
														file,
														{
															progress: function (p, cpt, res) {
																$(".layui-m-layer2 p").text('上传进度 ' + Math.round(p * 100) + '%');
															},
														},
													);
													self.filepathsave({
														filetype: '1',
														filepath: filepath,
														layerindex: loadindex,
														fromtype: params.type
													}, func);
												} catch (e) {
													self.close(loadindex);
													func && func({ code: '-1', msg: '上传出现异常，请稍后重试' });
												}
											}
											putObject();
										} else if (amtype == '2') {
											var credentials = json.msg, url = 'https://' + credentials.bucket + '.cos.' + credentials.region + '.myqcloud.com/' + self.camSafeUrlEncode(filepath).replace(/%2F/g, '/'), xhr = new XMLHttpRequest();
											xhr.open('PUT', url, true);
											xhr.setRequestHeader('Authorization', window.CosAuth({
												SecretId: credentials.key,
												SecretKey: credentials.secret,
												Method: 'PUT',
												Pathname: '/' + filepath,
											}));
											xhr.setRequestHeader('x-cos-security-token', credentials.token);
											xhr.upload.onprogress = function (e) {
												$(".layui-m-layer2 p").text('上传进度 ' + (Math.round(e.loaded / e.total * 10000) / 100) + '%');
											};
											xhr.onload = function () {
												if (/^2\d\d$/.test('' + xhr.status)) {
													self.filepathsave({
														filetype: '1',
														filepath: filepath,
														layerindex: loadindex,
														fromtype: params.type
													}, func);
												} else {
													self.close(loadindex);
													func && func({ code: '-1', msg: '文件上传失败，状态码：' + xhr.status });
												}
											};
											xhr.onerror = function (err) {
												self.close(loadindex);
												func && func({ code: '-1', msg: '文件上传失败，请检查是否没配置 CORS 跨域规则' });
											};
											xhr.send(file);
										} else {
											var observable = directup.upload(file, filepath, json.msg, {
												customVars: { "x:name": filepath.split('.')[0] }
											}, {
												checkByServer: true,
												checkByMD5: true,
												forceDirect: false,
												disableStatisticsReport: false,
												retryCount: 6,
												debugLogLevel: 'INFO'
											});
											var subscription = observable.subscribe({
												next: function (response) {
													$(".layui-m-layer2 p").text('上传进度 ' + Math.round(response.total.percent) + '%');
												},
												error: function (err) {
													subscription.unsubscribe();
													self.close(loadindex);
													func && func({ code: '-1', msg: '上传出错' });
												},
												complete: function (res) {
													subscription.unsubscribe();
													self.filepathsave({
														filetype: '1',
														filepath: filepath,
														layerindex: loadindex,
														fromtype: params.type
													}, func);
												}
											});
										}
									} else {
										self.close(loadindex);
										func && func(json);
									}
								}, function () {
									self.close(loadindex);
									func && func({ code: '-1', msg: '上传出错' });
								});
							}
						});
					}
				});
			}
		},
		downUploadImg: function (params, localId, func) {
			var self = this;
			(parent.wx || wx).getLocalImgData({
				localId: localId,
				success: function (res) {
					var localData = res.localData;
					if (localData.indexOf('data:image') != 0) {
						localData = 'data:image/jpeg;base64,' + localData;
					}
					localData = localData.replace(/\r|\n/g, '');
					var amtype = XCV3Config.amconfig.type || '0';
					if (amtype == '0') {
						self.ajaxSubmit(params.posturl, { base64img: localData, fromtype: params.type }, '图片上传中，请稍后....').then(function (data) {
							func && func(data);
						}, function (data) {
							func && func({ code: '-1', msg: '网络超时，上传失败' });
						});
					} else {
						//base64转file对象
						var file = self.dataURLtoFile(localData, ''), mime = file.type.replace('image/', '').toLowerCase(), filepath = "attachment/wechat/" + params.type + "/" + XCV3Config.rhdid + '/' + self.randomString(32) + '.' + mime;
						var appmaxsize = XCV3Config.amconfig.image.appsize || 1024, appexts = XCV3Config.amconfig.image.ext || 'jpg,jpeg,png';
						if (file.size == 0) {
							func && func({ code: '-1', msg: '请选择文件' });
							return false;
						}
						if (file.size > appmaxsize * 1024) {
							func && func({ code: '-1', msg: '只能上传' + parseFloat(appmaxsize / 1024).toFixed(2) + 'M内的图片文件' });
							return false;
						}
						if (appexts.indexOf(mime) == -1) {
							func && func({ code: '-1', msg: '只能上传' + appexts + '格式的图片文件' });
							return false;
						}
						var loadindex = self.loading('图片上传中，请稍后...');
						self.ajaxSubmit('/common/sts/getsts', { type: XCV3Config.amconfig.type }).then(function (json) {
							if (json.code == 0) {
								if (amtype == '1') {
									var client = new directup(json.msg);
									async function putObject() {
										try {
											var result = await client.multipartUpload(
												filepath,
												file,
												{
													progress: function (p, cpt, res) {
														$(".layui-m-layer2 p").text('上传进度 ' + Math.round(p * 100) + '%');
													},
												},
											);
											self.filepathsave({
												filetype: '1',
												filepath: filepath,
												layerindex: loadindex,
												fromtype: params.type
											}, func);
										} catch (e) {
											self.close(loadindex);
											func && func({ code: '-1', msg: '上传出现异常，请稍后重试' });
										}
									}
									putObject();
								} else if (amtype == '2') {
									var credentials = json.msg, url = 'https://' + credentials.bucket + '.cos.' + credentials.region + '.myqcloud.com/' + self.camSafeUrlEncode(filepath).replace(/%2F/g, '/'), xhr = new XMLHttpRequest();
									xhr.open('PUT', url, true);
									xhr.setRequestHeader('Authorization', window.CosAuth({
										SecretId: credentials.key,
										SecretKey: credentials.secret,
										Method: 'PUT',
										Pathname: '/' + filepath,
									}));
									xhr.setRequestHeader('x-cos-security-token', credentials.token);
									xhr.upload.onprogress = function (e) {
										$(".layui-m-layer2 p").text('上传进度 ' + (Math.round(e.loaded / e.total * 10000) / 100) + '%');
									};
									xhr.onload = function () {
										if (/^2\d\d$/.test('' + xhr.status)) {
											self.filepathsave({
												filetype: '1',
												filepath: filepath,
												layerindex: loadindex,
												fromtype: params.type
											}, func);
										} else {
											self.close(loadindex);
											func && func({ code: '-1', msg: '文件上传失败，状态码：' + xhr.status });
										}
									};
									xhr.onerror = function (err) {
										self.close(loadindex);
										func && func({ code: '-1', msg: '文件上传失败，请检查是否没配置 CORS 跨域规则' });
									};
									xhr.send(file);
								} else {
									var observable = directup.upload(file, filepath, json.msg, {
										customVars: { "x:name": filepath.split('.')[0] }
									}, {
										checkByServer: true,
										checkByMD5: true,
										forceDirect: false,
										disableStatisticsReport: false,
										retryCount: 6,
										debugLogLevel: 'INFO'
									});
									var subscription = observable.subscribe({
										next: function (response) {
											$(".layui-m-layer2 p").text('上传进度 ' + Math.round(response.total.percent) + '%');
										},
										error: function (err) {
											subscription.unsubscribe();
											self.close(loadindex);
											func && func({ code: '-1', msg: '上传出错' });
										},
										complete: function (res) {
											subscription.unsubscribe();
											self.filepathsave({
												filetype: '1',
												filepath: filepath,
												layerindex: loadindex,
												fromtype: params.type
											}, func);
										}
									});
								}
							} else {
								self.close(loadindex);
								func && func(json);
							}
						}, function () {
							self.close(loadindex);
							func && func({ code: '-1', msg: '上传出错' });
						});
					}
				}
			});
		},
		uploadVideo: function (params, func) {
			var self = this, files = params.files;
			var file = files[0], appmaxsize = XCV3Config.amconfig.video.appsize || 2048, appexts = XCV3Config.amconfig.video.ext || 'mp4,mov,ogg,webm';
			if (file.size == 0) {
				func && func({ code: '-1', msg: '请选择文件' });
				return false;
			}
			if (file.size > appmaxsize * 1024) {
				func && func({ code: '-1', msg: '只能上传' + parseFloat(appmaxsize / 1024).toFixed(2) + 'M内的视频文件' });
				return false;
			}
			var mime = file.type.replace('video/', '').toLowerCase(), filepath = "attachment/wechat/" + params.type + "/" + XCV3Config.rhdid + "/videos/" + self.randomString(32) + '.' + mime;
			if (appexts.indexOf(mime) == -1) {
				func && func({ code: '-1', msg: '只能上传' + appexts + '格式的视频文件' });
				return false;
			}
			$('.bpUploadBox').hide();
			var amtype = XCV3Config.amconfig.type || '0';
			if (amtype == '0') {
				self.uploadFile({ fileobj: file, fromtype: params.type }, function (json) {
					func && func(json);
				}, function (percent) {
					$(".layui-m-layer2 p").text('上传进度 ' + percent + '%');
				});
			} else {
				var loadindex = self.loading('视频上传中，请稍后...');
				self.ajaxSubmit('/common/sts/getsts', { type: XCV3Config.amconfig.type }).then(function (json) {
					if (json.code == 0) {
						if (amtype == '1') {
							var client = new directup(json.msg);
							async function putObject() {
								try {
									var result = await client.multipartUpload(
										filepath,
										file,
										{
											progress: function (p, cpt, res) {
												$(".layui-m-layer2 p").text('上传进度 ' + Math.round(p * 100) + '%');
											},
										},
									);
									self.filepathsave({
										filetype: '2',
										filepath: filepath,
										layerindex: loadindex,
										fromtype: params.type
									}, func);
								} catch (e) {
									self.close(loadindex);
									func && func({ code: '-1', msg: '上传出现异常，请稍后重试' });
								}
							}
							putObject();
						} else if (amtype == '2') {
							var credentials = json.msg, url = 'https://' + credentials.bucket + '.cos.' + credentials.region + '.myqcloud.com/' + self.camSafeUrlEncode(filepath).replace(/%2F/g, '/'), xhr = new XMLHttpRequest();
							xhr.open('PUT', url, true);
							xhr.setRequestHeader('Authorization', window.CosAuth({
								SecretId: credentials.key,
								SecretKey: credentials.secret,
								Method: 'PUT',
								Pathname: '/' + filepath,
							}));
							xhr.setRequestHeader('x-cos-security-token', credentials.token);
							xhr.upload.onprogress = function (e) {
								$(".layui-m-layer2 p").text('上传进度 ' + (Math.round(e.loaded / e.total * 10000) / 100) + '%');
							};
							xhr.onload = function () {
								if (/^2\d\d$/.test('' + xhr.status)) {
									self.filepathsave({
										filetype: '2',
										filepath: filepath,
										layerindex: loadindex,
										fromtype: params.type
									}, func);
								} else {
									self.close(loadindex);
									func && func({ code: '-1', msg: '文件上传失败，状态码：' + xhr.status });
								}
							};
							xhr.onerror = function (err) {
								self.close(loadindex);
								func && func({ code: '-1', msg: '文件上传失败，请检查是否没配置 CORS 跨域规则' });
							};
							xhr.send(file);
						} else {
							var observable = directup.upload(file, filepath, json.msg, {
								customVars: { "x:name": filepath.split('.')[0] }
							}, {
								checkByServer: true,
								checkByMD5: true,
								forceDirect: false,
								disableStatisticsReport: false,
								retryCount: 6,
								debugLogLevel: 'INFO'
							});
							var subscription = observable.subscribe({
								next: function (response) {
									$(".layui-m-layer2 p").text('上传进度 ' + Math.round(response.total.percent) + '%');
								},
								error: function (err) {
									subscription.unsubscribe();
									self.close(loadindex);
									func && func({ code: '-1', msg: '上传出错' });
								},
								complete: function (res) {
									subscription.unsubscribe();
									self.filepathsave({
										filetype: '2',
										filepath: filepath,
										layerindex: loadindex,
										fromtype: params.type
									}, func);
								}
							});
						}
					} else {
						self.close(loadindex);
						func && func(json);
					}
				}, function () {
					self.close(loadindex);
					func && func({ code: '-1', msg: '上传出错' });
				});
			}
		},
		uploadFile: function (file, func, progress) {
			var self = this, loadindex = self.loading('视频文件上传中，请稍后...');
			var formData = new FormData();
			formData.append('hdid', XCV3Config.hdid);
			if (file.fromtype) formData.append('fromtype', file.fromtype);
			formData.append('file', file.fileobj);
			$.ajax({
				url: "/wechat/common/uploadfile",
				type: "POST",
				processData: false,
				contentType: false,
				data: formData,
				success: function (json) {
					self.close(loadindex);
					func && func(json);
				},
				error: function (data) {
					self.close(loadindex);
					func && func({ code: '-1', msg: '出现异常，请稍后重试' });
				},
				xhr: function () {
					var xhr = new XMLHttpRequest();
					xhr.upload.addEventListener('progress', function (e) {
						var percent = (e.loaded / e.total) * 100;
						progress && progress(parseFloat(percent).toFixed(2));
					});
					return xhr;
				},
			});
		},
		filepathsave: function (params, func) {
			var self = this, filetype = params.filetype || '1';
			if (filetype == '1') {
				self.ajaxSubmit('/wechat/common/savestsfile', { isweb: '2', fromtype: params.fromtype, filetype: '1', filepath: params.filepath }).then(function (json) {
					self.close(params.layerindex);
					func && func(json);
				}, function () {
					self.close(params.layerindex);
					func && func({ code: '-1', msg: '上传出错' });
				});
			} else {
				self.ajaxSubmit('/wechat/common/snapshotstsfile', { isweb: '2', fromtype: params.fromtype, filetype: '1', filepath: params.filepath }).then(function (json) {
					self.close(params.layerindex);
					func && func(json);
				}, function () {
					self.close(params.layerindex);
					func && func({ code: '-1', msg: '上传出错' });
				});
			}
		},
		base64imgtoMime: function (dataurl) {
			var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
			return mime;
		},
		dataURLtoFile: function (dataurl, filename) {
			var arr = dataurl.split(',');
			var mime = arr[0].match(/:(.*?);/)[1];
			var bstr = atob(arr[1]);
			var n = bstr.length;
			var u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			//转换成file对象
			return new File([u8arr], filename, { type: mime });
			//转换成成blob对象
			//return new Blob([u8arr],{type:mime});
		},
		//将base64转换为blob
		dataURLtoBlob: function (dataurl) {
			var arr = dataurl.split(','),
				mime = arr[0].match(/:(.*?);/)[1],
				bstr = atob(arr[1]),
				n = bstr.length,
				u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new Blob([u8arr], { type: mime });
		},
		//将blob转换为file
		blobToFile: function (theBlob, fileName) {
			theBlob.lastModifiedDate = new Date();
			theBlob.name = fileName;
			return new File([theBlob], fileName, { type: theBlob.type, lastModified: Date.now() });
		},
		//用户选择本地手机图片直接生成图片base64
		getwximgbase64: function (func, params) {
			var self = this, maxnum = params.maxnum || 1, sourcetype = params.sourcetype || '1', sourcetypes = [];
			if (sourcetype == '2') {
				sourcetypes = ['camera'];
			} else if (sourcetype == '3') {
				sourcetypes = ['album'];
			} else {
				sourcetypes = ['album', 'camera'];
			}
			if (XCV3Config.clienttype == '1') {
				if (maxnum > 9) maxnum = 9;
				(parent.wx || wx).chooseImage({
					count: maxnum,
					sourceType: sourcetypes,
					success: function (res) {
						var localIds = res.localIds;
						for (var i = 0; i < localIds.length; i++) {
							var localId = localIds[i];
							(parent.wx || wx).getLocalImgData({
								localId: localId,
								success: function (res) {
									var localData = res.localData;
									if (localData.substr(0, 5) != 'data:') {
										localData = 'data:image/jpg;base64,' + localData;
									}
									localData = localData.replace(/\r|\n/g, '');
									func && func(localData);
								}
							});
						}
					}
				});
			} else {
				//H5上传
				if (sourcetype == '2') {
					var content = '<div class="cameraphoto">拍照<input type="file" accept=".jpg,.jpeg,.png,.gif" capture="camera"></div>';
				} else if (sourcetype == '3') {
					var content = '<div class="phonephoto">从手机相册选择<input type="file" accept=".jpg,.jpeg,.png,.gif"></div>';
				} else {
					var content = '<div class="cameraphoto">拍照<input type="file" accept=".jpg,.jpeg,.png,.gif" capture="camera"></div><div class="phonephoto">从手机相册选择<input type="file" accept=".jpg,.jpeg,.png,.gif"></div>';
				}
				var uploadlayer = layer.open({
					content: content,
					btn: '取消',
					skin: 'footer',
					anim: 'up',
					className: "zam-app-uploadImgbox",
					success: function (elem) {
						$(elem).find('input').unbind('change').bind('change', function () {
							var imgfile = $(this).get(0).files[0];
							if (imgfile.size == 0) {
								return self.msg('请选择文件');
							}
							self.close(uploadlayer);
							var loadindex = self.loading('图片上传中，请稍后...');
							var reader = new FileReader();
							reader.readAsDataURL(imgfile);
							reader.onloadend = function () {
								self.close(loadindex);
								var base64 = reader.result;
								func && func(base64);
							}
						});
					},
				});
			}
		},
		previewImage: function (e) {
			var imgArray = [], thisimg = $(e).attr('src');
			if (XCV3Config.clienttype == '-1000') {
				imgArray.push(thisimg);
				(parent.wx || wx).previewImage({
					current: thisimg,
					urls: imgArray
				});
			} else {
				const myGallery = GLightbox({
					lightboxHTML: `<div id="glightbox-body" class="glightbox-container">
					    <div class="gloader visible"></div>
					    <div class="goverlay"></div>
					    <div class="gcontainer">
					    <div id="glightbox-slider" class="gslider"></div>
					    <button class="gnext gbtn" tabindex="0" aria-label="Next" data-customattribute="example">{nextSVG}</button>
					    <button class="gprev gbtn" tabindex="1" aria-label="Previous">{prevSVG}</button>
					    <button class="gclose gbtn" tabindex="2" aria-label="Close">{closeSVG}</button>
					    <div class="glightbox-count"><span>1</span> / <span>1</span></div>
					</div>
					</div>`,
					elements: [
						{
							'href': thisimg,
							'type': 'image',
							'title': '',
							'description': '',
						},
					],
				});
				myGallery.open();
			}
		},
		previewImages: function (e) {
			var imgArray = [], thisimg = $(e).attr('src'), someImgBox = $(e.parentNode.parentNode).find('img');
			if (XCV3Config.clienttype == '-1000') {
				if (someImgBox.length > 1) {
					someImgBox.each(function (index, element) {
						imgArray.push($(element).attr('src'));
					});
				} else {
					imgArray.push(thisimg);
				}
				(parent.wx || wx).previewImage({
					current: thisimg,
					urls: imgArray
				});
			} else {
				var startAt = 0;
				if (someImgBox.length > 1) {
					someImgBox.each(function (index, element) {
						var url = $(element).attr('src') || '';
						if (url == thisimg) {
							startAt = index;
						}
						imgArray.push({
							'href': url,
							'type': 'image',
							'title': '',
							'description': '',
						});
					});

				} else {
					imgArray.push({
						'href': thisimg,
						'type': 'image',
						'title': '',
						'description': '',
					});
				}
				const myGallery = GLightbox({
					lightboxHTML: `<div id="glightbox-body" class="glightbox-container">
					    <div class="gloader visible"></div>
					    <div class="goverlay"></div>
					    <div class="gcontainer">
					    <div id="glightbox-slider" class="gslider"></div>
					    <button class="gnext gbtn" tabindex="0" aria-label="Next" data-customattribute="example">{nextSVG}</button>
					    <button class="gprev gbtn" tabindex="1" aria-label="Previous">{prevSVG}</button>
					    <button class="gclose gbtn" tabindex="2" aria-label="Close">{closeSVG}</button>
					    <div class="glightbox-count" style="position:fixed;top:20px;left:0;width:100%;color:#fff;text-align:center;font-size:0.32rem;"><span>${startAt + 1}</span> / <span>${imgArray.length}</span></div>
					</div>
					</div>`,
					elements: imgArray,
					startAt: startAt,
					touchNavigation: true,
				});
				myGallery.open();
				myGallery.on('slide_changed', function (p, c) {
					var currentIndex = p.current.index || 0;
					$(".glightbox-container .glightbox-count span").eq(0).text(currentIndex + 1);
				});
			}
		},
		waitImgLoad: function (callback) {
			var self = this;
			var t_img_load;
			var img_isLoad = true;
			if ($('.needwait').length > 0) {
				$('.needwait').each(function () {
					if (this.height === 0) {
						img_isLoad = false;
						return false;
					}
				});
				if (img_isLoad) {
					clearTimeout(t_img_load);
					callback && callback();
				} else {
					img_isLoad = true;
					t_img_load = setTimeout(function () {
						self.waitImgLoad(callback);
					}, 500);
				}
			} else {
				callback && callback();
			}
		},
		requestTransfer: function (data, func) {
			(parent.wx || wx).checkJsApi({
				jsApiList: ['requestMerchantTransfer'],
				success: function (res) {
					if (res.checkResult['requestMerchantTransfer']) {
						WeixinJSBridge.invoke('requestMerchantTransfer', {
							mchId: data.mch_id || '',
							appId: data.app_id || '',
							package: data.packageinfo || '',
						},
							function (res) {
								// res.err_msg将在页面展示成功后返回应用时返回success，并不代表付款成功
								// if (res.err_msg === 'requestMerchantTransfer:ok') {

								// }
								func && func(res);
							}
						);
					} else {
						func && func('你的微信版本过低，请更新至最新版本。');
					}
				}
			});
		},
		alert: function (obj) {
			if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
				obj = JSON.stringify(obj);
			}
			alert(obj);
		},
		timeTostring: function (time, type) {
			if (time) {
				var now = new Date(time * 1000);
			} else {
				var now = new Date();
			}
			if (!type) type = 1;
			var year = now.getFullYear();
			var month = now.getMonth() + 1;
			var date = now.getDate();
			var hour = now.getHours();
			var minute = now.getMinutes();
			var second = now.getSeconds();
			if (type == '1') {
				return (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date) + " " + (hour < 10 ? '0' + hour : hour) + ":" + (minute < 10 ? '0' + minute : minute) + ":" + (second < 10 ? '0' + second : second);
			} else {
				return year + '-' + (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date) + " " + (hour < 10 ? '0' + hour : hour) + ":" + (minute < 10 ? '0' + minute : minute) + ":" + (second < 10 ? '0' + second : second);
			}
		},
		newjoin: function (name) {
			var self = this;
			if (!name) return;
			var joinBox = $('.newjoin-enter');
			if (joinBox.hasClass('movein')) {
				clearTimeout(self.newjointimer);
			}
			joinBox.removeClass('moveout');
			joinBox.addClass('movein').find('.name').text(name);
			self.newjointimer = setTimeout(function () {
				joinBox.removeClass('movein').addClass('moveout').find('.name').text('');
				setTimeout(function () {
					joinBox.removeClass('moveout');
				}, 400)
			}, 2500)
		},
		gotopage: function (find, url) {
			var self = this;
			var nowpage = window.location.href;
			if (nowpage.indexOf(find) === -1) {
				self.reloadpage(url);
			}
		},
		reloadpage: function (url) {
			if (!url) {
				//url = this.reloadUrl(window.location.href);
				window.location.reload();
			} else {
				window.location.href = url;
			}
			//window.location.replace(url);
		},
		reloadUrl: function (url, key) {
			return url;
			/*var key= (key || 't') +'='; 
			var reg=new RegExp(key+'\\d+');  
			var timestamp=+new Date();
			if(url.indexOf(key)>-1){ 
				return url.replace(reg,key+timestamp);
			}else{  
				if(url.indexOf('\?')>-1){
					var urlArr=url.split('\?');
					if(urlArr[1]){
						return urlArr[0]+'?'+key+timestamp+'&'+urlArr[1];
					}else{
						return urlArr[0]+'?'+key+timestamp;
					}
				}else{
					if(url.indexOf('#')>-1){
						return url.split('#')[0]+'?'+key+timestamp+location.hash;
					}else{
						return url+'?'+key+timestamp;
					}
				}
			}*/
		},
		clickalink: function (data) {
			var self = this;
			if (!XCV3Config.isiframe) {
				if (window.location.href.indexOf(data.url) == -1) window.location.href = data.url;
			} else {
				if (typeof (data.r) != "undefined") {
					self.sendMsg2frame(data.r, data.url);
					$("body .zam-app-common-menuBox .closemenu").trigger('click');
				} else {
					self.sendMsg2frame('virtrulmodule', data.url);
				}
			}
		},
		goto: function (data) {
			if (XCV3Config.isiframe) return false;
			/*大屏幕点击其他功能切换跳转到此处*/
			if (window.location.href.indexOf(data.r) < 0) {
				window.location.href = data.url;
			}
		},
		sendMsg2frame: function (r, url) {
			if (!XCV3Config.isiframe) return false;
			var nowpage = window.location.href;
			if (nowpage.indexOf(url) == -1) {
				window.parent.postMessage({
					msg: { 'module': r, 'url': url }
				}, '*');
			}
		},
		layerAsklucker: function (data, reloadurl) {
			var self = this;
			if (!XCV3Config.isiframe) {
				reloadurl = reloadurl || '/wechat/home/myrecord?hdid=' + XCV3Config.hdid;
				$.each(data.userids, function (i, v) {
					if (v.user_id && v.id && v.user_id == XCV3Config.userid) {
						self.ajaxSubmit("/wechat/common/ajaxluckinfo", { recordid: v.id, gametype: data.gametype }).then(function (json) {
							if (json.code == 0) {
								var content = '', fromname = json.msg.fromname || '', stylename = json.msg.stylename || '';
								if (fromname != '') {
									content += `<div class="lotterymodule"><span class="fromstylespan">${stylename || fromname}</span></div>`;
								}
								if (window.location.host != 'hd.52hudong.cn') {
									content += json.msg.prizetype == '1' ? '(实物)' : '(红包)';
								}
								content += (json.msg.awardname ? json.msg.awardname + ' - ' : '') + json.msg.prizename + (json.msg.prizetype == '2' ? (' - ' + json.msg.prizemoney + '元') : '');
								self.ask('恭喜您中奖啦', content, ['查看详情', '关闭'], function (index) {
									self.close(index);
									self.reloadpage(reloadurl);
								});
							}
						});
					}
				})
			} else {
				//self.senddmMsg2frame('luckopenids',data);	
			}
		},
		randomInt: function (n, m) {
			var random = Math.floor(Math.random() * (m - n + 1) + n);
			return random;
		},
		randomString: function (len) {
			len = len || 32;
			/****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
			var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
			var maxPos = $chars.length;
			var pwd = '';
			for (i = 0; i < len; i++) {
				pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
			}
			return pwd;
		},
		showWxpay: function (data, func, func2) {
			var self = this;
			(parent.wx || wx).chooseWXPay({
				timestamp: "" + data.timestamp,
				nonceStr: data.nonceStr,
				package: data.package,
				signType: data.signType,
				paySign: data.paySign,
				success: function (res) {
					func && func(res);
				},
				cancel: function (err) {
					func2 && func2(err);
				},
				fail: function (res) {
					self.msg('支付出错，请稍后重试');
				},
			});
		},
		isminiProgram: function () {
			var ua = navigator.userAgent.toLowerCase(), iswxprogram = '2';
			if (ua.match(/MicroMessenger/i) == "micromessenger") {
				(parent.wx || wx).miniProgram.getEnv(function (res) {
					if (res.miniprogram) {
						iswxprogram = '1';
					}
				})
			}
			return iswxprogram;
		},
		gamePayrotate: function (rotateid, fee, func, cancel) {
			var self = this, iswxprogram = self.isminiProgram();
			var blayindex = self.bpopupBox(self.tpl($("#payrotate-tpl"), { fee: fee }), 'apppayrotate');
			$("body").off('click').on('click', '.apppayrotate .btn-payrotate', function () {
				var $this = $(this), orderdata = { gametype: XCV3Config.gametype, rotateid: rotateid, fee: fee, iswxprogram: iswxprogram };
				$this.addClass('btn-disabled');
				self.ajaxSubmit('/wechat/common/wxpay', orderdata, '正在发起支付..').then(function (json) {
					$this.removeClass('btn-disabled');
					if (json.code == 0) {
						self.showWxpay(json.msg, function (res) {
							self.close(blayindex);
							self.msg('支付成功');
							func && func();
						}, function (err) {
							self.close(blayindex);
							self.msg('您已取消支付');
							cancel && cancel();
						});
					} else if (json.code == 1) {
						self.close(blayindex);
						self.reloadpage(json.msg);
					} else if (json.code == 3) {
						(parent.wx || wx).miniProgram.navigateTo({ 'url': '/pages/minipay/index?orderdata=' + encodeURIComponent(JSON.stringify(json.msg)) });
					} else {
						self.msg(json.msg);
					}
				}, function () {
					self.msg('网络太差,发起支付失败');
				});
			});
		},
		shakePermit: function (func) {
			var self = this;
			if (typeof (DeviceMotionEvent) !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
				window.DeviceMotionEvent.requestPermission().then(function (r) {
					if (r != 'granted') {
						self.ask('温馨提醒', '您已拒绝授权准许访问手机的动作与方向，请关闭微信app后重新进入游戏，授权准许即可参与游戏', ['我知道了'], function (index) {
							self.close(index);
						});
					} else {
						func && func();
					}
				}).catch(function (t) {
					self.ask('温馨提醒', '苹果ios13以上系统需要您授权准许访问手机的动作与方向才可以参与本游戏', ['马上去授权'], function (index) {
						self.close(index);
						window.DeviceMotionEvent.requestPermission().then(function (r) {
							if (r != 'granted') {
								self.ask('温馨提醒', '您已拒绝授权准许访问手机的动作与方向，请关闭微信app后重新进入游戏，点击准许即可参与游戏', ['我知道了'], function (index) {
									self.close(index);
								});
							} else {
								func && func();
							}
						})
					});
				});
			} else {
				func && func();
			}
		},
		shakePermit2: function (func, sdk) {
			var self = this;
			if (typeof (DeviceMotionEvent) !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
				if (XCV3Config.clienttype == '1') {
					(parent.wx || wx).getNetworkType({
						success: function (res) {
							window.DeviceMotionEvent.requestPermission().then(function (r) {
								if (r != 'granted') {
									self.ask('温馨提醒', '您已拒绝授权准许访问手机的动作与方向，请关闭微信app后重新进入游戏，点击准许即可参与游戏', ['我知道了'], function (index) {
										self.close(index);
									});
								} else {
									func && func();
								}
							}).catch(function (t) {
								window.DeviceMotionEvent.requestPermission().then(function (r) {
									if (r != 'granted') {
										self.ask('温馨提醒', '您已拒绝授权准许访问手机的动作与方向，请关闭微信app后重新进入游戏，点击准许即可参与游戏', ['我知道了'], function (index) {
											self.close(index);
										});
									} else {
										func && func();
									}
								})
							});
						}
					})
				} else if (XCV3Config.clienttype == '2') {
					window.DeviceMotionEvent.requestPermission().then(function (r) {
						if (r != 'granted') {
							self.ask('温馨提醒', '您已拒绝授权准许访问手机的动作与方向，请关闭抖音app后重新进入游戏，点击准许即可参与游戏', ['我知道了'], function (index) {
								self.close(index);
							});
						} else {
							func && func();
						}
					}).catch(function (t) {
						window.DeviceMotionEvent.requestPermission().then(function (r) {
							if (r != 'granted') {
								self.ask('温馨提醒', '您已拒绝授权准许访问手机的动作与方向，请关闭抖音app后重新进入游戏，点击准许即可参与游戏', ['我知道了'], function (index) {
									self.close(index);
								});
							} else {
								func && func();
							}
						})
					});
				} else {
					var Tiptitle = '温馨提醒';
					var Refusetitle = '您已拒绝授权访问手机的动作与方向权限，请关闭浏览器重新扫码进入游戏';
					var Permittitle = '由于IOS系统需要手动获取访问动作与方向的权限，为保障游戏正常运行，请在访问提示中点击允许。';
					var Gotit = '我知道了';
					if (XCV3Config.rhdid === 'en') {
						Tiptitle = 'Tips';
						Refusetitle = 'You have refused authorization to access the action and direction permissions of your phone,Please close the browser and re-enter the game';
						Permittitle = "Due to the need for manual access to actions and directions in the IOS system, to ensure the normal operation of the game, please click 'Allow' in the access prompt.";
						Gotit = 'Got it!';
					}
					if (window.location.host == 'hd.miboxianchang.cn' && XCV3Config.rhdid === '2828') {
						Tiptitle = '溫馨提醒';
						Refusetitle = '您已拒絕授權訪問手機的動作與方向權限，請關閉瀏覽器重新掃碼進入遊戲';
						Permittitle = "由於IOS系統需要手動獲取訪問動作與方向的權限，為保障遊戲正常運行，請在訪問提示中點擊允許。";
						Gotit = '我知道了';
					}
					window.DeviceMotionEvent.requestPermission().then(function (r) {
						if (r != 'granted') {
							self.ask(Tiptitle, Refusetitle, [Gotit], function (index) {
								self.close(index);
							});
						} else {
							func && func();
						}
					}).catch(function (t) {
						self.ask(Tiptitle, Permittitle, [Gotit], function (index) {
							self.close(index);
							window.DeviceMotionEvent.requestPermission().then(function (r) {
								if (r != 'granted') {
									self.ask(Tiptitle, Refusetitle, [Gotit], function (index) {
										self.close(index);
									});
								} else {
									func && func();
								}
							})
						});
					});
				}
			} else {
				func && func();
			}
		},
		gameInit: function (obj) {
			var self = this, obj = obj || false;
			if (!obj) return false;
			if (XCV3Config.clienttype == '1') {
				(parent.wx || wx).ready(function () {
					if (typeof obj === "function") {
						obj();
					} else {
						self.shakePermit2(function () {
							obj.init();
						});
					}
				});
			} else if (XCV3Config.clienttype == '2') {
				self.douyinInit(function () {
					if (typeof obj === "function") {
						obj();
					} else {
						self.shakePermit2(function () {
							obj.init();
						});
					}
				});
			} else {
				if (typeof obj === 'function') {
					obj && obj();
				} else {
					obj && self.shakePermit2(function () {
						obj.init();
					});
				}
			}
		},
		douyinInit: function (func) {
			dysdkobj = parent.DouyinOpenJSBridge || DouyinOpenJSBridge;
			dysdkobj.config({
				params: {
					client_key: XCV3Config.douyinjssdk.client_key,
					signature: XCV3Config.douyinjssdk.signature,
					timestamp: XCV3Config.douyinjssdk.timestamp,
					nonce_str: XCV3Config.douyinjssdk.nonce_str,
					url: XCV3Config.douyinjssdk.url,
				}
			});
			dysdkobj.ready(function () {
				func && func()
			});
			dysdkobj.error(function (res) {
				func && func()
			});
		},
		playAudio: function (audio, type) {
			var self = this, type = type || '1';
			if (XCV3Config.clienttype == '1') {
				(parent.wx || wx).getNetworkType({
					success: function (res) {
						self.playAudiotypes(audio, type);
					}
				});
			} else if (XCV3Config.clienttype == '2') {
				if (dysdkobj) {
					dysdkobj.bridge.call('music', {}, function (res) {
						self.playAudiotypes(audio, type);
					}, function (res) {
						self.playAudiotypes(audio, type);
					});
				}
			} else {
				self.playAudiotypes(audio, type);
			}
		},
		playAudiotypes: function (audio, type) {
			var self = this;
			if (type == '1') {
				/*
				audio.play().then(function(){}).catch(function(err){
					//self.howlerPlay(audio);
				});
				*/
				if (self.device(1)) {
					audio.play();
				} else {
					self.howlerPlay(audio);
				}
			} else {
				audio.play();
			}
		},
		howlerPlay: function (audio) {
			var sound = new Howl({
				src: [audio.src],
				loop: audio.loop || false,
				onplayerror: function (err) {
					sound.once('unlock', function () {
						sound.play();
					});
				}
			});
			if (sound.playing()) sound.stop();
			sound.play();
		},
		/*数组按某值排序 */
		sortBy: function (attr, rev) {
			rev = rev || 1;
			return function (a, b) {
				a = a[attr];
				b = b[attr];
				if (a < b) {
					return rev * -1;
				}
				if (a > b) {
					return rev * 1;
				}
				return 0;
			}
		},
		mediaUrl: function (url) {
			if (url == '') return url;
			var http = url.substr(0, 7).toLowerCase(), https = url.substr(0, 8).toLowerCase();
			if (http === "http://" || https === "https://") {
				return url;
			}
			return XCV3Config.attchurl + url;
		},
		onlynum: function (e) {
			var obj = $(e.target);
			if (obj.val().length == 1) {
				obj.val(obj.val().replace(/[^1-9]/g, ''));
			} else {
				obj.val(obj.val().replace(/\D/g, ''));
			}
		},
		onlynumorpoint: function (e) {
			var obj = $(e.target);
			var regStrs = [
				['[^\\d\\.]+$', ''],
				['\\.(\\d?)\\.+', '.$1'],
				['^(\\d+\\.\\d{2}).+', '$1']
			];
			for (i = 0; i < regStrs.length; i++) {
				var reg = new RegExp(regStrs[i][0]);
				obj.val(obj.val().replace(reg, regStrs[i][1]));
			}
		},
		connectsocket: function (data) {
			var self = this;
			data.module = XCV3Config.gametype;
			self.ajaxSubmit("/wechat/common/binduid", data).then(function (data) {
				if (data.code != 0) {
					self.msg(data.msg);
				} else {
				}
			}, function () {
				console.log('网络太差链接socket服务失败，请稍后重试');
			});
		},
		getwxlocation: function (func, func2) {
			var self = this;
			(parent.wx || wx).ready(function () {
				(parent.wx || wx).getLocation({
					type: 'wgs84',
					success: function (res) {
						func && func(res);
					},
					cancel: function (res) {
						func2 && func2(res);
					}
				});
			});
		},
		closewxwindow: function () {
			(parent.wx || wx).closeWindow();
		},
		hidewxmenu: function () {
			(parent.wx || wx).hideOptionMenu();
		},
		subnoticeErrormsg: function (code) {
			var errors = {
				'10001': '参数传空了',
				'10002': '网络问题，请求消息列表失败',
				'10003': '网络问题，订阅请求发送失败',
				'10004': '参数类型错误',
				'20001': '没有模板数据，一般是模板id错误或与模板类型不对应',
				'20002': '模板消息类型不一致，既有一次性的又有永久的',
				'20003': '模板消息数量超过上限',
				'20004': '用户关闭了主开关，无法进行订阅',
				'20005': '服务号被封禁',
			};
			return errors[code] || '订阅出现异常';
		},
		distinct: function (arr, key) {
			var newobj = {}, newArr = [], key = key || 'id';
			if ($.isArray(arr) && arr.length > 0) {
				for (var i = 0; i < arr.length; i++) {
					var item = arr[i], keyv = item[key] || '';
					if (keyv != '' && !newobj[keyv]) {
						newobj[keyv] = newArr.push(item);
					}
				}
			}
			return newArr;
		},
		towxminivippage: function () {
			var params = encodeURIComponent(JSON.stringify({
				userid: XCV3Config.userid,
				openid: XCV3Config.openid,
			}));
			(parent.wx || wx).miniProgram.navigateTo({ 'url': `/pages/vip/index?params=${params}` });
		},
		towxminiPhonePage: function () {
			var self = this, clickbtn = false;
			if (XCV3Config.isminiProgram == '1') {
				var params = encodeURIComponent(JSON.stringify({
					userid: XCV3Config.userid,
					openid: XCV3Config.openid,
					type: '1',
				}));
				(parent.wx || wx).miniProgram.navigateTo({ 'url': `/pages/phone/index?params=${params}` });
			} else {
				if (clickbtn) {
					return false;
				}
				clickbtn = true;
				self.ajaxSubmit(`/wechat/sign/makeschemeurl`, { module: 'sign' }, '正在处理请求...').then(function (json) {
					if (json.code == 0) {
						window.location.href = json.msg;
					} else {
						wechatcore.msg(json.msg);
					}
					clickbtn = false;
				}, function () {
					clickbtn = false;
					wechatcore.msg('网络异常，请刷新重试');
				});
			}
		},
		towxminisubnoticepage: function (tplid) {
			var params = encodeURIComponent(JSON.stringify({
				userid: XCV3Config.userid,
				openid: XCV3Config.openid,
				tplid: tplid || '',
			}));
			(parent.wx || wx).miniProgram.navigateTo({ 'url': `/pages/subnotice/index?params=${params}` });
		},
	};
	return wechatcore;
});
