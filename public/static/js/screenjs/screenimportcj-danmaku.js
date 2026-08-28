/*
 * 弹幕星河 flytype=6 渲染器。
 * 只负责候选人流动、速度和舞台生命周期；公共控制/结果/记录由 stage-ui 管理。
 */
define([], function () {
    'use strict';

    var DENSITY_PRESETS = {
        sparse: { lanes: 4, maxItems: 20 },
        normal: { lanes: 6, maxItems: 36 },
        dense: { lanes: 8, maxItems: 52 }
    };
    var ACCENT_PALETTE = [
        '#58e6ff', '#ff8a65', '#a879ff', '#5ce6b6',
        '#ffd166', '#ff8fc8', '#7fb3ff', '#ff6f61'
    ];
    var SPEED_PRESETS = {
        slow: { key: 'slow', label: '舒缓', factor: 0.6, interval: 620 },
        normal: { key: 'normal', label: '标准', factor: 1.0, interval: 420 },
        fast: { key: 'fast', label: '热烈', factor: 1.6, interval: 300 }
    };

    function asText(value) {
        return value === null || value === undefined ? '' : String(value).replace(/^\s+|\s+$/g, '');
    }

    function normalizeCandidate(value) {
        if (typeof value === 'string') return { name: asText(value), extras: [] };
        value = value || {};
        var extras = value.extras || [value.datafield2, value.datafield3, value.datafield4];
        return {
            name: asText(value.name || value.datafield1 || ''),
            extras: extras.map(asText).filter(function (item) { return item !== ''; }).slice(0, 2)
        };
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function normalizeStyleConfig(value) {
        value = value || {};
        var fontSize = parseInt(value.fontSize, 10);
        if (isNaN(fontSize)) fontSize = 18;
        var density = DENSITY_PRESETS[value.density] ? value.density : 'normal';
        var accentColor = asText(value.accentColor);
        var textColor = asText(value.textColor);
        if (!accentColor || accentColor.length > 64 || /[;"'{}]/.test(accentColor)) accentColor = '#58e6ff';
        if (!textColor || textColor.length > 64 || /[;"'{}]/.test(textColor)) textColor = '#f5fbff';
        return {
            fontSize: Math.max(12, Math.min(40, fontSize)),
            density: density,
            colorMode: value.colorMode === 'random' ? 'random' : 'fixed',
            accentColor: accentColor,
            textColor: textColor,
            showAvatar: value.showAvatar !== false,
            showExtras: value.showExtras !== false,
            showBox: value.showBox !== false
        };
    }

    function DanmakuStage(options) {
        options = options || {};
        this.root = options.root || null;
        this.styleConfig = normalizeStyleConfig(options.styleConfig);
        this.speedPreset = SPEED_PRESETS[options.speedPreset] ? options.speedPreset : 'normal';
        this.speedFactor = SPEED_PRESETS[this.speedPreset].factor;
        this.state = 'ready';
        this.stage = null;
        this.field = null;
        this.candidates = [];
        this.items = [];
        this.spawnTimer = null;
        this.rafId = null;
        this.resizeObserver = null;
        this.resizeBound = false;
        this.boundResize = this.resize.bind(this);
        this.boundVisibility = this.handleVisibility.bind(this);
        this.paused = false;
        this.reducedMotion = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
        this.laneHeight = 76;
        this.laneIndex = 0;
    }

    DanmakuStage.prototype.mount = function (values) {
        this.destroy();
        if (!this.root) return this;
        var doc = this.root.ownerDocument || document;
        var stage = doc.createElement('div');
        stage.className = 'importcj-danmaku-stage';
        stage.style.setProperty('--danmaku-font-size', this.styleConfig.fontSize + 'px');
        stage.style.setProperty('--danmaku-accent', this.styleConfig.accentColor);
        stage.style.setProperty('--danmaku-text-color', this.styleConfig.textColor);
        var field = doc.createElement('div');
        field.className = 'importcj-danmaku-field';
        field.setAttribute('aria-hidden', 'true');
        stage.appendChild(field);
        this.root.appendChild(stage);
        this.stage = stage;
        this.field = field;
        this.updateCandidates(values || []);
        this.bindLifecycle();
        this.resize();
        this.setState('ready');
        this.startSpawn();
        this.startLoop();
        return this;
    };

    DanmakuStage.prototype.bindLifecycle = function () {
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('resize', this.boundResize);
            this.resizeBound = true;
        }
        if (typeof document !== 'undefined' && document.addEventListener) {
            document.addEventListener('visibilitychange', this.boundVisibility);
        }
        if (typeof window !== 'undefined' && window.ResizeObserver && this.root) {
            this.resizeObserver = new window.ResizeObserver(this.boundResize);
            this.resizeObserver.observe(this.root);
        }
    };

    DanmakuStage.prototype.setState = function (state) {
        this.state = /^(ready|requesting|starting|drawing|result|records)$/.test(state) ? state : 'ready';
        if (!this.stage) return this;
        this.stage.setAttribute('data-state', this.state);
        this.stage.classList.toggle('is-drawing', this.state === 'drawing');
        return this;
    };

    DanmakuStage.prototype.updateCandidates = function (values) {
        var self = this;
        this.candidates = (values || []).map(normalizeCandidate).filter(function (item) { return item.name !== ''; });
        if (!this.candidates.length) {
            this.clearItems();
            return this;
        }
        if (this.reducedMotion && this.field) {
            this.clearItems();
            this.candidates.slice(0, Math.min(this.getDensityConfig().maxItems, 12)).forEach(function () { self.spawnItem(true); });
        }
        return this;
    };

    DanmakuStage.prototype.setDrawing = function (drawing) {
        if (drawing) {
            this.setState('drawing');
            this.startSpawn();
        } else {
            this.setState('ready');
            this.startSpawn();
        }
    };

    /* 兼容旧 controller 调用；公共奖品窗不再由此模块渲染。 */
    DanmakuStage.prototype.updatePrize = function () { return this; };
    DanmakuStage.prototype.updateControls = function (data) {
        data = data || {};
        if (data.speedPreset) this.setSpeedPreset(data.speedPreset);
        if (data.state) this.setState(data.state);
        return this;
    };
    DanmakuStage.prototype.setControls = DanmakuStage.prototype.updateControls;
    DanmakuStage.prototype.setRecords = function () { return this; };
    DanmakuStage.prototype.setResult = function () {
        this.stopSpawn();
        this.clearItems();
        this.setState('result');
        return this;
    };
    DanmakuStage.prototype.setReady = function (values) {
        this.clearItems();
        this.updateCandidates(values || []);
        this.setState('ready');
        this.startSpawn();
        this.startLoop();
        return this;
    };

    DanmakuStage.prototype.setSpeedPreset = function (preset) {
        if (!SPEED_PRESETS[preset]) preset = 'normal';
        this.speedPreset = preset;
        this.speedFactor = SPEED_PRESETS[preset].factor;
        if (this.state !== 'result') this.startSpawn();
        return this;
    };

    DanmakuStage.prototype.getSpeedPreset = function () {
        return this.speedPreset;
    };

    DanmakuStage.prototype.stopSpawn = function () {
        if (this.spawnTimer) window.clearInterval(this.spawnTimer);
        this.spawnTimer = null;
    };

    DanmakuStage.prototype.startSpawn = function () {
        var self = this;
        var density = this.getDensityConfig();
        this.stopSpawn();
        if (this.reducedMotion || this.state === 'result') return;
        this.spawnTimer = window.setInterval(function () {
            if (self.paused || (typeof document !== 'undefined' && document.hidden) || !self.candidates.length || self.items.length >= density.maxItems) return;
            self.spawnItem(false);
        }, SPEED_PRESETS[this.speedPreset].interval);
    };

    DanmakuStage.prototype.getDensityConfig = function () {
        return DENSITY_PRESETS[this.styleConfig.density] || DENSITY_PRESETS.normal;
    };

    DanmakuStage.prototype.pickAccent = function () {
        if (this.styleConfig.colorMode !== 'random') return this.styleConfig.accentColor;
        return ACCENT_PALETTE[randomInt(0, ACCENT_PALETTE.length - 1)];
    };

    DanmakuStage.prototype.getLaneCount = function () {
        var height = this.field ? this.field.clientHeight : (this.root ? this.root.clientHeight : 660);
        return Math.max(3, Math.min(this.getDensityConfig().lanes, Math.floor(Math.max(160, height - 60) / this.laneHeight)));
    };

    DanmakuStage.prototype.getLaneTop = function (lane) {
        var count = this.getLaneCount();
        var height = this.field ? this.field.clientHeight : (this.root ? this.root.clientHeight : 660);
        var usable = Math.max(160, height - 86);
        return Math.round(15 + (count > 1 ? usable / (count - 1) : 0) * lane);
    };

    DanmakuStage.prototype.spawnItem = function (staticItem) {
        if (!this.field || !this.candidates.length) return;
        var candidate = this.candidates[randomInt(0, this.candidates.length - 1)];
        var doc = this.field.ownerDocument || document;
        var item = doc.createElement('span');
        item.className = 'importcj-danmaku-item';
        item.classList.toggle('is-no-avatar', !this.styleConfig.showAvatar);
        item.classList.toggle('is-plain', !this.styleConfig.showBox);
        item.style.setProperty('--danmaku-item-accent', this.pickAccent());
        var avatar;
        if (this.styleConfig.showAvatar) {
            avatar = doc.createElement('i');
            avatar.className = 'importcj-danmaku-avatar';
            avatar.textContent = candidate.name.charAt(0);
        }
        var content = doc.createElement('span');
        content.className = 'importcj-danmaku-content';
        var name = doc.createElement('strong');
        name.className = 'importcj-danmaku-name';
        name.textContent = candidate.name;
        content.appendChild(name);
        if (this.styleConfig.showExtras) candidate.extras.forEach(function (extra) {
                var node = doc.createElement('small');
                node.className = 'importcj-danmaku-extra';
                node.textContent = extra;
                content.appendChild(node);
            });
        if (avatar) item.appendChild(avatar);
        item.appendChild(content);
        var width = this.field.clientWidth || (this.root ? this.root.clientWidth : 1920);
        var lane = (this.laneIndex++) % this.getLaneCount();
        var x = staticItem ? Math.round(width * (.08 + ((this.items.length * .16) % .82))) : width + randomInt(20, 160);
        item.style.top = this.getLaneTop(lane) + 'px';
        item.style.transform = 'translate3d(' + x + 'px,0,0)';
        this.field.appendChild(item);
        this.items.push({ element: item, x: x, width: item.offsetWidth || 200, baseSpeed: 1.25 + Math.random() * .85, staticItem: !!staticItem, lane: lane });
        if (staticItem) item.classList.add('is-static');
    };

    DanmakuStage.prototype.startLoop = function () {
        if (this.reducedMotion || this.paused || (typeof document !== 'undefined' && document.hidden) || this.rafId !== null) return;
        this.rafId = window.requestAnimationFrame(this.tick.bind(this));
    };

    DanmakuStage.prototype.tick = function () {
        this.rafId = null;
        if (this.reducedMotion || this.paused || (typeof document !== 'undefined' && document.hidden)) return;
        var multiplier = (this.state === 'drawing' ? 2.15 : 1) * this.speedFactor;
        for (var i = this.items.length - 1; i >= 0; i--) {
            var entry = this.items[i];
            if (!entry.staticItem) {
                entry.x -= entry.baseSpeed * multiplier;
                entry.element.style.transform = 'translate3d(' + entry.x + 'px,0,0)';
            }
            if (!entry.staticItem && entry.x < -entry.width - 120) {
                if (entry.element.parentNode) entry.element.parentNode.removeChild(entry.element);
                this.items.splice(i, 1);
            }
        }
        this.startLoop();
    };

    DanmakuStage.prototype.resize = function () {
        if (!this.field) return;
        var count = this.getLaneCount();
        this.items.forEach(function (entry) {
            if (entry.lane !== undefined) entry.element.style.top = this.getLaneTop(entry.lane % count) + 'px';
        }, this);
    };

    DanmakuStage.prototype.handleVisibility = function () {
        this.paused = typeof document !== 'undefined' && !!document.hidden;
        if (!this.paused) this.startLoop();
    };

    DanmakuStage.prototype.clearItems = function () {
        this.items.forEach(function (entry) {
            if (entry.element && entry.element.parentNode) entry.element.parentNode.removeChild(entry.element);
        });
        this.items = [];
    };

    DanmakuStage.prototype.destroy = function () {
        this.stopSpawn();
        if (this.rafId !== null && typeof window !== 'undefined' && window.cancelAnimationFrame) window.cancelAnimationFrame(this.rafId);
        this.rafId = null;
        if (this.resizeObserver) this.resizeObserver.disconnect();
        this.resizeObserver = null;
        if (this.resizeBound && typeof window !== 'undefined') window.removeEventListener('resize', this.boundResize);
        this.resizeBound = false;
        if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.boundVisibility);
        this.clearItems();
        if (this.stage && this.stage.parentNode) this.stage.parentNode.removeChild(this.stage);
        this.stage = null;
        this.field = null;
        return this;
    };

    return {
        create: function (options) { return new DanmakuStage(options); },
        normalizeCandidate: normalizeCandidate,
        normalizeStyleConfig: normalizeStyleConfig
    };
});
