/*
* @Author: 赞木
* @Date:   2022-08-05 16:21:09
* @Last Modified by:   赞木
* @Last Modified time: 2023-06-02 20:14:20
*/
define('screenimportcj', ['screencore', 'layerBox', 'template', 'keyboard', 'anime', 'threejs2', 'tweenjs', 'screenjs/screenimportcj-halo', 'screenjs/screenimportcj-danmaku', 'screenjs/screenimportcj-prize', 'screenjs/screenimportcj-stage-ui', 'snabbt'], function (screencore, layerBox, template, keyboardJS, anime, THREE, TWEEN, screenimportcjHalo, screenimportcjDanmaku, screenimportcjPrize, screenimportcjStageUi) {
	THREE.CSS3DObject = function (element) { THREE.Object3D.call(this); this.element = element; this.element.style.position = "absolute"; this.addEventListener("removed", function () { if (this.element.parentNode !== null) { this.element.parentNode.removeChild(this.element) } }) }; THREE.CSS3DObject.prototype = Object.create(THREE.Object3D.prototype); THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject; THREE.CSS3DSprite = function (element) { THREE.CSS3DObject.call(this, element) }; THREE.CSS3DSprite.prototype = Object.create(THREE.CSS3DObject.prototype); THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite; THREE.CSS3DRenderer = function () { console.log("THREE.CSS3DRenderer", THREE.REVISION); var _width, _height; var _widthHalf, _heightHalf; var matrix = new THREE.Matrix4(); var cache = { camera: { fov: 0, style: "" }, objects: {} }; var domElement = document.createElement("div"); domElement.style.overflow = "hidden"; this.domElement = domElement; var cameraElement = document.createElement("div"); cameraElement.style.WebkitTransformStyle = "preserve-3d"; cameraElement.style.MozTransformStyle = "preserve-3d"; cameraElement.style.transformStyle = "preserve-3d"; domElement.appendChild(cameraElement); var isIE = /Trident/i.test(navigator.userAgent); this.setClearColor = function () { }; this.getSize = function () { return { width: _width, height: _height } }; this.setSize = function (width, height) { _width = width; _height = height; _widthHalf = _width / 2; _heightHalf = _height / 2; domElement.style.width = width + "px"; domElement.style.height = height + "px"; cameraElement.style.width = width + "px"; cameraElement.style.height = height + "px" }; function epsilon(value) { return Math.abs(value) < 1e-10 ? 0 : value } function getCameraCSSMatrix(matrix) { var elements = matrix.elements; return "matrix3d(" + epsilon(elements[0]) + "," + epsilon(-elements[1]) + "," + epsilon(elements[2]) + "," + epsilon(elements[3]) + "," + epsilon(elements[4]) + "," + epsilon(-elements[5]) + "," + epsilon(elements[6]) + "," + epsilon(elements[7]) + "," + epsilon(elements[8]) + "," + epsilon(-elements[9]) + "," + epsilon(elements[10]) + "," + epsilon(elements[11]) + "," + epsilon(elements[12]) + "," + epsilon(-elements[13]) + "," + epsilon(elements[14]) + "," + epsilon(elements[15]) + ")" } function getObjectCSSMatrix(matrix, cameraCSSMatrix) { var elements = matrix.elements; var matrix3d = "matrix3d(" + epsilon(elements[0]) + "," + epsilon(elements[1]) + "," + epsilon(elements[2]) + "," + epsilon(elements[3]) + "," + epsilon(-elements[4]) + "," + epsilon(-elements[5]) + "," + epsilon(-elements[6]) + "," + epsilon(-elements[7]) + "," + epsilon(elements[8]) + "," + epsilon(elements[9]) + "," + epsilon(elements[10]) + "," + epsilon(elements[11]) + "," + epsilon(elements[12]) + "," + epsilon(elements[13]) + "," + epsilon(elements[14]) + "," + epsilon(elements[15]) + ")"; if (isIE) { return "translate(-50%,-50%)" + "translate(" + _widthHalf + "px," + _heightHalf + "px)" + cameraCSSMatrix + matrix3d } return "translate(-50%,-50%)" + matrix3d } function renderObject(object, camera, cameraCSSMatrix) { if (object instanceof THREE.CSS3DObject) { var style; if (object instanceof THREE.CSS3DSprite) { matrix.copy(camera.matrixWorldInverse); matrix.transpose(); matrix.copyPosition(object.matrixWorld); matrix.scale(object.scale); matrix.elements[3] = 0; matrix.elements[7] = 0; matrix.elements[11] = 0; matrix.elements[15] = 1; style = getObjectCSSMatrix(matrix, cameraCSSMatrix) } else { style = getObjectCSSMatrix(object.matrixWorld, cameraCSSMatrix) } var element = object.element; var cachedStyle = cache.objects[object.id] && cache.objects[object.id].style; if (cachedStyle === undefined || cachedStyle !== style) { element.style.WebkitTransform = style; element.style.MozTransform = style; element.style.transform = style; cache.objects[object.id] = { style: style }; if (isIE) { cache.objects[object.id].distanceToCameraSquared = getDistanceToSquared(camera, object) } } if (element.parentNode !== cameraElement) { cameraElement.appendChild(element) } } for (var i = 0, l = object.children.length; i < l; i++) { renderObject(object.children[i], camera, cameraCSSMatrix) } } var getDistanceToSquared = function () { var a = new THREE.Vector3(); var b = new THREE.Vector3(); return function (object1, object2) { a.setFromMatrixPosition(object1.matrixWorld); b.setFromMatrixPosition(object2.matrixWorld); return a.distanceToSquared(b) } }(); function zOrder(scene) { var order = Object.keys(cache.objects).sort(function (a, b) { return cache.objects[a].distanceToCameraSquared - cache.objects[b].distanceToCameraSquared }); var zMax = order.length; scene.traverse(function (object) { var index = order.indexOf(object.id + ""); if (index !== -1) { object.element.style.zIndex = zMax - index } }) } this.render = function (scene, camera) { var fov = camera.projectionMatrix.elements[5] * _heightHalf; if (cache.camera.fov !== fov) { domElement.style.WebkitPerspective = fov + "px"; domElement.style.MozPerspective = fov + "px"; domElement.style.perspective = fov + "px"; cache.camera.fov = fov } scene.updateMatrixWorld(); if (camera.parent === null) { camera.updateMatrixWorld() } var cameraCSSMatrix = "translateZ(" + fov + "px)" + getCameraCSSMatrix(camera.matrixWorldInverse); var style = cameraCSSMatrix + "translate(" + _widthHalf + "px," + _heightHalf + "px)"; if (cache.camera.style !== style && !isIE) { cameraElement.style.WebkitTransform = style; cameraElement.style.MozTransform = style; cameraElement.style.transform = style; cache.camera.style = style } renderObject(scene, camera, cameraCSSMatrix); if (isIE) { zOrder(scene) } } };
	var screenimportcj = {
		datas: [],
		isstart: '1',
		maxid: 0,
		prizeIndex: 0,
		prizeInfo: [],
		luckerids: [],
		changetimer: null,
		showOneTimer: null,
		arrowflag: 'show',
		luckerUsers: [],
		luckerHtml: '',
		fieldconfig: [],
		flytype: '1',
		flyspeed: 100,
		flyspheretype: '1',
		haloStage: null,
		danmakuStage: null,
		danmakuStyleConfig: null,
		unifiedPrize: null,
		stageUi: null,
		resultConfig: null,
		unifiedRoundItems: [],
		prizeStats: null,
		drawCount: null,
		roundDrawCount: null,
		prizeSettingsVisible: false,
		visualState: 'ready',
		stageFooterObserver: null,
		stageFooterMutationObserver: null,
		stageFooterWindow: null,
		recordsRequestId: 0,
		recordsPrizeId: null,
		recordsReturnState: null,
		recordsReturnIsstart: null,
		drawRequestPending: false,
		currentLuckerHtml: '',
		currentLuckerList: [],
		jumpRunId: 0,
		jumpPhase: null,
		jumpStarted: false,
		jumpStartGate: false,
		mountUnifiedPrize: function (config) {
			var self = this;
			if (!screenimportcjPrize) return;
			self.unifiedPrize = screenimportcjPrize.create({
				root: document.querySelector('.importcj-mainbox'),
				callbacks: {
					/* legacy bridge: old controller handlers remain the single business entrypoint. */
					onPrizePrev: function () { $('.importcj-footer .prev-prize').trigger('click'); },
					onPrizeNext: function () { $('.importcj-footer .next-prize').trigger('click'); },
					onPrizeSelect: function (prize, index) { self.selectPrize(index); },
					onDrawCountChange: function (value) { self.setDrawCount(value); }
				}
			});
			self.unifiedPrize.mount();
			if (self.flytype != '6') self.unifiedPrize.setAccent(config && config.color);
			self.syncSharedControls();
		},
		destroyUnifiedPrize: function () {
			if (this.unifiedPrize) this.unifiedPrize.destroy();
			this.unifiedPrize = null;
		},
		mountStageUi: function () {
			var self = this;
			if (!screenimportcjStageUi) return;
			self.stageUi = screenimportcjStageUi.create({
				root: document.querySelector('.importcj-mainbox'),
				flytype: self.flytype,
				resultConfig: self.resultConfig,
				fieldConfig: self.fieldconfig,
				speedEnabled: self.flytype == '6',
				speedPreset: self.getDanmakuSpeedPreset(),
				callbacks: {
					onPrimaryAction: function () { return self.handlePrimaryAction(); },
					onPrizeSettingsToggle: function () { return self.togglePrizeSettings(); },
					onRecords: function () { return self.openRecords(); },
					onRecordsClose: function () { return self.closeRecords(); },
					onRecordsRetry: function () {
						if (self.isstart == '4') {
							self.openRecords(true);
							return true;
						}
					},
					onSpeedChange: function (preset) {
						try { window.localStorage.setItem(self.getDanmakuSpeedStorageKey(), preset); } catch (e) {}
						if (self.danmakuStage) self.danmakuStage.setSpeedPreset(preset);
					}
				}
			});
			self.stageUi.mount();
			self.syncSharedControls();
			self.bindStageFooterOffset();
		},
		destroyStageUi: function () {
			if (this.stageUi) this.stageUi.destroy();
			this.stageUi = null;
		},
		invalidateRecords: function () {
			this.recordsRequestId++;
			this.recordsPrizeId = null;
		},
		syncPrizeStats: function (total, used) {
			var self = this;
			if (total === undefined || total === null || used === undefined || used === null) {
				self.prizeStats = null;
				if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
				return;
			}
			var totalStr = String(total).replace(/^\s+|\s+$/g, '');
			var usedStr = String(used).replace(/^\s+|\s+$/g, '');
			if (totalStr === '' || usedStr === '') {
				self.prizeStats = null;
				if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
				return;
			}
			var totalNum = Number(totalStr);
			var usedNum = Number(usedStr);
			if (isNaN(totalNum) || isNaN(usedNum) || !isFinite(totalNum) || !isFinite(usedNum)) {
				self.prizeStats = null;
				if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
				return;
			}
			var remaining = Math.max(totalNum - usedNum, 0);
			self.prizeStats = {
				total: totalNum,
				used: usedNum,
				remaining: remaining
			};
			self.normalizeCurrentDrawCount();
			if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
		},
		getDanmakuSpeedStorageKey: function () {
			return 'importcj:danmaku-speed:' + ((typeof XCV3Config != 'undefined' && XCV3Config.hdid) || 'default');
		},
		getLastPrizeStorageKey: function () {
			var hdid = (typeof XCV3Config != 'undefined' && XCV3Config.hdid) || 'default';
			return 'importcj:last-prize:' + hdid + ':' + (isroundcj == '1' ? 'round' : 'single');
		},
		getCurrentPrize: function () {
			return this.prizeInfo[this.prizeIndex] || null;
		},
		getCurrentPrizeId: function () {
			var prize = this.getCurrentPrize();
			return prize && prize.id !== undefined && prize.id !== null && String(prize.id) !== '' ? prize.id : null;
		},
		rememberLastSuccessfulPrize: function (prizeId) {
			if (!prizeId) return;
			try { window.localStorage.setItem(this.getLastPrizeStorageKey(), String(prizeId)); } catch (e) {}
		},
		restoreLastPrize: function () {
			var self = this, storedId = null, matched = -1;
			try { storedId = window.localStorage.getItem(self.getLastPrizeStorageKey()); } catch (e) {}
			if (storedId) {
				$.each(self.prizeInfo, function (index, prize) {
					if (matched < 0 && prize && String(prize.id) == String(storedId)) matched = index;
				});
			}
			self.prizeIndex = matched >= 0 ? matched : 0;
			return self.prizeIndex;
		},
		isSafeDanmakuColor: function (value) {
			var color = typeof value == 'string' ? value.replace(/^\s+|\s+$/g, '') : '';
			if (!color || color.length > 64 || /[;"'{}]/.test(color)) return null;
			if (typeof document != 'undefined') {
				var probe = document.createElement('span');
				probe.style.color = '';
				probe.style.color = color;
				if (!probe.style.color) return null;
			}
			return color;
		},
		getDanmakuFieldColors: function () {
			var fields = this.fieldconfig || [], nameColor = this.isSafeDanmakuColor(fields[0] && fields[0].fieldcolor) || '#f5fbff', extraColors = [];
			for (var i = 1; i < 4; i++) extraColors.push(this.isSafeDanmakuColor(fields[i] && fields[i].fieldcolor));
			return { nameColor: nameColor, extraColors: extraColors };
		},
		getDanmakuStyleConfig: function (config) {
			var self = this, source = config || {}, fontSize = parseInt(source.danmakusize, 10), density = source.danmakudensity, colorMode = source.danmakucolormode, accentColor = source.danmakucolor;
			if (isNaN(fontSize)) fontSize = 18;
			fontSize = Math.max(12, Math.min(40, fontSize));
			if ($.inArray(density, ['sparse', 'normal', 'dense']) < 0) density = 'normal';
			if ($.inArray(colorMode, ['fixed', 'random']) < 0) colorMode = 'fixed';
			accentColor = self.isSafeDanmakuColor(accentColor) || '#58e6ff';
			return {
				fontSize: fontSize,
				density: density,
				colorMode: colorMode,
				accentColor: accentColor,
				fieldColors: self.getDanmakuFieldColors(),
				showAvatar: source.danmakuavatar === undefined ? true : String(source.danmakuavatar) == '1',
				showExtras: source.danmakuextra === undefined ? true : String(source.danmakuextra) == '1',
				showBox: source.danmakubox === undefined ? true : String(source.danmakubox) == '1'
			};
		},
		getDanmakuSpeedPreset: function () {
			var value = null;
			try { value = window.localStorage.getItem(this.getDanmakuSpeedStorageKey()); } catch (e) {}
			return $.inArray(value, ['slow', 'normal', 'fast']) > -1 ? value : 'normal';
		},
		getAvailableCount: function () {
			var self = this;
			if (!self.prizeStats || typeof self.prizeStats.remaining != 'number' || !isFinite(self.prizeStats.remaining)) {
				return null;
			}
			return Math.max(0, Math.min(self.prizeStats.remaining, self.datas.length));
		},
		normalizeDrawCount: function (value) {
			var self = this, count = parseInt(value, 10);
			if (isNaN(count) || count < 1) count = 1;
			if (isroundcj == '1') {
				return self.roundDrawCount !== null && self.roundDrawCount !== undefined ? self.roundDrawCount : count;
			}
			var available = self.getAvailableCount();
			if (available !== null && available > 0) count = Math.min(count, available);
			return count;
		},
		syncLegacyDrawCount: function () {
			if (this.drawCount !== null && this.drawCount !== undefined) {
				$('.select-box .onceout').val(this.drawCount);
			}
		},
			normalizeCurrentDrawCount: function (value) {
				var self = this;
				if (isroundcj == '1') {
					if (self.roundDrawCount !== null && self.roundDrawCount !== undefined) self.drawCount = self.roundDrawCount;
					else self.drawCount = value !== undefined ? self.normalizeDrawCount(value) : null;
			} else {
				var source = value !== undefined ? value : (self.drawCount !== null && self.drawCount !== undefined ? self.drawCount : $('.select-box .onceout').val());
				self.drawCount = self.normalizeDrawCount(source);
			}
			self.syncLegacyDrawCount();
			return self.drawCount;
		},
		getPrizeOptions: function () {
			var self = this;
			return $.map(self.prizeInfo || [], function (prize, index) {
				var copy = $.extend({}, prize);
				if (index == self.prizeIndex && self.prizeStats) {
					copy.remaining = self.prizeStats.remaining;
				}
				return copy;
			});
		},
		getVisualState: function () {
			if (this.visualState) return this.visualState;
			return this.isstart == '2' ? 'drawing' : (this.isstart == '3' ? 'result' : (this.isstart == '4' ? 'records' : 'ready'));
		},
		setVisualState: function (state) {
			this.visualState = state || 'ready';
			if (this.visualState != 'ready') this.prizeSettingsVisible = false;
			this.syncSharedControls();
		},
		togglePrizeSettings: function () {
			var self = this;
			if (self.getVisualState() != 'ready' || !self.unifiedPrize) return false;
			self.prizeSettingsVisible = !self.prizeSettingsVisible;
			self.unifiedPrize.setControlsVisible(self.prizeSettingsVisible);
			self.syncSharedControls();
			return self.prizeSettingsVisible;
		},
		getControlSnapshot: function () {
			var self = this;
			var available = self.getAvailableCount();
			var onceout = self.drawCount !== null && self.drawCount !== undefined ? self.drawCount : (isroundcj == '1' ? null : $('.select-box .onceout').val());
			var onceoutNum = parseInt(onceout, 10);
			var validCount = !isNaN(onceoutNum) && onceoutNum > 0 && (isroundcj == '1' || available === null || onceoutNum <= available);
			var statsReady = available !== null;
			var canStart = self.getVisualState() == 'ready' && statsReady && available > 0 && self.datas.length > 0 && validCount;
			return {
				state: self.getVisualState(),
				prize: self.getPrize(),
				prizes: self.getPrizeOptions(),
				prizeIndex: self.prizeIndex,
				drawCount: onceout || 1,
				onceout: onceout || 1,
				drawCountReadonly: isroundcj == '1',
				drawCountLabel: isroundcj == '1' ? '本轮抽取' : '单次抽取',
				drawCountUnit: isroundcj == '1' ? '名' : '人',
				maxDrawCount: available === null ? 999 : Math.max(1, available),
				canStart: canStart,
				primaryEnabled: canStart || self.getVisualState() == 'drawing' || self.getVisualState() == 'result',
				prizeSettingsEnabled: !!self.unifiedPrize && self.getVisualState() == 'ready',
				prizeSettingsVisible: !!self.unifiedPrize && self.getVisualState() == 'ready' && !!self.prizeSettingsVisible,
				primaryText: self.getVisualState() == 'drawing' ? '停止抽奖' : (self.getVisualState() == 'result' ? '关闭结果' : (self.getVisualState() == 'records' ? '记录查看中' : (self.getVisualState() == 'requesting' ? '正在准备...' : (self.getVisualState() == 'starting' ? '抽奖启动中...' : '开始抽奖')))),
				speedPreset: self.getDanmakuSpeedPreset()
			};
		},
		syncSharedControls: function () {
			var self = this;
			self.syncLegacyDrawCount();
			var snapshot = self.getControlSnapshot();
			if (self.unifiedPrize) self.unifiedPrize.update(snapshot);
			if (self.stageUi) self.stageUi.update(snapshot);
			if (self.flytype == '6' && self.danmakuStage) self.danmakuStage.updateControls(snapshot);
		},
		setDrawCount: function (value) {
			var self = this;
			if (isroundcj == '1' || self.isstart != '1' || self.visualState != 'ready') return false;
			self.normalizeCurrentDrawCount(value);
			self.syncSharedControls();
			return true;
		},
		validateDrawCount: function () {
			var self = this;
			var count = parseInt(self.drawCount, 10);
			var available = self.getAvailableCount();
			if (isNaN(count) || count < 1) return { ok: false, message: '请输入大于 0 的抽取人数' };
			if (available === null) return { ok: false, message: '正在读取当前奖项名额，请稍候' };
			if (available <= 0) return { ok: false, message: '当前奖项已无可抽取名额' };
			if (isroundcj != '1' && count > available) return { ok: false, message: '抽取人数不能超过当前剩余名额或候选人数' };
			return { ok: true, value: count };
		},
		bindStageFooterOffset: function () {
			var self = this;
			if (!self.stageUi && (self.flytype != '6' || !self.danmakuStage)) return;
			self.unbindStageFooterOffset();
			var root = document.querySelector('.importcj-mainbox');
			var footer = null;
			try { footer = screencore.getdom('.footer-controlBox'); } catch (e) {}
			var footerElement = footer && footer.length ? footer[0] : null;
			var sync = function () {
				if (!root) return;
				var safeBottom = 24;
				if (footerElement) {
					var style = null;
					try {
						var ownerWindow = footerElement.ownerDocument && footerElement.ownerDocument.defaultView;
						style = (ownerWindow || window).getComputedStyle(footerElement);
					} catch (e) {}
					if (style && style.display != 'none' && style.visibility != 'hidden') {
						var footerHeight = footerElement.offsetHeight || 90;
						if (footerElement.classList.contains('up')) {
							safeBottom = footerHeight + 16;
						} else if (!footerElement.classList.contains('down')) {
							safeBottom = footerHeight + 16;
						} else {
							safeBottom = Math.max(24, Math.min(56, footerHeight + 10));
						}
					}
				}
				root.style.setProperty('--screen-stage-action-bottom', safeBottom + 'px');
				root.style.setProperty('--danmaku-action-bottom', safeBottom + 'px');
				root.style.setProperty('--danmaku-field-bottom', Math.max(126, safeBottom + 74) + 'px');
			};
			self.stageFooterWindow = window;
			self._stageFooterSync = sync;
			window.addEventListener('resize', sync);
			if (footerElement && typeof MutationObserver != 'undefined') {
				self.stageFooterMutationObserver = new MutationObserver(sync);
				try { self.stageFooterMutationObserver.observe(footerElement, { attributes: true, attributeFilter: ['class', 'style'] }); } catch (e) {}
			}
			if (footerElement && typeof ResizeObserver != 'undefined') {
				self.stageFooterObserver = new ResizeObserver(sync);
				try { self.stageFooterObserver.observe(footerElement); } catch (e) {}
			}
			sync();
		},
		unbindStageFooterOffset: function () {
			if (this.stageFooterObserver) this.stageFooterObserver.disconnect();
			if (this.stageFooterMutationObserver) this.stageFooterMutationObserver.disconnect();
			if (this.stageFooterWindow && this._stageFooterSync) this.stageFooterWindow.removeEventListener('resize', this._stageFooterSync);
			this.stageFooterObserver = null;
			this.stageFooterMutationObserver = null;
			this.stageFooterWindow = null;
			this._stageFooterSync = null;
		},
		selectPrize: function (index) {
			var self = this;
			if (self.isstart != '1' || !self.prizeInfo.length) return false;
			index = parseInt(index, 10);
			if (isNaN(index) || index < 0 || index >= self.prizeInfo.length) return false;
			self.invalidateRecords();
			self.prizeIndex = index;
			if (isroundcj == '1') self.initroundinfo();
			else self.initprize();
			return true;
		},
		init: function (config) {
			var self = this;
			config = config || {};
			self.resultConfig = config;
			self.danmakuStyleConfig = self.getDanmakuStyleConfig(config);
			self.scrollSpeed = autoscrollspeed;
			self.flytype = config.flytype || '1';
			var mainRoot = document.querySelector('.importcj-mainbox');
			if (mainRoot && self.flytype == '1') mainRoot.setAttribute('data-shared-drawing', 'legacy-roll');
			if (self.flytype == '2') {
				self.flyspeed = config.flyonespeed || 100;
			} else if (self.flytype == '3') {
				self.flyspeed = config.flygridspeed || 100;
			} else if (self.flytype == '4') {
				self.flyspeed = config.flyspherespeed || 100;
				self.flyspeed /= 1000;
			}
			self.flyspeed = +self.flyspeed;
			self.flyspheretype = config.flyspheretype || '1';
			self.initdata(function () {
				self.bindevent();
				if (typeof window !== 'undefined' && window.addEventListener) {
					window.addEventListener('pagehide', function () {
						if (self.flytype == '7') self.cancelJumpRun();
						self.destroyUnifiedPrize();
						self.destroyStageUi();
						self.unbindStageFooterOffset();
						if (self.danmakuStage) self.danmakuStage.destroy();
						if (self.haloStage) self.haloStage.destroy();
					});
				}
				setTimeout(function () {
					self.getnewUser();
				}, 10e3);
				if (self.flytype == '5') {
					self.haloStage = screenimportcjHalo.create({
						root: document.querySelector('.importcj-mainbox')
					});
				} else if (self.flytype == '6') {
					self.danmakuStage = screenimportcjDanmaku.create({
						root: document.querySelector('.importcj-mainbox'),
						prizes: self.getPrizeOptions(),
						prizeIndex: self.prizeIndex,
						prize: self.getPrize(),
						onceout: self.drawCount || 1,
						speedPreset: self.getDanmakuSpeedPreset(),
						styleConfig: self.danmakuStyleConfig,
						callbacks: {}
					});
					self.danmakuStage.mount(self.getDanmakuCandidates());
					self.danmakuStage.updateControls(self.getControlSnapshot());
				} else if (self.flytype == '7') {
					// The dedicated result view owns the jumping cards too.
				} else if (self.flytype > 1) {
					$("body").append('<ul class="importcj-wall hidden"></ul>');
					if (self.flytype == '2') {
						self.stageInit();
					} else {
						self.sceneInit(config);
					}
				}
				self.mountUnifiedPrize(config);
				self.mountStageUi();
			});
		},
		initdata: function (fn) {
			var self = this;
			screencore.ajaxSubmit('/screen/importcj/initdata', {}).then(function (json) {
				if (json.code == 0) {
					self.datas = json.msg.datas;
					self.fieldconfig = json.msg.fieldconfig;
					if (self.danmakuStyleConfig) self.danmakuStyleConfig.fieldColors = self.getDanmakuFieldColors();
					if (self.datas.length) {
						self.maxid = self.datas[0].dataid;
					}
					self.prizeInfo = json.msg.prizelist;
					if (self.prizeInfo.length) {
						var restoredPrizeIndex = self.restoreLastPrize();
						if (restoredPrizeIndex > 0) {
							self.datas = [];
							self.maxid = 0;
						}
						if (isroundcj == '1') {
							self.initroundinfo(true);
						} else {
							self.initprize(true);
						}
						if (restoredPrizeIndex > 0) self.initprizedatas(self.getCurrentPrizeId());
						fn && fn();
					} else {
						$(".importcj-mainbox .emptybox").removeClass('hidden');
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		initprize: function (isfirst) {
			isfirst = isfirst || false;
			var self = this, prizeOne = self.getCurrentPrize();
			if (!prizeOne) return;
			self.invalidateRecords();
			self.unifiedRoundItems = [];
			self.prizeStats = null;
			self.roundDrawCount = null;
			self.normalizeCurrentDrawCount(prizeOne.onceout);
			//奖品信息
			$(".importcj-header .awardname").text(prizeOne.awardname);
			$(".importcj-header .prizename").text(prizeOne.prizename);
			var prizeTplData = $.extend({}, prizeOne, { showPrizeInfo: isroundcj == '1' || self.flytype == '6' });
			$(".importcj-awardlist").html(template("prize-tpl", prizeTplData));
			$(".importcj-body img").attr('src', prizeOne.prizeimg);
			//底部参数
			$(".importcj-footer .active-prize").text(prizeOne.awardname).attr("data-prizeid", prizeOne.id);
			self.syncLegacyDrawCount();
			self.initprizeandluckernum();
			if (self.flytype == '6' && self.danmakuStage) {
				self.danmakuStage.updatePrize(self.getPrize());
			}
			if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
			$(".importcj-lists").removeClass('hidden');
			if (!isfirst) {
				self.initprizedatas(prizeOne.id);
			}
		},
		initroundinfo: function (isfirst) {
			isfirst = isfirst || false;
			var self = this, roundOne = self.getCurrentPrize();
			if (!roundOne) return;
			self.invalidateRecords();
			self.unifiedRoundItems = [];
			self.prizeStats = null;
			self.roundDrawCount = null;
			self.drawCount = null;
			//轮次信息
			$(".importcj-header .awardname").text(roundOne.roundtitle);
			$(".importcj-header .prizename").text("");
			//底部参数
			$(".importcj-footer .active-prize").text(roundOne.roundtitle).attr("data-prizeid", roundOne.id);
			self.initOneround();
			if (self.flytype == '6' && self.danmakuStage) {
				self.danmakuStage.updatePrize(self.getPrize());
			}
			if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
			$(".importcj-lists").removeClass('hidden');
			if (!isfirst) {
				self.initprizedatas(roundOne.id);
			}
		},
		initrollitem: function (num) {
			num = num || 1;
			var self = this, html = '';
			for (var i = 0; i < num; i++) {
				html += template("lucker-tpl", {
					xuhao: self.initNumXuhao(i),
					isdrawed: '2',
					datafield1: '',
					datafield2: '',
					datafield3: '',
					datafield4: '',
					luckerid: '',
				});
			}
			//需根据抽取数量给lists另外加一个class
			$(".importcj-luckerbox-lists").html(html).removeClass('bigdata1 bigdata2 bigdata3 bigdata4');
			if (num > 0 && num <= 2) {
				$(".importcj-luckerbox-lists").addClass('bigdata1');
			} else if (num > 2 && num <= 4) {
				$(".importcj-luckerbox-lists").addClass('bigdata2');
			} else if (num > 4 && num <= 6) {
				$(".importcj-luckerbox-lists").addClass('bigdata3');
			} else if (num > 6 && num <= 8) {
				$(".importcj-luckerbox-lists").addClass('bigdata4');
			}
		},
		changeTimer: null,
		changeTimerField1: null,
		changeTimerField2: null,
		changeTimerField3: null,
		changeTimerField4: null,
		timerLen: 1,
		changerollitem: function () {
			var self = this, useritemBoxs = $(".importcj-luckerbox-lists li .lucker-one-item");
			var prizeOne = self.prizeInfo[self.prizeIndex] || {}, stoptype = prizeOne.stoptype || '1';
			//默认停止方式或者按轮次抽奖均不另外设置
			if (stoptype == '1' || isroundcj == '1') {
				self.timerLen = 1;
				clearInterval(self.changeTimer);
				self.changeTimer = setInterval(function () {
					useritemBoxs.each(function () {
						var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))];
						if (self.fieldconfig.length && self.fieldconfig[0]) {
							$(this).find(".datafield1").text(self.initonedata(userInfo.datafield1, self.fieldconfig[0]));
						}
						if (self.fieldconfig.length && self.fieldconfig[1]) {
							$(this).find(".datafield2").text(self.initonedata(userInfo.datafield2, self.fieldconfig[1]));
						}
						if (self.fieldconfig.length && self.fieldconfig[2]) {
							$(this).find(".datafield3").text(self.initonedata(userInfo.datafield3, self.fieldconfig[2]));
						};
						if (self.fieldconfig.length && self.fieldconfig[3]) {
							$(this).find(".datafield4").text(self.initonedata(userInfo.datafield4, self.fieldconfig[3]));
						}
					});
				}, 80);
			} else {
				//逐项停止
				if (stoptype == '2') {
					clearInterval(self.changeTimerField1);
					clearInterval(self.changeTimerField2);
					clearInterval(self.changeTimerField3);
					clearInterval(self.changeTimerField4);
					if (self.fieldconfig.length && self.fieldconfig[0]) {
						self.timerLen = 1;
						self.changeTimerField1 = setInterval(function () {
							useritemBoxs.find('.datafield1').each(function () {
								var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))];
								$(this).text(self.initonedata(userInfo.datafield1, self.fieldconfig[0]));
							});
						}, 80);
					}
					if (self.fieldconfig.length && self.fieldconfig[1]) {
						self.timerLen = 2;
						self.changeTimerField2 = setInterval(function () {
							useritemBoxs.find('.datafield2').each(function () {
								var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))];
								$(this).text(self.initonedata(userInfo.datafield2, self.fieldconfig[1]));
							});
						}, 80);
					}
					if (self.fieldconfig.length && self.fieldconfig[2]) {
						self.timerLen = 3;
						self.changeTimerField3 = setInterval(function () {
							useritemBoxs.find('.datafield3').each(function () {
								var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))];
								$(this).text(self.initonedata(userInfo.datafield3, self.fieldconfig[2]));
							});
						}, 80);
					}
					if (self.fieldconfig.length && self.fieldconfig[3]) {
						self.timerLen = 4;
						self.changeTimerField4 = setInterval(function () {
							useritemBoxs.find('.datafield4').each(function () {
								var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))];
								$(this).text(self.initonedata(userInfo.datafield4, self.fieldconfig[3]));
							});
						}, 80);
					}
				} else if (stoptype == '3') {
					self.timerLen = 0;
					useritemBoxs.each(function (index) {
						var $this = $(this);
						self.timerLen++;
						clearInterval(self[`changeTimerBox${self.timerLen}`]);
						self[`changeTimerBox${self.timerLen}`] = setInterval(function () {
							var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))];
							if (self.fieldconfig.length && self.fieldconfig[0]) {
								$this.find(".datafield1").text(self.initonedata(userInfo.datafield1, self.fieldconfig[0]));
							}
							if (self.fieldconfig.length && self.fieldconfig[1]) {
								$this.find(".datafield2").text(self.initonedata(userInfo.datafield2, self.fieldconfig[1]));
							}
							if (self.fieldconfig.length && self.fieldconfig[2]) {
								$this.find(".datafield3").text(self.initonedata(userInfo.datafield3, self.fieldconfig[2]));
							};
							if (self.fieldconfig.length && self.fieldconfig[3]) {
								$this.find(".datafield4").text(self.initonedata(userInfo.datafield4, self.fieldconfig[3]));
							}
						}, 80);
					});
				}
			}
		},
		stoprollitem: function () {
			var self = this;
			clearInterval(self.changeTimer);
			self.timerLen = 1;
		},
		stopLen: 0,
		stopOnerollitem: function (stoptype, datas) {
			var self = this, useritemBoxs = $(".importcj-luckerbox-lists li .lucker-one-item");
			self.stopLen++;
			if (stoptype == '2') {
				clearInterval(self[`changeTimerField${self.stopLen}`]);
				useritemBoxs.find(`.datafield${self.stopLen}`).each(function (index) {
					var userOne = datas[index] || {}, datafield = userOne[`datafield${self.stopLen}`] || '';
					$(this).text(self.initonedata(datafield, self.fieldconfig[(self.stopLen - 1)] || {}));
				});
			} else {
				clearInterval(self[`changeTimerBox${self.stopLen}`]);
				var box = useritemBoxs.eq((self.stopLen - 1));
				if (box.length) {
					var userInfo = datas[(self.stopLen - 1)] || {};
					if (self.fieldconfig.length && self.fieldconfig[0]) {
						box.find(".datafield1").text(self.initonedata(userInfo.datafield1 || '', self.fieldconfig[0]));
					}
					if (self.fieldconfig.length && self.fieldconfig[1]) {
						box.find(".datafield2").text(self.initonedata(userInfo.datafield2 || '', self.fieldconfig[1]));
					}
					if (self.fieldconfig.length && self.fieldconfig[2]) {
						box.find(".datafield3").text(self.initonedata(userInfo.datafield3 || '', self.fieldconfig[2]));
					};
					if (self.fieldconfig.length && self.fieldconfig[3]) {
						box.find(".datafield4").text(self.initonedata(userInfo.datafield4 || '', self.fieldconfig[3]));
					}
				}
			}
			var isStopAll = (self.stopLen >= self.timerLen);
			if (isStopAll) {
				self.timerLen = 1;
				self.stopLen = 0;
			}
			return isStopAll;
		},
		boxfromtype: '2',
		total: 36,
		stageStop: true,
		cards: [],
		stageInit: function () {
			var self = this;
			//self.boxfromtype = '2';
			self.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
			self.camera.position.z = 3e3;
			self.scene = new THREE.Scene();
			var k = $(template('lucker-tpl', {
				isdrawed: '2',
				datafield1: '',
				datafield2: '',
				datafield3: '',
				datafield4: '',
				luckerid: '',
			}));
			var r = Math.sqrt(self.total), n = Math.floor(r / 2)
			for (var i = 0; i < self.total; i++) {
				var a, l, s, o = Math.floor(i / r) % r, d = i % r;
				if (o == n && d == n) {
					continue;
				}
				s = k.clone();
				var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))] || false;
				if (userInfo) {
					if (self.fieldconfig.length > 0 && self.fieldconfig[0]) {
						userInfo.datafield1 = self.initonedata(userInfo.datafield1, self.fieldconfig[0]);
					}
					if (self.fieldconfig.length > 0 && self.fieldconfig[1]) {
						userInfo.datafield2 = self.initonedata(userInfo.datafield2, self.fieldconfig[1]);
					}
					if (self.fieldconfig.length > 0 && self.fieldconfig[2]) {
						userInfo.datafield3 = self.initonedata(userInfo.datafield3, self.fieldconfig[2]);
					};
					if (self.fieldconfig.length > 0 && self.fieldconfig[3]) {
						userInfo.datafield4 = self.initonedata(userInfo.datafield4, self.fieldconfig[3]);
					}
					s.find('.datafield1').text(userInfo.datafield1);
					s.find('.datafield2').text(userInfo.datafield2);
					s.find('.datafield3').text(userInfo.datafield3);
					s.find('.datafield4').text(userInfo.datafield4);
				}
				s.addClass('hidden');
				a = new THREE.CSS3DSprite(s[0]);
				if (self.boxfromtype == '1') {
					l = window.innerWidth / r;
					s = window.innerHeight / r;
					a.position.x = d * l - window.innerWidth / 2 + l / 2 + (d - 2) * (300 * (l / s));
					a.position.y = -1 * (o * s - window.innerHeight / 2 + s / 2) - 300 * (o - 2);
				} else {
					a.position.x = screencore.randomInt(-window.innerWidth / 2, window.innerWidth / 2);
					a.position.y = screencore.randomInt(-window.innerHeight / 2, window.innerHeight / 2);
				}
				a.position.z = -screencore.randomInt(7e3, 15e3);
				self.scene.add(a);
				self.cards.push(a);
			}
			self.renderer = new THREE.CSS3DRenderer();
			self.renderer.setSize(window.innerWidth, window.innerHeight);
			self.renderer.domElement.style.position = "absolute";
			$(".importcj-wall")[0].appendChild(self.renderer.domElement);
			self.animate();
			$(window).resize(function () {
				self.camera.aspect = window.innerWidth / window.innerHeight;
				self.camera.updateProjectionMatrix();
				self.renderer.setSize(window.innerWidth, window.innerHeight);
			});
		},
		animate: function () {
			var self = this;
			requestAnimationFrame(function () {
				self.animate()
			});
			if (self.stageStop) return;
			var g = self.cards.length;
			for (var j = 0; j < g; j++) {
				var h = self.cards[j], s = $(h.element);
				h.position.z += self.flyspeed;
				if (h.position.z > 3000) {
					var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))] || false;
					if (userInfo) {
						if (self.fieldconfig.length > 0 && self.fieldconfig[0]) {
							userInfo.datafield1 = self.initonedata(userInfo.datafield1, self.fieldconfig[0]);
						}
						if (self.fieldconfig.length > 0 && self.fieldconfig[1]) {
							userInfo.datafield2 = self.initonedata(userInfo.datafield2, self.fieldconfig[1]);
						}
						if (self.fieldconfig.length > 0 && self.fieldconfig[2]) {
							userInfo.datafield3 = self.initonedata(userInfo.datafield3, self.fieldconfig[2]);
						};
						if (self.fieldconfig.length > 0 && self.fieldconfig[3]) {
							userInfo.datafield4 = self.initonedata(userInfo.datafield4, self.fieldconfig[3]);
						}
						s.find('.datafield1').text(userInfo.datafield1);
						s.find('.datafield2').text(userInfo.datafield2);
						s.find('.datafield3').text(userInfo.datafield3);
						s.find('.datafield4').text(userInfo.datafield4);
						h.position.z = -screencore.randomInt(7e3, 15e3);
						s.removeClass('hidden');
					} else {
						s.addClass('hidden');
					}
				}
			}
			self.renderer.render(self.scene, self.camera);
		},
		targets: { sphere: [], grid: [] },
		sceneInit: function (config) {
			var self = this;
			//创建相机
			self.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
			self.camera.position.z = 3000;
			//创建场景
			self.scene = new THREE.Scene();
			var k = $(template('lucker-tpl', {
				isdrawed: '2',
				datafield1: '',
				datafield2: '',
				datafield3: '',
				datafield4: '',
				luckerid: '',
			}));
			var maxnum = 120, ballW = 800;
			if (self.flytype == '4') {
				maxnum = config.flyspherecell || 200;
				ballW = config.flysphereballw || 800;
			}
			// table
			for (var i = 0, l = maxnum; i < l; i++) {
				var s = k.clone();
				var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))] || false;
				if (userInfo) {
					if (self.fieldconfig.length > 0 && self.fieldconfig[0]) {
						userInfo.datafield1 = self.initonedata(userInfo.datafield1, self.fieldconfig[0]);
					}
					if (self.fieldconfig.length > 0 && self.fieldconfig[1]) {
						userInfo.datafield2 = self.initonedata(userInfo.datafield2, self.fieldconfig[1]);
					}
					if (self.fieldconfig.length > 0 && self.fieldconfig[2]) {
						userInfo.datafield3 = self.initonedata(userInfo.datafield3, self.fieldconfig[2]);
					};
					if (self.fieldconfig.length > 0 && self.fieldconfig[3]) {
						userInfo.datafield4 = self.initonedata(userInfo.datafield4, self.fieldconfig[3]);
					}
					s.find('.datafield1').text(userInfo.datafield1);
					s.find('.datafield2').text(userInfo.datafield2);
					s.find('.datafield3').text(userInfo.datafield3);
					s.find('.datafield4').text(userInfo.datafield4);
				} else {
					s.addClass('nodata');
				}
				var object = new THREE.CSS3DObject(s[0]);
				object.position.x = Math.random() * 1000;
				object.position.y = Math.random() * 1000;
				object.position.z = Math.random() * 1000;
				self.scene.add(object);
				self.cards.push(object);
			}
			var vector = new THREE.Vector3();
			//grid
			if (self.flytype == '3') {
				var vector = new THREE.Vector3();
				for (var i = 0, l = self.cards.length; i < l; i++) {
					var ott = new THREE.Object3D();
					ott.position.x = ((i % 5) * 600) - 1200;
					ott.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800;
					ott.position.z = 200 - i * 60 * 1.5;
					vector.x = ott.position.x;
					vector.y = ott.position.y;
					vector.z = ott.position.z;
					ott.lookAt(vector);
					self.targets.grid.push(ott);
				}
			} else {
				//sphere
				/*
				for (var i = 0, l = self.cards.length; i < l; i++) {
					var phi = Math.acos(-1 + (2 * i) / l);
					var theta = Math.sqrt(l * Math.PI) * phi;
					var object = new THREE.Object3D();
					object.position.x = ballW * Math.cos(theta) * Math.sin(phi);
					object.position.y = ballW * Math.sin(theta) * Math.sin(phi);
					object.position.z = ballW * Math.cos(phi);
					vector.copy(object.position).multiplyScalar(2);
					object.lookAt(vector);
					self.targets.sphere.push(object);
				}
				*/
				var spherical = new THREE.Spherical();
				for (let i = 0, l = self.cards.length; i < l; i++) {
					const phi = Math.acos(- 1 + (2 * i) / l);
					const theta = Math.sqrt(l * Math.PI) * phi;
					var object = new THREE.Object3D();
					spherical.set(ballW, phi, theta);
					object.position.setFromSpherical(spherical);
					vector.copy(object.position).multiplyScalar(2);
					object.lookAt(vector);
					self.targets.sphere.push(object);
				}
			}
			//渲染
			self.renderer = new THREE.CSS3DRenderer();
			self.renderer.setSize(window.innerWidth, window.innerHeight);
			self.renderer.domElement.style.position = 'absolute';
			$(".importcj-wall")[0].appendChild(self.renderer.domElement);
			$(window).resize(function () {
				self.camera.aspect = window.innerWidth / window.innerHeight;
				self.camera.updateProjectionMatrix();
				self.renderer.setSize(window.innerWidth, window.innerHeight);
				self.renderer.render(self.scene, self.camera);
			});
			self.sceneAnimate();
			self.sceneTransform(self.flytype == '3' ? 'grid' : 'sphere', 1);
		},
		sceneAnimate: function () {
			var self = this;
			requestAnimationFrame(function () {
				self.sceneAnimate();
			});
			if (self.flytype == '3') {
				for (var i = 0; i < self.cards.length; i++) {
					var one = self.cards[i];
					one.position.z += self.flyspeed;
					if (one.position.z > 3000) {
						one.position.z = 200 - (self.cards.length - 1) * 60 * 1.5;
						var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))] || false;
						if (userInfo) {
							if (self.fieldconfig.length > 0 && self.fieldconfig[0]) {
								userInfo.datafield1 = self.initonedata(userInfo.datafield1, self.fieldconfig[0]);
							}
							if (self.fieldconfig.length > 0 && self.fieldconfig[1]) {
								userInfo.datafield2 = self.initonedata(userInfo.datafield2, self.fieldconfig[1]);
							}
							if (self.fieldconfig.length > 0 && self.fieldconfig[2]) {
								userInfo.datafield3 = self.initonedata(userInfo.datafield3, self.fieldconfig[2]);
							};
							if (self.fieldconfig.length > 0 && self.fieldconfig[3]) {
								userInfo.datafield4 = self.initonedata(userInfo.datafield4, self.fieldconfig[3]);
							}
							var s = $(one.element);
							s.find('.datafield1').text(userInfo.datafield1);
							s.find('.datafield2').text(userInfo.datafield2);
							s.find('.datafield3').text(userInfo.datafield3);
							s.find('.datafield4').text(userInfo.datafield4);
						}
					}
				}
			} else {
				if (self.flyspheretype == '1') {
					self.scene.rotation.y += self.flyspeed;
				} else {
					self.scene.rotation.x += self.flyspeed;
				}
				var s = $('.nodata:first');
				var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))] || false;
				if (s.length && userInfo) {
					s.removeClass('nodata');
					if (self.fieldconfig.length > 0 && self.fieldconfig[0]) {
						userInfo.datafield1 = self.initonedata(userInfo.datafield1, self.fieldconfig[0]);
					}
					if (self.fieldconfig.length > 0 && self.fieldconfig[1]) {
						userInfo.datafield2 = self.initonedata(userInfo.datafield2, self.fieldconfig[1]);
					}
					if (self.fieldconfig.length > 0 && self.fieldconfig[2]) {
						userInfo.datafield3 = self.initonedata(userInfo.datafield3, self.fieldconfig[2]);
					};
					if (self.fieldconfig.length > 0 && self.fieldconfig[3]) {
						userInfo.datafield4 = self.initonedata(userInfo.datafield4, self.fieldconfig[3]);
					}
					s.find('.datafield1').text(userInfo.datafield1);
					s.find('.datafield2').text(userInfo.datafield2);
					s.find('.datafield3').text(userInfo.datafield3);
					s.find('.datafield4').text(userInfo.datafield4);
				}
			}
			TWEEN.update();
			self.sceneRender();
		},
		sceneTransform: function (shape, duration) {
			var self = this;
			TWEEN.removeAll();
			for (var i = 0; i < self.cards.length; i++) {
				var object = self.cards[i];
				var target = self.targets[shape][i];
				new TWEEN.Tween(object.position)
					.to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
					.easing(TWEEN.Easing.Exponential.InOut)
					.start();
				new TWEEN.Tween(object.rotation)
					.to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
					.easing(TWEEN.Easing.Exponential.InOut)
					.start();
			}
			new TWEEN.Tween(this)
				.to({}, duration * 2)
				.onUpdate(function () {
					self.sceneRender();
				})
				.start();
		},
		sceneRender: function () {
			var self = this;
			self.renderer.render(self.scene, self.camera);
		},
		initShapePR: function () {
			var self = this;
			self.scene.position.x = self.scene.position.y = self.scene.position.z = 0;
			self.scene.rotation.x = self.scene.rotation.y = self.scene.rotation.z = 0;
		},
		updateCardsData: function () {
			var self = this, allLen = self.cards.length;
			//数据更新
			if (self.flytype > 1 && self.flytype != '7') {
				for (var j = 0; j < allLen; j++) {
					var h = self.cards[j], s = $(h.element);
					var userInfo = self.datas[Math.floor((Math.random() * self.datas.length))] || false;
					if (userInfo) {
						if (self.fieldconfig.length > 0 && self.fieldconfig[0]) {
							userInfo.datafield1 = self.initonedata(userInfo.datafield1, self.fieldconfig[0]);
						}
						if (self.fieldconfig.length > 0 && self.fieldconfig[1]) {
							userInfo.datafield2 = self.initonedata(userInfo.datafield2, self.fieldconfig[1]);
						}
						if (self.fieldconfig.length > 0 && self.fieldconfig[2]) {
							userInfo.datafield3 = self.initonedata(userInfo.datafield3, self.fieldconfig[2]);
						};
						if (self.fieldconfig.length > 0 && self.fieldconfig[3]) {
							userInfo.datafield4 = self.initonedata(userInfo.datafield4, self.fieldconfig[3]);
						}
						s.find('.datafield1').text(userInfo.datafield1);
						s.find('.datafield2').text(userInfo.datafield2);
						s.find('.datafield3').text(userInfo.datafield3);
						s.find('.datafield4').text(userInfo.datafield4);
						s.removeClass('hidden');
					} else {
						s.addClass('hidden');
					}
				}
			}
		},
		initprizeandluckernum: function (prizeid) {
			var self = this;
			prizeid = prizeid || self.getCurrentPrizeId();
			if (!prizeid) return false;
			var postdata = { isroundcj: isroundcj };
			if (postdata.isroundcj == '1') {
				postdata.roundid = prizeid;
			} else {
				postdata.prizeid = prizeid;
			}
			screencore.ajaxSubmit('/screen/importcj/ajaxprizeluckernum', postdata).then(function (json) {
				if (json.code == 0) {
					$(".lucker-numbox .prize-num").text(json.msg.prizenum);
					$(".lucker-numbox .lucker-num").text(json.msg.luckernum);
						self.syncPrizeStats(json.msg.prizenum, json.msg.luckernum);
						if (self.flytype == '6' && self.danmakuStage) {
							self.danmakuStage.updatePrize(self.getPrize());
						}
						if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		initOneround: function (roundid) {
			var self = this;
			roundid = roundid || self.getCurrentPrizeId();
			if (!roundid) return false;
			screencore.ajaxSubmit('/screen/importcj/initoneround', { roundid: roundid }).then(function (json) {
				if (json.code == 0) {
					var html = '', round = json.msg.round || {}, prizes = round.roundawards || [], prizestyle = round.style || { cols: 5, width: 300, gap: 20, prizecolor: '#FF9800', prizesize: 18, namecolor: '#fff', namesize: 18 };
					self.unifiedRoundItems = $.map(prizes, function (item) {
						var prize = item.prize || {}, prizeId = item.prizeid || item.id || prize.prizeid || prize.id;
						return $.extend({}, prize, { id: prizeId, prizeid: prizeId, num: item.num });
					});
					self.roundDrawCount = parseInt(json.msg.prizenum, 10);
					if (isNaN(self.roundDrawCount) || self.roundDrawCount < 1) self.roundDrawCount = null;
					self.normalizeCurrentDrawCount();
					$.each(prizes, function (i, v) {
						var one = v.prize;
						one.num = v.num;
						one.isroundcj = '1';
						html += template("prize-tpl", $.extend({}, one, { showPrizeInfo: true }));
					});
					$(".importcj-awardlist").html(html);
					var pgap = prizestyle.gap || 20, pw = prizestyle.width || 300, ipw = pw - parseInt(pw / 2);
					if (ipw < 50) {
						ipw = 50;
					}
					if (html == '') {
						html = '<div class="round-noprize">轮次未添加奖品</div>';
						$(".importcj-awardlist").html(html).css({
							"gap": "0px"
						});
					} else {
						$(".importcj-awardlist").html(html).css({
							"gap": `0 ${pgap}px`
						}).find('.importcj-awardbox .importcj-prizeimg').css({
							width: `${pw}px`,
							height: `${pw}px`,
						});
					}
					$(".importcj-awardlist .importcj-awardbox .importcj-prizeimg img").css({
						width: `${ipw}px`,
						height: `${ipw}px`,
					});
					$(".importcj-awardlist .importcj-awardbox .importcj-prizeinfo .importcj-prizename").css({
						color: (prizestyle.prizecolor || '#FF9800'),
						"font-size": (prizestyle.prizesize || 18) + 'px',
					});
					$(".importcj-awardlist .importcj-awardbox .importcj-prizeinfo .importcj-prizenum").css({
						color: (prizestyle.numcolor || '#fff'),
						"font-size": (prizestyle.numsize || 18) + 'px',
					});
					$(".lucker-numbox .prize-num").text(json.msg.prizenum);
					$(".lucker-numbox .lucker-num").text(json.msg.luckernum);
					$(".select-box").hide();
					self.syncLegacyDrawCount();
					self.syncPrizeStats(json.msg.prizenum, json.msg.luckernum);
					if (self.flytype == '6' && self.danmakuStage) {
						self.danmakuStage.updatePrize(self.getPrize());
					}
					if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		initonedata: function (str, config) {
			str = str || '';
			if (str != '' && config.fieldsecret == '1') {
				str = screencore.hiddentxt(str, config.lefthand, config.righthand);
			}
			return str;
		},
		getJumpCandidates: function () {
			var self = this;
			return self.datas.map(function (user) {
				var copy = {};
				for (var i = 0; i < 4; i++) copy['datafield' + (i + 1)] = self.fieldconfig[i] ? self.initonedata(user['datafield' + (i + 1)], self.fieldconfig[i]) : '';
				return copy;
			});
		},
		cancelJumpRun: function () {
			this.jumpRunId++;
			this.jumpPhase = null;
			this.jumpStarted = false;
			this.jumpStartGate = false;
			if (this.stageUi && this.stageUi.importResult) this.stageUi.importResult.cancelJump();
			var video = $('.firevideo1');
			if (video.length) { video.off('.importJump').hide(); video[0].pause(); }
		},
		stopJumpLottery: function () {
			var self = this, runId = self.jumpRunId;
			if (self.jumpPhase !== 'drawing' || !self.jumpStarted || !self.jumpStartGate) return false;
			self.jumpPhase = 'revealing';
			if ($('#cjingmusic').length) { $('#cjingmusic')[0].pause(); $('#cjingmusic')[0].currentTime = 0; }
			var video = $('.firevideo2');
			if (video.length) { video.unbind('ended').hide(); video[0].pause(); }
			return self.stageUi.revealDrawing({
				onFirstReveal: function () {
					if (runId === self.jumpRunId && $('#cjendmusic').length) $('#cjendmusic')[0].play();
				},
				onComplete: function () {
					if (runId !== self.jumpRunId || self.jumpPhase !== 'revealing') return;
					self.jumpPhase = 'complete';
					self.isstart = '3'; self.drawRequestPending = false;
					$('.importcj-mainbox').removeClass('isdrawing').addClass('isdrawed');
					$('.btn-start').text('关闭');
					self.setVisualState('result');
				}
			});
		},
		getHaloCandidates: function () {
			var self = this, fieldIndex = -1;
			for (var i = 0; i < 4; i++) {
				if (self.fieldconfig[i]) {
					fieldIndex = i;
					break;
				}
			}
			if (fieldIndex < 0) return ['嘉宾'];
			var field = self.fieldconfig[fieldIndex], fieldName = 'datafield' + (fieldIndex + 1);
			return $.map(self.datas, function (userInfo) {
				return self.initonedata((userInfo || {})[fieldName] || '', field);
			});
		},
		getDanmakuCandidates: function () {
			var self = this;
			return $.map(self.datas, function (userInfo) {
				var values = [];
				for (var i = 0; i < 4; i++) {
					if (!self.fieldconfig[i]) continue;
					var fieldName = 'datafield' + (i + 1);
					var value = self.initonedata((userInfo || {})[fieldName] || '', self.fieldconfig[i]);
					if (String(value).replace(/^\s+|\s+$/g, '') !== '') {
						values.push(value);
					}
				}
				if (!values.length) return null;
				return { name: values.shift(), extras: values };
			});
		},
		getPrize: function (remaining) {
			var self = this, prize = self.prizeInfo[self.prizeIndex] || {};
			var copy = $.extend({}, prize);
			if (isroundcj == '1') copy.items = self.unifiedRoundItems || [];
			if (remaining !== undefined && remaining !== null && remaining !== '') {
				copy.remaining = remaining;
			} else if (self.prizeStats && typeof self.prizeStats.remaining === 'number' && isFinite(self.prizeStats.remaining)) {
				copy.remaining = self.prizeStats.remaining;
			} else {
				copy.remaining = '—';
			}
			return copy;
		},
		openRecords: function (retry) {
			var self = this;
			var recordsView = self.stageUi || (self.flytype == '6' ? self.danmakuStage : null);
			if (!recordsView || (self.isstart != '1' && self.isstart != '3' && self.isstart != '4')) return false;
			var id = self.getCurrentPrizeId();
			if (!id) return false;
			var requestedPrizeIndex = self.prizeIndex;
			var requestId = ++self.recordsRequestId;
			self.recordsPrizeId = id;
			if (self.isstart != '4') {
				self.recordsReturnState = self.getVisualState();
				self.recordsReturnIsstart = self.isstart;
				self.isstart = '4';
			}
			self.setVisualState('records');
			recordsView.setRecords(null, 'loading');
			var ajaxdata = { isroundcj: isroundcj };
			if (isroundcj == '1') ajaxdata.roundid = id;
			else ajaxdata.prizeid = id;
			screencore.ajaxSubmit('/screen/importcj/ajaxlucker', ajaxdata, '正在加载中奖记录..').then(function (json) {
				if (requestId != self.recordsRequestId || self.isstart != '4' || self.prizeIndex != requestedPrizeIndex) return;
				if (json.code == 0) {
					recordsView.setRecords(json.msg || [], 'ready');
					self.syncSharedControls();
				} else {
					recordsView.setRecords(json.msg || '中奖记录加载失败', 'error');
					self.syncSharedControls();
				}
			}, function () {
				if (requestId != self.recordsRequestId || self.isstart != '4' || self.prizeIndex != requestedPrizeIndex) return;
				recordsView.setRecords('网络异常，请重试', 'error');
				self.syncSharedControls();
			});
			return true;
		},
		closeRecords: function () {
			var self = this;
			var recordsActive = self.isstart == '4' || self.visualState == 'records' || (self.stageUi && self.stageUi.state == 'records') || (self.danmakuStage && self.danmakuStage.state == 'records');
			if (!recordsActive) return false;
			self.invalidateRecords();
			if (self.stageUi && self.stageUi.closeRecords) self.stageUi.closeRecords();
			var returnState = self.recordsReturnState || 'ready';
			var returnIsstart = self.recordsReturnIsstart || (returnState == 'result' ? '3' : '1');
			self.recordsReturnState = null;
			self.recordsReturnIsstart = null;
			self.isstart = returnIsstart;
			self.setVisualState(returnState);
			return true;
		},
		startDrawingAnimation: function (runId) {
			var self = this;
			if (self.isstart != '2') return;
			if (self.flytype == '7') {
				if (runId !== self.jumpRunId || self.jumpPhase !== 'prepared' || !self.stageUi) return;
				if (!self.stageUi.beginDrawing()) return;
				self.jumpStarted = true; self.jumpPhase = 'drawing';
				if (self.jumpStartGate) self.setVisualState('drawing');
				return;
			}
			if (self.flytype == '1') {
				self.changerollitem();
			} else if (self.flytype == '5') {
				// 保留原滚动列表及其逐项停止计时器；星环只负责运行态呈现。
				self.changerollitem();
				if (self.haloStage) {
					self.haloStage.start(self.getHaloCandidates());
				}
			} else if (self.flytype == '6') {
				// 真实停止计时仍由原有滚动列表维护，弹幕只负责候选视觉流动。
				self.changerollitem();
				if (self.danmakuStage) {
					self.danmakuStage.updateCandidates(self.getDanmakuCandidates());
					self.danmakuStage.setDrawing(true);
				}
			} else {
				self.initShapePR();
				$(".importcj-wall").removeClass('hidden');
				self.stageStop = false;
			}
			$(".importcj-luckerbox").show();
		},
		initprizedatas: function (prizeid) {
			var self = this;
				screencore.ajaxSubmit('/screen/importcj/ajaxdatas', { isroundcj: isroundcj, prizeid: prizeid }).then(function (json) {
				if (json.code == 0) {
					self.datas = json.msg;
					if (self.datas.length) self.maxid = self.datas[0].dataid;
					self.updateCardsData();
					if (self.flytype == '7' && self.stageUi) self.stageUi.importResult.updateJumpCandidates(self.getJumpCandidates());
					self.normalizeCurrentDrawCount();
					if (self.flytype == '6' && self.danmakuStage) {
						self.danmakuStage.updateCandidates(self.getDanmakuCandidates());
					}
					if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		getnewUser: function () {
			var self = this;
			var prizeId = self.getCurrentPrizeId();
			if (!prizeId) {
				setTimeout(function () { self.getnewUser(); }, 5e3);
				return;
			}
			screencore.ajaxSubmit('/screen/importcj/getmoreuser', { prizeid: prizeId, maxid: self.maxid }).then(function (json) {
				if (json.code == 0) {
					var newdatas = json.msg || [];
					if (newdatas.length) {
						$.each(newdatas, function (i, v) {
							self.datas.push(v);
						});
						self.maxid = newdatas[0].dataid;
						if (self.flytype == '7' && self.stageUi) self.stageUi.importResult.updateJumpCandidates(self.getJumpCandidates());
						if (self.datas.length > 800) {
							self.datas.splice(0, (self.datas.length - 300));
						}
						self.normalizeCurrentDrawCount();
							if (self.flytype == '6' && self.danmakuStage) {
								self.danmakuStage.updateCandidates(self.getDanmakuCandidates());
							}
							if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
					}
				}
				setTimeout(function () {
					self.getnewUser();
				}, 5e3);
			}, function () {
				setTimeout(function () {
					self.getnewUser();
				}, 5e3);
			});
		},
		startLottery: function () {
			var self = this, $button = $(".btn-start"), onceout = self.drawCount || '0', prizeId = self.getCurrentPrizeId();
			if (self.isstart != '1' || self.drawRequestPending) return false;
			if (!prizeId) {
				layerBox.showMsg('请选择奖品');
				return false;
			}
			if (self.datas.length == 0) {
				layerBox.showMsg('奖品来源数据不存在');
				return false;
			}
			if (self.flytype == '6' || self.unifiedPrize) {
				var drawValidation = self.validateDrawCount();
				if (!drawValidation.ok) {
					self.syncSharedControls();
					layerBox.showMsg(drawValidation.message);
					return false;
				}
				onceout = String(drawValidation.value);
				self.syncLegacyDrawCount();
			}
			if (self.flytype == '7') {
				if (!self.stageUi || !self.stageUi.importResult) return false;
				self.cancelJumpRun();
			} else self.initrollitem(onceout > maxrollnum ? maxrollnum : onceout);
			var runId = self.jumpRunId;
			self.drawRequestPending = true;
			if (self.flytype == '6' || self.unifiedPrize) self.setVisualState('requesting');
			screencore.ajaxSubmit('/screen/importcj/savelucker', { isroundcj: isroundcj, prizeid: prizeId, onceout: onceout }).then(function (e) {
				if (self.flytype == '7' && runId !== self.jumpRunId) return;
				if (e.code == 0) {
					self.rememberLastSuccessfulPrize(prizeId);
					self.currentLuckerHtml = '';
					self.currentLuckerList = e.msg.list;
					if (e.msg && e.msg.lucker) self.syncPrizeStats(e.msg.lucker.prizenum, e.msg.lucker.luckernum);
					if (self.flytype == '6' && self.danmakuStage) self.danmakuStage.updatePrize(self.getPrize());
					if (self.unifiedPrize || self.stageUi || self.danmakuStage) self.syncSharedControls();
					if (isroundcj == '1') {
						$.each(e.msg.list, function (i, l) {
							$.each(l.luckers, function (j, v) {
								v.datafield1 = self.fieldconfig[0] ? self.initonedata(v.datafield1, self.fieldconfig[0]) : '';
								v.datafield2 = self.fieldconfig[1] ? self.initonedata(v.datafield2, self.fieldconfig[1]) : '';
								v.datafield3 = self.fieldconfig[2] ? self.initonedata(v.datafield3, self.fieldconfig[2]) : '';
								v.datafield4 = self.fieldconfig[3] ? self.initonedata(v.datafield4, self.fieldconfig[3]) : '';
							});
							if (self.flytype != '7') self.currentLuckerHtml += template('roundlucker-item', l);
						});
					} else {
						$.each(e.msg.list, function (i, v) {
							v.xuhao = self.initNumXuhao(i);
							v.isdrawed = '2';
							v.datafield1 = self.fieldconfig[0] ? self.initonedata(v.datafield1, self.fieldconfig[0]) : '';
							v.datafield2 = self.fieldconfig[1] ? self.initonedata(v.datafield2, self.fieldconfig[1]) : '';
							v.datafield3 = self.fieldconfig[2] ? self.initonedata(v.datafield3, self.fieldconfig[2]) : '';
							v.datafield4 = self.fieldconfig[3] ? self.initonedata(v.datafield4, self.fieldconfig[3]) : '';
							if (self.flytype != '7') self.currentLuckerHtml += template("lucker-tpl", v);
						});
					}
					if (self.flytype == '7') {
						self.stageUi.prepareDrawing({ candidates: self.getJumpCandidates(), confirmedValues: self.currentLuckerList, prize: self.getPrize(), runId: runId });
						self.jumpPhase = 'prepared';
					}
					if (self.flytype != '6') screencore.hideFootAndQr();
					setTimeout(function () {
						if (self.flytype == '7' && runId !== self.jumpRunId) return;
						var firevideo1 = $(".firevideo1");
						if (self.flytype == '7' && firevideo1.length) {
							var beginJump = function () {
								if (runId !== self.jumpRunId) return;
								firevideo1.off('.importJump').hide();
								self.startDrawingAnimation(runId);
							};
							firevideo1.off('.importJump').on('ended.importJump error.importJump', beginJump).show();
							firevideo1[0].currentTime = 0;
							var playing = firevideo1[0].play();
							if (playing && playing.catch) playing.catch(beginJump);
						} else if (firevideo1.length) {
							firevideo1.show();
							firevideo1[0].play();
							firevideo1.unbind('ended').bind('ended', function () {
								firevideo1.hide();
								self.startDrawingAnimation(runId);
							});
						} else {
							self.startDrawingAnimation(runId);
						}
					}, 50);
					$(".importcj-mainbox").removeClass('isdrawed').addClass('isdrawing');
					self.isstart = '2';
					if (self.flytype == '6' || self.unifiedPrize || self.stageUi) self.setVisualState('starting');
					setTimeout(function () {
						if (self.flytype == '7' && runId !== self.jumpRunId) return;
						self.jumpStartGate = true;
						$button.text('停止');
						if (self.isstart == '2' && (self.flytype != '7' || self.jumpStarted) && (self.flytype == '6' || self.unifiedPrize || self.stageUi)) self.setVisualState('drawing');
						if (e.msg.lucker) {
							$(".lucker-numbox .prize-num").text(e.msg.lucker.prizenum);
							$(".lucker-numbox .lucker-num").text(e.msg.lucker.luckernum);
						}
					}, 3e3);
					screencore.bgmusicpause();
					if ($("#cjingmusic").length > 0) $("#cjingmusic")[0].play();
				} else {
					self.drawRequestPending = false;
					if (self.flytype == '6' || self.unifiedPrize) self.setVisualState('ready');
					layerBox.showMsg(e.msg);
				}
				setTimeout(function () { if (self.flytype != '7' || runId === self.jumpRunId) self.drawRequestPending = false; }, 1e3);
			}, function () {
				if (self.flytype == '7' && runId !== self.jumpRunId) return;
				self.drawRequestPending = false;
				if (self.flytype == '6' || self.unifiedPrize) self.setVisualState('ready');
				layerBox.showMsg('出现异常，请稍后重试');
			});
			return true;
		},
		stopLottery: function () {
			var self = this, luckerList = self.currentLuckerList, luckerHtml = self.currentLuckerHtml;
			if (self.isstart != '2' || self.getVisualState() != 'drawing') return false;
			if (self.flytype == '7') return self.stopJumpLottery();
			var dedicatedResult = !!(self.stageUi && self.stageUi.importResult);
			if (self.flytype == '1' || self.flytype == '5' || self.flytype == '6') {
				var prizeOne = self.prizeInfo[self.prizeIndex] || {}, stoptype = prizeOne.stoptype || '1';
				if (stoptype == '1' || isroundcj == '1') {
					self.stoprollitem();
				} else {
					var stopAll = self.stopOnerollitem(stoptype, luckerList);
					if (!stopAll) return false;
				}
				if (self.flytype == '5' && self.haloStage) self.haloStage.stop();
				if (self.flytype == '6' && self.danmakuStage) self.danmakuStage.setResult(luckerList, self.getPrize());
			} else {
				$(".importcj-wall").addClass('hidden');
				self.stageStop = true;
			}
			if (self.stageUi) self.stageUi.setResult(luckerList, self.getPrize());
			if (!dedicatedResult) $(".importcj-luckerbox-lists").html(luckerHtml);
			if (!dedicatedResult && isroundcj == '1') {
				var style = self.prizeInfo[self.prizeIndex].style || {};
				var width = $(".importcj-luckerbox-lists").width() - 20, cols = style.rows || 8;
				$(".prizelucklist ul li").css({ width: (width / cols) + 'px' });
				$(".roundlucker-item .prizename").css({ color: style.awardcolor || '#FF9800', "font-size": (style.awardsize || 18) + 'px' });
				$(".roundlucker-item .data-one").css({ "font-size": (style.namesize || 18) + 'px' });
			}
			$(".importcj-mainbox").removeClass('isdrawing').addClass('isdrawed');
			$(".btn-start").text('关闭');
			var firevideo2 = $(".firevideo2");
			if (dedicatedResult && firevideo2.length) {
				firevideo2.unbind('ended').hide();
				firevideo2[0].pause();
			} else if (firevideo2.length) {
				firevideo2.show();
				firevideo2[0].play();
				firevideo2.unbind('ended').bind('ended', function () { firevideo2.hide(); });
			}
			self.isstart = '3';
			self.drawRequestPending = false;
			if (self.stageUi || self.flytype == '6') self.setVisualState('result');
			if ($("#cjingmusic").length) { $("#cjingmusic")[0].currentTime = 0; $("#cjingmusic")[0].pause(); }
			if ($("#cjendmusic").length) $("#cjendmusic")[0].play();
			if (!dedicatedResult && isautoscroll == '1') setTimeout(function () { self.initautoScroll('.importcj-luckerbox-content'); }, 2e3);
			return true;
		},
		closeResult: function () {
			var self = this;
			if (self.isstart != '3' && self.visualState != 'result') return false;
			if (self.flytype == '7') self.cancelJumpRun();
			var runId = self.jumpRunId;
			if (isautoscroll == '1') {
				self.removeautoScroll('.importcj-luckerbox-content');
				setTimeout(function () { $(".importcj-mainbox").removeClass('isdrawed'); }, 20);
			} else {
				$(".importcj-mainbox").removeClass('isdrawed');
			}
			$(".btn-start").text('开始');
			self.isstart = '1';
			self.drawRequestPending = false;
			if (self.stageUi || self.flytype == '6' || self.unifiedPrize) self.setVisualState('ready');
			if (self.flytype == '6' && self.danmakuStage) self.danmakuStage.setReady(self.getDanmakuCandidates(), self.getPrize());
			if ($("#cjendmusic").length) { $("#cjendmusic")[0].currentTime = 0; if (!$("#cjendmusic")[0].paused) $("#cjendmusic")[0].pause(); }
			$(".importcj-luckerbox").hide();
			setTimeout(function () {
				if (self.flytype != '7' || (runId === self.jumpRunId && self.getVisualState() == 'ready')) screencore.bgmusicplay();
			}, 1e3);
			return true;
		},
		handlePrimaryAction: function () {
			var state = this.getVisualState();
			if (this.isstart == '1' && state == 'ready') return this.startLottery();
			if (this.isstart == '2' && state == 'drawing') return this.stopLottery();
			if (this.isstart == '3' && state == 'result') return this.closeResult();
			return false;
		},
		handleCloseAction: function () {
			if (this.isstart == '4' || this.visualState == 'records') return this.closeRecords();
			if (this.isstart == '3' || this.visualState == 'result') return this.closeResult();
			return false;
		},
		bindevent: function () {
			var self = this;
			keyboardJS.bind('space', function (e) {
				self.handlePrimaryAction();
			});
			$(".btn-start").click(function () {
				return self.handlePrimaryAction();
			});
			$(".importcj-luckerbox-lists").on('click', ".deldata i", function () {
				var $this = $(this), recordid = $this.attr('data-id');
				layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
					var postdata = { isroundcj: isroundcj, recordid: recordid };
					if (isroundcj == '1') {
						postdata.roundid = self.getCurrentPrizeId();
					} else {
						postdata.prizeid = self.getCurrentPrizeId();
					}
					screencore.ajaxSubmit('/screen/importcj/dellucker', postdata, '').then(function (json) {
						if (json.code == 0) {
							$this.parent().parent().parent().parent().remove();
							layerBox.showMsg('删除成功');
							self.initprizeandluckernum();
							if (isroundcj == '2') {
								var num = $(".importcj-luckerbox-lists li").length;
								$(".importcj-luckerbox-lists").removeClass('bigdata1 bigdata2 bigdata3 bigdata4');
								if (num > 0 && num <= 2) {
									$(".importcj-luckerbox-lists").addClass('bigdata1');
								} else if (num > 2 && num <= 4) {
									$(".importcj-luckerbox-lists").addClass('bigdata2');
								} else if (num > 4 && num <= 6) {
									$(".importcj-luckerbox-lists").addClass('bigdata3');
								} else if (num > 6 && num <= 8) {
									$(".importcj-luckerbox-lists").addClass('bigdata4');
								}
							}
						} else {
							layerBox.showMsg(json.msg);
						}
					});
				});
			});
			$(".btn-showalllucker").click(function () {
				return self.openRecords();
			});
			$(".btn-close").click(function () {
				return self.handleCloseAction();
			});
			keyboardJS.bind('/', function (e) {
				if (self.isstart == '2') return false;
				layerBox.showConfirm('警告', '清空将删除当前' + (isroundcj == '1' ? '轮次' : '奖品') + '的所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
					var url = isroundcj == '1' ? '/screen/importcj/delroundalllucker' : '/screen/importcj/delalllucker';
					var ajaxdata = {};
					if (isroundcj == '1') {
						ajaxdata.roundid = self.getCurrentPrizeId();
					} else {
						ajaxdata.prizeid = self.getCurrentPrizeId();
					}
					screencore.ajaxSubmit(url, ajaxdata, '').then(function (e) {
						if (e.code == 0) {
							layerBox.showMsg('清空成功');
							self.initprizeandluckernum();
							if (isroundcj == '1') {
								$(".importcj-luckerbox-lists .roundlucker-item").remove();
							} else {
								$(".importcj-luckerbox-lists li").remove();
							}
						} else {
							layerBox.showMsg(e.msg);
						}
					});
				});
			});
			//切换奖品
			$(".importcj-footer .prev-prize").click(function () {
				if (self.isstart != '1' || self.prizeInfo.length == 0) return false;
				self.prizeIndex--;
				if (self.prizeIndex < 0) {
					self.prizeIndex = self.prizeInfo.length - 1;
				}
				if (isroundcj == '1') {
					self.initroundinfo();
				} else {
					self.initprize();
				}
			});
			$(".importcj-footer .next-prize").click(function () {
				if (self.isstart != '1' || self.prizeInfo.length == 0) return false;
				self.prizeIndex++;
				if (self.prizeIndex >= self.prizeInfo.length) {
					self.prizeIndex = 0;
				}
				if (isroundcj == '1') {
					self.initroundinfo();
				} else {
					self.initprize();
				}
			});
			keyboardJS.bind('left', function (e) {
				$(".importcj-footer .prev-prize").trigger('click');
			});
			keyboardJS.bind('right', function (e) {
				$(".importcj-footer .next-prize").trigger('click');
			});
			keyboardJS.bind('up', function (e) {
				if (self.isstart != '1' || isroundcj == '1') return false;
				self.setDrawCount((parseInt(self.drawCount, 10) || 1) + 1);
			});
			keyboardJS.bind('down', function (e) {
				if (self.isstart != '1' || isroundcj == '1') return false;
				self.setDrawCount(Math.max(1, (parseInt(self.drawCount, 10) || 1) - 1));
			});
			keyboardJS.bind('shift', function (e) {
				self.openRecords();
			});

		},
		initNumXuhao: function (num) {
			var xuhao = num || 0, xuhaotimes = [];
			if (XCV3Config.rhdid == '-1') {
				xuhaotimes = ['08:55-09:15', '09:15-09:35', '09:35-09:55', '09:55-10:15', '10:25-10:45', '10:45-11:05', '11:05-11:25', '11:25-11:45', '13:40-14:00', '14:00-14:20', '14:20-14:40', '14:40-15:00', '15:10-15:30', '15:30-15:50', '15:50-16:10', '16:10-16:30', '16:40-17:00', '17:00-17:20', '17:20-17:40', '17:40-18:00'];
			}
			return (xuhao + 1) + (xuhaotimes[xuhao] ? `<span>(${xuhaotimes[xuhao]})</span>` : '');
		},
		getprizelucker: function (id, fn, fn2) {
			var self = this;
			var ajaxdata = { isroundcj: isroundcj };
			if (isroundcj == '1') {
				ajaxdata.roundid = id;
			} else {
				ajaxdata.prizeid = id;
			}
			screencore.ajaxSubmit('/screen/importcj/ajaxlucker', ajaxdata, '正在加载中奖记录..').then(function (e) {
				if (e.code == 0) {
					fn && fn(e.msg);
				} else {
					fn2 && fn2(e.msg);
				}
			});
		},
		scrollSpeed: 50,
		animescrollobj: null,
		startScrollY: 0,
		scrollReset: false,
		loopScrollcount: 1,
		initautoScroll: function (classname, resettype) {
			var self = this, resettype = resettype || false;
			if ($(classname).length <= 0) {
				return false;
			}
			var animes = anime.running;
			anime.remove(classname);
			var self = this, scrollHeight = $(classname)[0].scrollHeight, height = $(classname).outerHeight(), maxscrollH = Math.ceil(scrollHeight - height);
			if (maxscrollH > 0) {
				if (self.loopScrollcount % 2 === 0) {
					var duration = (self.startScrollY / self.scrollSpeed) * 1e3;
					var scrollTop = [self.startScrollY, 0];
					if (resettype) {
						duration = (maxscrollH / self.scrollSpeed) * 1e3;
						scrollTop = [maxscrollH, 0];
					}
				} else {
					var duration = ((maxscrollH - self.startScrollY) / self.scrollSpeed) * 1e3;
					var scrollTop = [self.startScrollY, maxscrollH];
				}
				self.animescrollobj = anime({
					targets: classname,
					scrollTop: scrollTop,
					duration: duration,
					direction: 'alternate',
					loop: true,
					autoplay: true,
					easing: 'linear',
					loopComplete: function (anim) {
						self.startScrollY = 0;
						self.loopScrollcount++;
						if (self.scrollReset) {
							self.initautoScroll(classname, self.loopScrollcount % 2 === 0);
							self.scrollReset = false;
						}
					},
				});
				$(classname).unbind("mouseenter").bind("mouseenter", function () {
					if (self.animescrollobj) {
						self.animescrollobj.pause();
						self.startScrollY = $(classname).scrollTop();
					}
				});
				$(classname).unbind("mouseleave").bind("mouseleave", function () {
					self.startScrollY = $(classname).scrollTop();
					self.scrollReset = true;
					self.initautoScroll(classname);
				});
			}

		},
		removeautoScroll: function (classname) {
			var self = this;
			if (self.animescrollobj) {
				self.animescrollobj.pause();
				if (classname) {
					self.animescrollobj.remove(classname);
					$(classname).scrollTop(0);
					$(classname).unbind("mouseenter");
					$(classname).unbind("mouseleave");
				}
				self.animescrollobj = null;
			}
			self.startScrollY = 0;
			self.scrollReset = false;
			self.loopScrollcount = 1;
		},
	};
	return screenimportcj;
});
