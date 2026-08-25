/*
 * 星环名单抽奖运行态。
 * 该模块只接收已经由 screenimportcj.initonedata 处理过的首字段文本，
 * 不参与中奖计算、停止规则或结果渲染。
 */
define([], function () {
	'use strict';

	var PERIPHERAL_NODE_COUNT = 60;
	var COLOR_PAIRS = [
		['12b5ff', 'a93cff', '18,181,255'],
		['ff2970', 'ffaa00', '255,41,112'],
		['00ff88', '00aaff', '0,255,136'],
		['ff00ff', '5500ff', '255,0,255'],
		['ffcc00', 'ff2970', '255,204,0'],
		['00e5ff', '0055ff', '0,229,255']
	];

	function normalizeValue(value) {
		value = value === null || value === undefined ? '' : String(value);
		value = value.replace(/^\s+|\s+$/g, '');
		return value || '嘉宾';
	}

	function textLength(value) {
		return normalizeValue(value).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;
	}

	function peripheralPadding(nodeSize) {
		return Math.max(5, Math.min(12, nodeSize * 0.12));
	}

	function peripheralFontSize(value, nodeSize) {
		var length = Math.max(1, textLength(value));
		var columns = Math.max(1, Math.ceil(Math.sqrt(length)));
		var rows = Math.ceil(length / columns);
		var available = Math.max(12, nodeSize - (peripheralPadding(nodeSize) * 2) - 4);
		return Math.max(8, Math.floor(Math.min(nodeSize * 0.38, available / columns, available / (rows * 1.08))));
	}

	function centerFontSize(value) {
		var length = textLength(value);
		if (length <= 2) return 72;
		if (length <= 4) return 52;
		if (length <= 8) return 38;
		if (length <= 12) return 30;
		return Math.max(12, Math.floor(30 * Math.sqrt(12 / length)));
	}

	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function HaloStage(options) {
		options = options || {};
		this.root = options.root || null;
		this.stage = null;
		this.centerValue = null;
		this.peripheralNodes = [];
		this.candidates = ['嘉宾'];
		this.centerTimer = null;
		this.peripheralTimer = null;
		this.resizeBound = false;
		this.boundResize = this.resize.bind(this);
	}

	HaloStage.prototype.start = function (values) {
		this.destroy();
		this.candidates = (values || []).map(normalizeValue);
		if (!this.candidates.length) this.candidates = ['嘉宾'];
		if (!this.root) return;

		this.build();
		this.resize();
		if (typeof window !== 'undefined' && window.addEventListener) {
			window.addEventListener('resize', this.boundResize);
			this.resizeBound = true;
		}

		var self = this;
		this.centerTimer = setInterval(function () {
			self.refreshCenter();
		}, 60);

		this.peripheralTimer = setInterval(function () {
			self.refreshPeripheralBatch();
		}, 900);
	};

	HaloStage.prototype.build = function () {
		var doc = this.root.ownerDocument || document;
		var stage = doc.createElement('div');
		stage.className = 'importcj-halo-stage';
		stage.setAttribute('aria-hidden', 'true');

		var rings = doc.createElement('div');
		rings.className = 'importcj-halo-rings';
		for (var ringIndex = 1; ringIndex <= 3; ringIndex++) {
			var ring = doc.createElement('i');
			ring.className = 'importcj-halo-ring importcj-halo-ring-' + ringIndex;
			rings.appendChild(ring);
		}
		stage.appendChild(rings);

		var nodes = doc.createElement('div');
		nodes.className = 'importcj-halo-nodes';
		var center = doc.createElement('div');
		center.className = 'importcj-halo-center';
		var centerValue = doc.createElement('span');
		centerValue.className = 'importcj-halo-center-value';
		center.appendChild(centerValue);
		nodes.appendChild(center);
		this.centerValue = centerValue;

		for (var index = 0; index < PERIPHERAL_NODE_COUNT; index++) {
			var node = this.createPeripheralNode(doc, index);
			this.peripheralNodes.push(node);
			nodes.appendChild(node);
		}
		stage.appendChild(nodes);
		this.root.appendChild(stage);
		this.stage = stage;

		this.refreshCenter();
		for (var i = 0; i < this.peripheralNodes.length; i++) {
			this.setPeripheralValue(this.peripheralNodes[i]);
		}
	};

	HaloStage.prototype.createPeripheralNode = function (doc, index) {
		var node = doc.createElement('span');
		node.className = 'importcj-halo-node';
		node.setAttribute('data-halo-node', String(index));
		var colorPair = COLOR_PAIRS[randomInt(0, COLOR_PAIRS.length - 1)];
		var glowColor = COLOR_PAIRS[randomInt(0, COLOR_PAIRS.length - 1)][2];
		var depth = Math.random();
		node.style.setProperty('--halo-node-size', randomInt(40, 90) + 'px');
		node.style.setProperty('--halo-node-radius', randomInt(200, 950) + 'px');
		node.style.setProperty('--halo-node-scale', (0.3 + depth * 1.5).toFixed(2));
		node.style.setProperty('--halo-node-duration', randomInt(20, 50) + 's');
		node.style.setProperty('--halo-node-delay', '-' + randomInt(0, 50) + 's');
		node.style.setProperty('--halo-node-opacity', (0.15 + Math.random() * 0.5).toFixed(2));
		node.style.setProperty('--halo-node-color-start', '#' + colorPair[0]);
		node.style.setProperty('--halo-node-color-end', '#' + colorPair[1]);
		node.style.setProperty('--halo-node-color', 'rgba(' + glowColor + ',.6)');
		return node;
	};

	HaloStage.prototype.pickValue = function () {
		return this.candidates[randomInt(0, this.candidates.length - 1)] || '嘉宾';
	};

	HaloStage.prototype.refreshCenter = function () {
		if (!this.centerValue) return;
		var value = this.pickValue();
		var colorPair = COLOR_PAIRS[randomInt(0, COLOR_PAIRS.length - 1)];
		this.centerValue.textContent = value;
		this.centerValue.style.fontSize = centerFontSize(value) + 'px';
		this.centerValue.parentNode.style.setProperty('--halo-center-color-start', '#' + colorPair[0]);
		this.centerValue.parentNode.style.setProperty('--halo-center-color-end', '#' + colorPair[1]);
	};

	HaloStage.prototype.setPeripheralValue = function (node) {
		var value = this.pickValue();
		var nodeSize = parseFloat(node.style.getPropertyValue('--halo-node-size')) || 60;
		node.textContent = value;
		node.style.setProperty('--halo-node-padding', peripheralPadding(nodeSize) + 'px');
		node.style.setProperty('--halo-node-font-size', peripheralFontSize(value, nodeSize) + 'px');
		node.classList.remove('is-changing');
		void node.offsetWidth;
		node.classList.add('is-changing');
	};

	HaloStage.prototype.refreshPeripheralBatch = function () {
		if (!this.peripheralNodes.length) return;
		var count = Math.min(5, this.peripheralNodes.length);
		var used = {};
		for (var i = 0; i < count; i++) {
			var index;
			do {
				index = randomInt(0, this.peripheralNodes.length - 1);
			} while (used[index]);
			used[index] = true;
			this.setPeripheralValue(this.peripheralNodes[index]);
		}
	};

	HaloStage.prototype.resize = function () {
		if (!this.stage || !this.root) return;
		var rect = this.root.getBoundingClientRect();
		// 大屏框架会在根节点之外统一缩放 800px 高的布局。getBoundingClientRect
		// 已包含这层缩放，若再次用它计算舞台比例会造成星环被双重放大。
		var width = this.root.clientWidth || rect.width || (typeof window !== 'undefined' ? window.innerWidth : 1920);
		var height = this.root.clientHeight || rect.height || (typeof window !== 'undefined' ? window.innerHeight : 1080);
		var scale = Math.min(width / 1920, height / 1080);
		this.stage.style.setProperty('--halo-stage-scale', Math.max(scale, 0.1).toFixed(4));
	};

	HaloStage.prototype.stop = function () {
		this.destroy();
	};

	HaloStage.prototype.destroy = function () {
		clearInterval(this.centerTimer);
		clearInterval(this.peripheralTimer);
		this.centerTimer = null;
		this.peripheralTimer = null;

		if (this.resizeBound && typeof window !== 'undefined' && window.removeEventListener) {
			window.removeEventListener('resize', this.boundResize);
		}
		this.resizeBound = false;
		if (this.stage && this.stage.parentNode) {
			this.stage.parentNode.removeChild(this.stage);
		}
		this.stage = null;
		this.centerValue = null;
		this.peripheralNodes = [];
	};

	return {
		PERIPHERAL_NODE_COUNT: PERIPHERAL_NODE_COUNT,
		normalizeValue: normalizeValue,
		peripheralFontSize: peripheralFontSize,
		centerFontSize: centerFontSize,
		create: function (options) {
			return new HaloStage(options);
		}
	};
});
