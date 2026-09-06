/*
* @Author: 赞木 / 红包墙 v2 视觉重构版 (终审整改版)
* @Date:   2022-11-29
* @Last Modified by:   Antigravity
* @Last Modified time: 2026-07-28
*/
define('screenhbwall', ['screencore', 'keyboard', 'layerBox', 'jquerytrans'], function(screencore, keyboardJS, layerBox) {

	/**
	 * 安全图片 URL 校验 (P2-1: 严格白名单校验)
	 * 仅允许: 相对路径、/开头的站内地址、http://、https://、blob:
	 */
	function sanitizeUrl(url) {
		if (!url) return '';
		url = String(url).trim();
		if (/^(https?:\/\/|\/|\.\/|\.\.\/|blob:)/i.test(url)) {
			return url;
		}
		if (/^[a-zA-Z0-9_\-\/]+\.[a-zA-Z0-9]+/.test(url)) {
			return url;
		}
		return '';
	}

	function getGiftKey($item) {
		var sourcePrizeId = $item.attr('data-prizeid') || '';
		var title = $item.attr('data-prizetitle') || $item.find('.prizetitle').text() || '';
		var name = $item.attr('data-prizename') || $item.find('.prizename').text() || '';
		var img = sanitizeUrl($item.attr('data-prizeimg') || $item.find('.prizeimg').attr('src') || '');

		if (sourcePrizeId) {
			return 'id_' + sourcePrizeId;
		}

		return (title || name || img) ? (title + '_' + name + '_' + img) : 'default_prize';
	}

	/**
	 * 横向且不带透明留白的礼品图需要提高基线，避免压住主推卡奖台。
	 */
	function applyFeaturedImageAspect($img) {
		var image = $img && $img[0];
		if (!image) return;

		function syncAspect() {
			if (!image.naturalWidth || !image.naturalHeight) return;
			$img.toggleClass('is-landscape', image.naturalWidth / image.naturalHeight >= 1.3);
		}

		$img.on('load', syncAspect);
		if (image.complete) {
			syncAspect();
		}
	}

	var screenhbwall = {
		config: null,
		giftData: {}, // 礼品数据字典: { key: { key, title, name, img, total, opened, remaining } }
		historyIds: [], // 已入库的中奖记录 ID 列表

		init: function(config) {
			var self = this;
			self.config = config;

			// 1. 初始化礼品安全聚合与 UI 渲染
			self.initGiftsAggregation();

			// 2. 初始化已开中奖历史记录
			self.initHistoryRecord();

			// 3. 初始化矩阵响应式自适应尺寸
			self.fitStageViewport();
			$(window).on('resize', function() {
				self.fitStageViewport();
			});

			// 4. 绑定 DOM 与键盘事件
			self.bindevent();

			// 5. 观众选择模式轮询 (保留现有业务逻辑)
			if (self.config.mode == '2') {
				self.ajaxselect();
				setInterval(function() {
					self.ajaxselect();
				}, 3e3);
			}

			screencore.sendMsg2frame({ 'type': 'hbwallchangeurl', 'rotateid': self.config.rotateid || '0' });
		},

		/**
		 * 礼品数据安全聚合。优先使用导入行/礼品配置 ID，兼容旧数据的稳定字段组合。
		 */
		initGiftsAggregation: function() {
			var self = this;
			self.giftData = {};
			var giftKeysOrder = [];

			$(".hbwall-box .hbwall-item").each(function() {
				var $item = $(this);
				var title = $item.attr('data-prizetitle') || $item.find('.prizetitle').text() || '';
				var name = $item.attr('data-prizename') || $item.find('.prizename').text() || '';
				var img = sanitizeUrl($item.attr('data-prizeimg') || $item.find('.prizeimg').attr('src') || '');
				var isOpened = $item.hasClass('hasopen');
				var key = getGiftKey($item);
				var displayOrder = parseInt($item.attr('data-displayorder'), 10);
				if (isNaN(displayOrder)) {
					displayOrder = parseInt($item.attr('data-packet-index'), 10) || 999999;
				}

				if (!self.giftData[key]) {
					self.giftData[key] = {
						key: key,
						title: title || '奖品',
						name: name || '精美礼品',
						img: img,
						total: 0,
						opened: 0,
						remaining: 0,
						sortOrder: displayOrder,
						firstSeen: giftKeysOrder.length
					};
					giftKeysOrder.push(key);
				} else {
					self.giftData[key].sortOrder = Math.min(self.giftData[key].sortOrder, displayOrder);
				}

				self.giftData[key].total += 1;
				if (isOpened) {
					self.giftData[key].opened += 1;
				}
			});

			// 计算剩余数量
			$.each(self.giftData, function(k, item) {
				item.remaining = Math.max(0, item.total - item.opened);
			});

			// 红包可随机排列，但礼品栏始终服从后台原始奖品顺序。
			giftKeysOrder.sort(function(leftKey, rightKey) {
				var left = self.giftData[leftKey];
				var right = self.giftData[rightKey];
				if (left.sortOrder !== right.sortOrder) {
					return left.sortOrder - right.sortOrder;
				}
				return left.firstSeen - right.firstSeen;
			});

			// 安全渲染礼品展示区 UI (使用 jQuery DOM 创建节点)
			self.renderGiftsUI(giftKeysOrder);
		},

		/**
		 * 渲染左侧 20% 礼品展示区 (P2-1: 校验失败时避免空 src 触发重复请求)
		 */
		renderGiftsUI: function(giftKeysOrder) {
			var self = this;
			var $container = $("#hbwallGiftsList");
			$container.empty();

			if (giftKeysOrder.length === 0) {
				var $empty = $('<div style="text-align:center;color:rgba(255,255,255,0.4);margin-top:40px;"></div>').text('暂无本轮礼品');
				$container.append($empty);
				return;
			}

			// 原始 displayorder 最靠前的礼品固定为主推礼品。
			var featuredKey = giftKeysOrder[0];
			var featuredItem = self.giftData[featuredKey];

			var $fCard = $('<div class="hbwall-gift-card--featured"></div>')
				.attr('data-featured', '1')
				.data('gift-key', featuredItem.key);
			var $fTag = $('<div class="gift-tag"></div>').text(featuredItem.title || '主推礼品');
			var $fImg = $('<img class="gift-img">').attr('alt', featuredItem.name);
			if (featuredItem.img) {
				$fImg.attr('src', featuredItem.img);
			}
			applyFeaturedImageAspect($fImg);

			var $fName = $('<div class="gift-name"></div>').text(featuredItem.name);
			var $fContent = $('<div class="gift-feature-content"></div>');
			$fContent.append($fTag, $fName);

			$fCard.append($fImg, $fContent);
			$container.append($fCard);

			// 其余款为列表卡片
			for (var i = 1; i < giftKeysOrder.length; i++) {
				var key = giftKeysOrder[i];
				var item = self.giftData[key];

				var $card = $('<div class="hbwall-gift-card"></div>').data('gift-key', item.key);
				var $img = $('<img class="gift-img">').attr('alt', item.name);
				if (item.img) {
					$img.attr('src', item.img);
				}

				var $info = $('<div class="gift-info"></div>');
				var $title = $('<div class="gift-title"></div>').text(item.title);
				var $name = $('<div class="gift-name"></div>').text(item.name).attr('title', item.name);
				$info.append($title, $name);

				$card.append($img, $info);
				$container.append($card);
			}
		},

		/**
		 * 同步礼品开启状态；左侧礼品区不展示数量。
		 */
		decrementGiftCount: function($item) {
			var self = this;
			var key = getGiftKey($item);

			if (self.giftData[key]) {
				self.giftData[key].opened += 1;
				self.giftData[key].remaining = Math.max(0, self.giftData[key].total - self.giftData[key].opened);

			}
		},

		/**
		 * 按可用宽度缩放红包墙；超出高度由 viewport 自身滚动，不将所有红包压进一屏。
		 */
		fitStageViewport: function() {
			var $viewport = $("#hbStageViewport");
			var $canvas = $("#hbwallScaleCanvas");
			var $box = $("#hbwallBox");
			if (!$viewport.length || !$canvas.length || !$box.length) return;

			var totalItems = $box.find(".hbwall-item").length;
			if (totalItems === 0) return;

			$box.css({
				position: 'relative',
				transform: 'none',
				transformOrigin: 'top left'
			});
			$canvas.css({
				width: 'auto',
				height: 'auto',
				margin: '0 auto'
			});

			var naturalW = $box.outerWidth();
			var naturalH = $box.outerHeight();
			if (!naturalW || !naturalH) return;

			var viewportW = Math.max(0, $viewport.innerWidth() - 24);
			if (!viewportW) return;

			var scale = Math.min(viewportW / naturalW, 1);
			var scaledW = Math.ceil(naturalW * scale);
			var scaledH = Math.ceil(naturalH * scale);

			$canvas.css({
				width: scaledW + 'px',
				height: scaledH + 'px',
				margin: '0 auto'
			});

			$box.css({
				position: 'absolute',
				top: 0,
				left: 0,
				'transform': 'scale(' + scale + ')',
				'transform-origin': 'top left'
			});
		},

		/**
		 * 初始化已开中奖历史记录
		 */
		initHistoryRecord: function() {
			var self = this;
			self.historyIds = [];
			$(".hbwall-box .hbwall-item.hasopen").each(function() {
				self.addHistoryItem($(this));
			});
		},

		/**
		 * 向中奖历史列表添加一条记录
		 */
		addHistoryItem: function($item) {
			var self = this;
			var hbid = $item.attr('data-hbid') || '';
			if (!hbid || $.inArray(hbid, self.historyIds) !== -1) {
				return;
			}

			self.historyIds.push(hbid);

			var packetIndex = $item.attr('data-packet-index') || '';
			var noTxt = packetIndex ? ((packetIndex.length < 2 ? '0' + packetIndex : packetIndex) + '号') : ('红包 ' + hbid);

			var title = $item.attr('data-prizetitle') || $item.find('.prizetitle').text() || '';
			var name = $item.attr('data-prizename') || $item.find('.prizename').text() || '';
			var img = sanitizeUrl($item.attr('data-prizeimg') || $item.find('.prizeimg').attr('src') || '');

			var $list = $("#hbHistoryList");
			$list.find('.hbwall-history-empty').remove();

			var $hItem = $('<div class="hbwall-history-item"></div>').attr('data-hbid', hbid);
			var $hNo = $('<div class="h-no"></div>').text(noTxt);
			var $hImg = $('<img class="h-img">').attr('alt', name);
			if (img) {
				$hImg.attr('src', img);
			}

			var $hInfo = $('<div class="h-info"></div>');
			var $hTitle = $('<div class="h-title"></div>').text(title);
			var $hName = $('<div class="h-name"></div>').text(name);

			$hInfo.append($hTitle, $hName);
			$hItem.append($hNo, $hImg, $hInfo);

			$list.prepend($hItem);
		},

		/**
		 * 事件绑定
		 */
		bindevent: function() {
			var self = this;

			// 点击红包开奖
			$(".hbwall-box .hbwall-item").click(function(e, frommode) {
				var $this = $(this);
				if (self.config.mode == '2' && frommode != '2') {
					return false;
				}
				if ($this.hasClass('hasopen')) return false;

				// 核实红包是否已开
				if (self.config.mode == '1') {
					var hbid = $this.attr('data-hbid') || '0';
					screencore.ajaxSubmit("/screen/hbwall/checkopen", { 'rotateid': self.config.rotateid, 'hbid': hbid }).then(function(data) {
						if (data.code != 0) {
							layerBox.showMsg(data.msg);
						} else {
							self.openhb($this);
						}
					}, function() {
						layerBox.showMsg('网络太差，请稍后重试');
						return false;
					});
				} else {
					self.openhb($this);
				}
			});

			// 固定中央 Modal 关闭事件
			$("#hbModalCloseBtn").on('click', function() {
				$("#hbwallModalOverlay").removeClass('active');
			});
			$("#hbwallModalOverlay").on('click', function(e) {
				if ($(e.target).hasClass('hbwall-modal-overlay')) {
					$("#hbwallModalOverlay").removeClass('active');
				}
			});

			// 中奖记录 Drawer 切换按钮
			$("#hbHistoryToggle").on('click', function() {
				var $drawer = $("#hbwallHistory");
				var isOpen = $drawer.hasClass('active');
				if (isOpen) {
					$drawer.removeClass('active').attr('aria-hidden', 'true');
					$(this).attr('aria-expanded', 'false');
				} else {
					$drawer.addClass('active').attr('aria-hidden', 'false');
					$(this).attr('aria-expanded', 'true');
				}
			});
			$("#hbHistoryClose").on('click', function() {
				$("#hbwallHistory").removeClass('active').attr('aria-hidden', 'true');
				$("#hbHistoryToggle").attr('aria-expanded', 'false');
			});

			// 键盘 Space 键绑定
			keyboardJS.bind('space', function() {
				if ($("#hbwallModalOverlay").hasClass('active')) {
					return $("#hbModalCloseBtn").trigger('click');
				}
				if (self.config.mode == '2') {
					var len = $(".hbwall-box .hbwall-item:not(.hasopen)").length;
					if (len > 0) {
						self.stopindex = Math.floor(Math.random() * len);
						if (self.stopindex >= len) {
							self.stopindex = len - 1;
						}
						if (self.stopindex >= 0) {
							var hbid = $(".hbwall-box .hbwall-item:not(.hasopen)").eq(self.stopindex).attr('data-hbid') || '0';
							screencore.ajaxSubmit("/screen/hbwall/checkopen", { 'rotateid': self.config.rotateid, 'hbid': hbid }).then(function(data) {
								if (data.code != 0) {
									layerBox.showMsg(data.msg);
								} else {
									self.showbig();
								}
							}, function() {
								self.stopindex = -1;
								layerBox.showMsg('网络太差，请稍后重试');
							});
						} else {
							layerBox.showMsg('所有红包已经打开');
						}
					} else {
						layerBox.showMsg('所有红包已经打开');
					}
				}
			});

			// 键盘 Left 键切换轮次
			keyboardJS.bind('left', function(e) {
				layerBox.showConfirm('温馨提示', '确定要切换到上一轮么?', ['确定', '取消'], function() {
					screencore.ajaxSubmit("/screen/hbwall/changerotate", { rotateid: self.config.rotateid, type: '2' }).then(function(data) {
						if (data.code == 0) {
							window.location.href = data.msg;
						} else {
							layerBox.showMsg(data.msg);
						}
					});
				});
			});

			// 键盘 Right 键切换轮次
			keyboardJS.bind('right', function(e) {
				layerBox.showConfirm('温馨提示', '确定要切换到下一轮么?', ['确定', '取消'], function() {
					screencore.ajaxSubmit("/screen/hbwall/changerotate", { rotateid: self.config.rotateid, type: '1' }).then(function(data) {
						if (data.code == 0) {
							window.location.href = data.msg;
						} else {
							layerBox.showMsg(data.msg);
						}
					});
				});
			});
		},

		/**
		 * 观众选择模式轮询 (保留原有逻辑)
		 */
		ajaxselect: function() {
			var self = this;
			screencore.ajaxSubmit("/screen/hbwall/ajaxprizesselect", { 'rotateid': self.config.rotateid }).then(function(json) {
				if (json.code == 0) {
					if (json.msg.length > 0) {
						$.each(json.msg, function(i, v) {
							$(".hbwall-box .hb" + v.id).find('.xuhao span').text(v.num);
						});
					}
				}
			}, function() {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},

		/**
		 * 开奖逻辑重构
		 */
		openhb: function(obj) {
			var self = this;
			obj.addClass('hasopen');

			setTimeout(function() {
				if (self.config.speakText == '1') {
					screencore.speakText('恭喜抽到了' + obj.find('.back .prizename').text());
				}
				obj.find('.front').addClass('noanimation');
			}, 1e3);

			// 扣减左侧礼品剩余数量
			self.decrementGiftCount(obj);

			// 追加到中奖历史记录
			self.addHistoryItem(obj);

			// 展示中奖 Modal
			self.showWinnerModal(obj);
		},

		/**
		 * 展示中奖 Modal；比例始终以大屏内 overlay 的实际可用尺寸计算。
		 */
		showWinnerModal: function($item) {
			var self = this;
			if (self.config.needpop == '2') {
				return false;
			}

			var title = $item.attr('data-prizetitle') || $item.find('.prizetitle').text() || '';
			var name = $item.attr('data-prizename') || $item.find('.prizename').text() || '';
			var img = sanitizeUrl($item.attr('data-prizeimg') || $item.find('.prizeimg').attr('src') || '');
			var packetIndex = $item.attr('data-packet-index') || '';

			var $modalImg = $("#hbModalPrizeImg");
			if (img) {
				$modalImg.attr('src', img).attr('alt', name);
			} else {
				$modalImg.removeAttr('src').attr('alt', name);
			}

			$("#hbModalPrizeTitle").text(title);
			$("#hbModalPrizeName").text(name);
			var displayIndex = (packetIndex && packetIndex > 0 && packetIndex < 10) ? '0' + parseInt(packetIndex, 10) : packetIndex;
			$("#hbModalHbNo").text("第 " + displayIndex + " 号红包");

			var $overlay = $("#hbwallModalOverlay");
			var $card = $("#hbwallModalCard");
			var safeLeft = 32;
			var safeRight = 32;
			var safeTop = 32;
			var safeBottom = typeof XCV3Config !== 'undefined' && XCV3Config.isiframe ? 90 : 32;

			$overlay.css({
				paddingTop: safeTop + 'px',
				paddingRight: safeRight + 'px',
				paddingBottom: safeBottom + 'px',
				paddingLeft: safeLeft + 'px'
			});

			var cardW = $card.outerWidth() || 440;
			var cardH = $card.outerHeight() || 400;
			var availableW = $overlay.innerWidth() - safeLeft - safeRight;
			var availableH = $overlay.innerHeight() - safeTop - safeBottom;
			var viewportScale = Math.min(
				availableW / cardW,
				availableH / cardH
			);
			var configuredScale = Math.max(0.8, Math.min(parseFloat(self.config.popscale) || 1.4, 2));
			var targetScale = Math.min(configuredScale, viewportScale);
			targetScale = Math.max(0.6, targetScale);

			$card.css('--hb-pop-scale', targetScale);

			var hasFired = false;
			var timer = null;

			function doShow() {
				if (hasFired) return;
				hasFired = true;
				if (timer) clearTimeout(timer);
				$item.find('.back').off('transitionend webkitTransitionEnd oTransitionEnd', doShow);
				$("#hbwallModalOverlay").addClass('active');
			}

			$item.find('.back').one('transitionend webkitTransitionEnd oTransitionEnd', doShow);
			timer = setTimeout(doShow, 900);
		},

		isstop: false,
		moveindex: 0,
		stopindex: -1,
		showbig: function() {
			var self = this, len = $(".hbwall-box .hbwall-item:not(.hasopen)").length;
			if (len > 0) {
				$(".hbwall-box .hbwall-item:not(.hasopen)").eq(self.moveindex).transition({ scale: 1.2 }, 1e2).transition({ scale: 1 }, 1e2, 'ease', function() {
					self.moveindex++;
					if (self.moveindex >= len) {
						self.moveindex = 0;
						self.isstop = true;
					}
					if (self.isstop && self.moveindex == self.stopindex) {
						$(".hbwall-box .hbwall-item:not(.hasopen)").eq(self.moveindex).trigger('click', '2');
						self.moveindex = 0;
						self.isstop = false;
						self.stopindex = -1;
						return false;
					}
					self.showbig();
				});
			}
		}
	};
	return screenhbwall;
});
