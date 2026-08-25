/*
 * 弹幕星河导入名单抽奖主题运行态。
 * 该模块只负责候选名单的视觉流动，不参与抽奖、排重、名额或中奖记录。
 */
define([], function () {
    'use strict';

    var MAX_ITEMS = 36;
    var LANE_COUNT = 6;
    var COLORS = [
        ['#58e6ff', '#7189ff'],
        ['#ffd477', '#f39b54'],
        ['#ff8fc8', '#a879ff'],
        ['#83f1c1', '#48b9ed']
    ];

    function asText(value) {
        return value === null || value === undefined ? '' : String(value).replace(/^\s+|\s+$/g, '');
    }

    function normalizeCandidate(value) {
        if (typeof value === 'string') {
            return { name: asText(value), extras: [] };
        }
        value = value || {};
        var legacyName = value.name || value.datafield1 || '';
        var legacyExtras = value.extras || [value.datafield2, value.datafield3, value.datafield4];
        return {
            name: asText(legacyName),
            extras: legacyExtras.map(asText).filter(function (item) { return item !== ''; }).slice(0, 2)
        };
    }

    function safeImageUrl(value) {
        value = asText(value);
        if (!value || /^javascript:/i.test(value) || /^data:/i.test(value)) return '';
        if (/^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(value)) return value;
        return '';
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function DanmakuStage(options) {
        options = options || {};
        this.root = options.root || null;
        this.stage = null;
        this.field = null;
        this.focus = null;
        this.prizePanel = null;
        this.resultPanel = null;
        this.resultList = null;
        this.candidates = [];
        this.items = [];
        this.state = 'ready';
        this.spawnTimer = null;
        this.rafId = null;
        this.resizeObserver = null;
        this.resizeBound = false;
        this.boundResize = this.resize.bind(this);
        this.boundVisibility = this.handleVisibility.bind(this);
        this.reducedMotion = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
        this.paused = false;
        this.laneHeight = 110;
    }

    DanmakuStage.prototype.mount = function (values) {
        this.destroy();
        if (!this.root) return;

        this.build();
        this.updateCandidates(values || []);
        this.bindLifecycle();
        this.resize();
        this.setState('ready');
        this.startSpawn();
        this.startLoop();
    };

    DanmakuStage.prototype.build = function () {
        var doc = this.root.ownerDocument || document;
        var stage = doc.createElement('div');
        stage.className = 'importcj-danmaku-stage';
        stage.setAttribute('aria-hidden', 'true');

        var prizePanel = this.createPrizePanel(doc);
        var resultPanel = this.createResultPanel(doc);
        var field = doc.createElement('div');
        field.className = 'importcj-danmaku-field';

        var focus = doc.createElement('div');
        focus.className = 'importcj-danmaku-focus';
        var focusKicker = doc.createElement('span');
        focusKicker.className = 'importcj-danmaku-focus-kicker';
        focusKicker.textContent = 'DANMAKU LOTTERY';
        var focusValue = doc.createElement('strong');
        focusValue.className = 'importcj-danmaku-focus-value';
        focusValue.textContent = '名单已就绪';
        focus.appendChild(focusKicker);
        focus.appendChild(focusValue);

        stage.appendChild(field);
        stage.appendChild(prizePanel);
        stage.appendChild(resultPanel);
        stage.appendChild(focus);
        this.root.appendChild(stage);
        this.stage = stage;
        this.field = field;
        this.focus = focusValue;
        this.prizePanel = prizePanel;
        this.resultPanel = resultPanel;
        this.resultList = resultPanel.querySelector('.importcj-danmaku-result-list');
    };

    DanmakuStage.prototype.createPrizePanel = function (doc) {
        var panel = doc.createElement('section');
        panel.className = 'importcj-danmaku-prize';
        var kicker = doc.createElement('span');
        kicker.className = 'importcj-danmaku-prize-kicker';
        kicker.textContent = 'CURRENT PRIZE · 准备抽取';
        var imageWrap = doc.createElement('div');
        imageWrap.className = 'importcj-danmaku-prize-image is-missing';
        var image = doc.createElement('img');
        image.alt = '礼品图片';
        imageWrap.appendChild(image);
        var name = doc.createElement('strong');
        name.className = 'importcj-danmaku-prize-name';
        name.textContent = '等待奖项';
        var count = doc.createElement('span');
        count.className = 'importcj-danmaku-prize-count';
        count.textContent = '剩余名额 ';
        var countValue = doc.createElement('strong');
        countValue.className = 'importcj-danmaku-prize-count-value';
        countValue.textContent = '-';
        count.appendChild(countValue);
        panel.appendChild(kicker);
        panel.appendChild(imageWrap);
        panel.appendChild(name);
        panel.appendChild(count);
        panel._imageWrap = imageWrap;
        panel._image = image;
        panel._name = name;
        panel._count = countValue;
        return panel;
    };

    DanmakuStage.prototype.createResultPanel = function (doc) {
        var panel = doc.createElement('section');
        panel.className = 'importcj-danmaku-result';
        var kicker = doc.createElement('span');
        kicker.className = 'importcj-danmaku-result-kicker';
        kicker.textContent = 'RESULT · 中奖揭晓';
        var list = doc.createElement('div');
        list.className = 'importcj-danmaku-result-list';
        panel.appendChild(kicker);
        panel.appendChild(list);
        return panel;
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

    DanmakuStage.prototype.updateCandidates = function (values) {
        var self = this;
        this.candidates = (values || []).map(normalizeCandidate).filter(function (candidate) {
            return candidate.name !== '';
        });
        if (!this.candidates.length) {
            this.clearItems();
            if (this.focus) this.focus.textContent = '等待导入名单';
            return;
        }
        if (this.state !== 'drawing' && this.focus) this.focus.textContent = '名单已就绪';
        if (this.reducedMotion && this.field) {
            this.clearItems();
            this.candidates.slice(0, Math.min(12, this.candidates.length)).forEach(function () {
                self.spawnItem(true);
            });
        }
    };

    DanmakuStage.prototype.setState = function (state) {
        this.state = state === 'drawing' ? 'drawing' : (state === 'result' ? 'result' : 'ready');
        if (!this.stage) return;
        this.stage.setAttribute('data-state', this.state);
        if (this.focus) {
            this.focus.textContent = this.state === 'drawing' ? '正在锁定候选' : (this.candidates.length ? '名单已就绪' : '等待导入名单');
        }
        if (this.reducedMotion) return;
        if (this.state === 'drawing') {
            this.startLoop();
        }
    };

    DanmakuStage.prototype.setDrawing = function (drawing) {
        if (drawing) {
            if (this.stage) this.stage.classList.remove('is-result');
            this.startSpawn();
            this.setState('drawing');
        } else {
            this.setState('ready');
        }
    };

    DanmakuStage.prototype.updatePrize = function (prize) {
        if (!this.prizePanel) return;
        prize = prize || {};
        this.prizePanel._name.textContent = asText(prize.prizename || prize.roundtitle || prize.awardname) || '等待奖项';
        this.prizePanel._count.textContent = asText(prize.prizenum || prize.num || prize.remaining || '-');
        var imageUrl = safeImageUrl(prize.prizeimg || prize.image);
        this.prizePanel._imageWrap.classList.toggle('is-missing', !imageUrl);
        if (imageUrl) {
            this.prizePanel._image.src = imageUrl;
        } else {
            this.prizePanel._image.removeAttribute('src');
        }
    };

    DanmakuStage.prototype.setResult = function (values, prize) {
        this.updatePrize(prize || {});
        this.setState('result');
        if (this.stage) this.stage.classList.add('is-result');
        if (this.spawnTimer) window.clearInterval(this.spawnTimer);
        this.spawnTimer = null;
        this.clearItems();
        if (this.resultList) {
            this.resultList.textContent = '';
            var winners = this.flattenWinners(values || []);
            var doc = this.resultList.ownerDocument || document;
            if (!winners.length) {
                var empty = doc.createElement('span');
                empty.className = 'importcj-danmaku-result-empty';
                empty.textContent = '暂无中奖记录';
                this.resultList.appendChild(empty);
            } else {
                winners.forEach(function (winner) {
                    var card = doc.createElement('div');
                    card.className = 'importcj-danmaku-result-card';
                    var name = doc.createElement('strong');
                    name.textContent = winner.name;
                    card.appendChild(name);
                    winner.extras.forEach(function (extra) {
                        var extraNode = doc.createElement('small');
                        extraNode.textContent = extra;
                        card.appendChild(extraNode);
                    });
                    this.resultList.appendChild(card);
                }, this);
            }
        }
    };

    DanmakuStage.prototype.flattenWinners = function (values) {
        var winners = [];
        values.forEach(function (value) {
            if (value && value.luckers && value.luckers.length) {
                value.luckers.forEach(function (lucker) { winners.push(normalizeCandidate(lucker)); });
            } else {
                winners.push(normalizeCandidate(value));
            }
        });
        return winners.filter(function (winner) { return winner.name !== ''; });
    };

    DanmakuStage.prototype.setReady = function (values) {
        if (this.stage) this.stage.classList.remove('is-result', 'has-winner');
        this.setState('ready');
        this.updateCandidates(values || []);
        this.startSpawn();
        this.startLoop();
    };

    DanmakuStage.prototype.showWinners = function (values) {
        if (!this.focus || !values || !values.length) return;
        var names = values.map(normalizeCandidate).map(function (candidate) { return candidate.name; }).filter(Boolean).slice(0, 3);
        if (!names.length) return;
        this.focus.textContent = names.join(' · ');
        this.stage && this.stage.classList.add('has-winner');
        var self = this;
        window.setTimeout(function () {
            if (!self.stage || self.state === 'drawing') return;
            self.stage.classList.remove('has-winner');
            if (self.focus) self.focus.textContent = self.candidates.length ? '名单已就绪' : '等待导入名单';
        }, 1400);
    };

    DanmakuStage.prototype.startSpawn = function () {
        var self = this;
        if (this.spawnTimer) window.clearInterval(this.spawnTimer);
        if (this.reducedMotion) return;
        this.spawnTimer = window.setInterval(function () {
            if (self.paused || document.hidden || !self.candidates.length || self.items.length >= MAX_ITEMS) return;
            self.spawnItem(false);
        }, 420);
    };

    DanmakuStage.prototype.pickCandidate = function () {
        return this.candidates[randomInt(0, this.candidates.length - 1)] || null;
    };

    DanmakuStage.prototype.spawnItem = function (staticItem) {
        if (!this.field || !this.candidates.length) return;
        var doc = this.field.ownerDocument || document;
        var candidate = this.pickCandidate();
        if (!candidate) return;

        var item = doc.createElement('span');
        item.className = 'importcj-danmaku-item';
        var color = COLORS[randomInt(0, COLORS.length - 1)];
        item.style.setProperty('--danmaku-color-start', color[0]);
        item.style.setProperty('--danmaku-color-end', color[1]);

        var avatar = doc.createElement('i');
        avatar.className = 'importcj-danmaku-avatar';
        avatar.textContent = candidate.name.charAt(0);
        var content = doc.createElement('span');
        content.className = 'importcj-danmaku-content';
        var name = doc.createElement('strong');
        name.className = 'importcj-danmaku-name';
        name.textContent = candidate.name;
        content.appendChild(name);
        candidate.extras.forEach(function (extra) {
            var extraNode = doc.createElement('small');
            extraNode.className = 'importcj-danmaku-extra';
            extraNode.textContent = extra;
            content.appendChild(extraNode);
        });
        item.appendChild(avatar);
        item.appendChild(content);

        var lane = this.items.length % Math.max(1, this.getLaneCount());
        var width = this.root.clientWidth || window.innerWidth || 1920;
        var x = staticItem ? Math.round(width * (0.1 + ((this.items.length * 0.17) % 0.8))) : width + randomInt(20, 180);
        var top = this.getLaneTop(lane) + randomInt(-5, 5);
        item.style.top = top + 'px';
        item.style.transform = 'translate3d(' + x + 'px,0,0)';
        this.field.appendChild(item);
        var widthCache = item.offsetWidth;
        var entry = { element: item, x: x, width: widthCache, baseSpeed: 1.25 + Math.random() * 0.85, staticItem: staticItem };
        this.items.push(entry);
        if (staticItem) item.classList.add('is-static');
    };

    DanmakuStage.prototype.getLaneCount = function () {
        return Math.max(4, Math.min(LANE_COUNT, Math.floor((this.field ? this.field.clientHeight : 660) / this.laneHeight)));
    };

    DanmakuStage.prototype.getLaneTop = function (lane) {
        var count = this.getLaneCount();
        var height = this.field ? this.field.clientHeight : 660;
        var usable = Math.max(240, height - 80);
        return 40 + Math.round((usable / Math.max(1, count - 1)) * lane);
    };

    DanmakuStage.prototype.startLoop = function () {
        if (this.reducedMotion || this.paused || document.hidden || this.rafId !== null) return;
        this.rafId = window.requestAnimationFrame(this.tick.bind(this));
    };

    DanmakuStage.prototype.tick = function () {
        this.rafId = null;
        if (this.reducedMotion || this.paused || document.hidden) return;
        var multiplier = this.state === 'drawing' ? 2.15 : 1;
        for (var index = this.items.length - 1; index >= 0; index--) {
            var entry = this.items[index];
            if (!entry.staticItem) {
                entry.x -= entry.baseSpeed * multiplier;
                entry.element.style.transform = 'translate3d(' + entry.x + 'px,0,0)';
            }
            if (!entry.staticItem && entry.x < -entry.width - 120) {
                if (entry.element.parentNode) entry.element.parentNode.removeChild(entry.element);
                this.items.splice(index, 1);
            }
        }
        this.startLoop();
    };

    DanmakuStage.prototype.resize = function () {
        if (!this.stage || !this.root) return;
        var rect = this.root.getBoundingClientRect();
        var width = this.root.clientWidth || rect.width || 1920;
        var height = this.root.clientHeight || rect.height || 1080;
        var scale = Math.min(width / 1920, height / 1080);
        this.stage.style.setProperty('--danmaku-stage-scale', Math.max(scale, 0.1).toFixed(4));
    };

    DanmakuStage.prototype.handleVisibility = function () {
        this.paused = !!document.hidden;
        if (!this.paused) this.startLoop();
    };

    DanmakuStage.prototype.clearItems = function () {
        this.items.forEach(function (entry) {
            if (entry.element && entry.element.parentNode) entry.element.parentNode.removeChild(entry.element);
        });
        this.items = [];
    };

    DanmakuStage.prototype.destroy = function () {
        if (this.spawnTimer) window.clearInterval(this.spawnTimer);
        this.spawnTimer = null;
        if (this.rafId !== null && window.cancelAnimationFrame) window.cancelAnimationFrame(this.rafId);
        this.rafId = null;
        if (this.resizeObserver) this.resizeObserver.disconnect();
        this.resizeObserver = null;
        if (this.resizeBound && window.removeEventListener) window.removeEventListener('resize', this.boundResize);
        this.resizeBound = false;
        if (typeof document !== 'undefined' && document.removeEventListener) document.removeEventListener('visibilitychange', this.boundVisibility);
        this.clearItems();
        if (this.stage && this.stage.parentNode) this.stage.parentNode.removeChild(this.stage);
        this.stage = null;
        this.field = null;
        this.focus = null;
        this.prizePanel = null;
        this.resultPanel = null;
        this.resultList = null;
    };

    return {
        create: function (options) { return new DanmakuStage(options); },
        normalizeCandidate: normalizeCandidate
    };
});
