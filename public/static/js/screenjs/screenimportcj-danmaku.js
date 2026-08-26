/*
 * 弹幕星河导入名单抽奖主题运行态。
 * 该模块只负责舞台视觉流动与控制轨/功能组/记录抽屉 DOM 渲染，
 * 不参与抽奖排重、名额计算、数据请求与既有生命周期业务规则。
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

    var SPEED_PRESETS = {
        slow: { key: 'slow', label: '舒缓', factor: 0.6, interval: 620, desc: '平稳舒缓，适于观摩' },
        normal: { key: 'normal', label: '标准', factor: 1.0, interval: 420, desc: '均衡流畅，标准节奏' },
        fast: { key: 'fast', label: '热烈', factor: 1.6, interval: 300, desc: '极速穿梭，全场热烈' }
    };

    var SVG_ICONS = {
        prev: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
        next: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
        chevronDown: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
        play: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>',
        stop: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" ry="2"></rect></svg>',
        refresh: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
        speed: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg>',
        records: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 4h12v7a6 6 0 0 1-12 0V4z"></path></svg>',
        close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    };

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
        this.callbacks = options.callbacks || {};
        this.prizes = options.prizes || [];
        this.prizeIndex = options.prizeIndex || 0;
        this.currentPrize = options.prize || null;
        this.maxDrawCount = parseInt(options.maxDrawCount || 999, 10) || 999;
        var initialDrawCount = parseInt(options.drawCount || options.onceout || 1, 10) || 1;
        if (initialDrawCount > this.maxDrawCount) initialDrawCount = this.maxDrawCount;
        if (initialDrawCount < 1) initialDrawCount = 1;
        this.drawCount = initialDrawCount;
        this.speedPreset = options.speedPreset || 'normal';
        if (!SPEED_PRESETS[this.speedPreset]) this.speedPreset = 'normal';
        this.speedFactor = (SPEED_PRESETS[this.speedPreset] || SPEED_PRESETS.normal).factor;

        this.stage = null;
        this.field = null;
        this.focus = null;
        this.prizePanel = null;
        this.resultPanel = null;
        this.resultList = null;
        this.floatingBar = null;
        this.btnPrimary = null;
        this.btnPrimaryIcon = null;
        this.btnPrimaryText = null;
        this.btnSpeed = null;
        this.btnSpeedText = null;
        this.btnRecords = null;
        this.btnPrev = null;
        this.btnNext = null;
        this.btnPrizeSelect = null;
        this.btnDec = null;
        this.btnInc = null;
        this.speedPopover = null;
        this.prizeDropdown = null;
        this.prizeDropdownList = null;
        this.stepperInput = null;
        this.recordsDrawer = null;
        this.recordsTotalCount = null;
        this.recordsLoadingState = null;
        this.recordsErrorState = null;
        this.recordsErrorMsg = null;
        this.recordsEmptyState = null;
        this.recordsListWrap = null;

        this.candidates = [];
        this.items = [];
        this.state = 'ready';
        this.spawnTimer = null;
        this.focusTimer = null;
        this.transitionFallbackTimer = null;
        this.focusIndex = 0;
        this.rafId = null;
        this.resizeObserver = null;
        this.resizeBound = false;
        this.boundResize = this.resize.bind(this);
        this.boundVisibility = this.handleVisibility.bind(this);
        this.boundDocClick = this.handleDocumentClick.bind(this);
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.reducedMotion = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
        this.paused = false;
        this.laneHeight = 76;
        this.laneIndex = 0;
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

        var field = doc.createElement('div');
        field.className = 'importcj-danmaku-field';
        field.setAttribute('aria-hidden', 'true');

        var prizePanel = this.createPrizePanel(doc);
        var resultPanel = this.createResultPanel(doc);

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

        var floatingBar = this.createFloatingDock(doc);
        var speedPopover = this.createSpeedPopover(doc);
        var recordsDrawer = this.createRecordsDrawer(doc);

        stage.appendChild(field);
        stage.appendChild(prizePanel);
        stage.appendChild(resultPanel);
        stage.appendChild(focus);
        stage.appendChild(floatingBar);
        stage.appendChild(speedPopover);
        stage.appendChild(recordsDrawer);

        this.root.appendChild(stage);
        this.stage = stage;
        this.field = field;
        this.focus = focusValue;
        this.prizePanel = prizePanel;
        this.resultPanel = resultPanel;
        this.resultList = resultPanel.querySelector('.importcj-danmaku-result-list');
        this.floatingBar = floatingBar;
        this.speedPopover = speedPopover;
        this.recordsDrawer = recordsDrawer;
    };

    DanmakuStage.prototype.createPrizePanel = function (doc) {
        var panel = doc.createElement('section');
        panel.className = 'importcj-danmaku-prize';
        panel.setAttribute('aria-label', '当前抽奖奖品展示');

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

        var controlsWrap = doc.createElement('div');
        controlsWrap.className = 'importcj-danmaku-prize-controls';

        var track = doc.createElement('div');
        track.className = 'importcj-danmaku-prize-track';
        track.setAttribute('role', 'group');
        track.setAttribute('aria-label', '奖品切换控制轨');

        var btnPrev = doc.createElement('button');
        btnPrev.type = 'button';
        btnPrev.className = 'importcj-danmaku-track-btn is-prev';
        btnPrev.setAttribute('aria-label', '上一奖品');
        btnPrev.title = '上一奖品';
        btnPrev.innerHTML = SVG_ICONS.prev;

        var btnCurrent = doc.createElement('button');
        btnCurrent.type = 'button';
        btnCurrent.className = 'importcj-danmaku-prize-select-btn';
        btnCurrent.setAttribute('aria-haspopup', 'listbox');
        btnCurrent.setAttribute('aria-expanded', 'false');
        btnCurrent.setAttribute('aria-label', '奖品选择下拉菜单');
        btnCurrent.title = '点击查看奖品列表';

        var currentText = doc.createElement('span');
        currentText.className = 'importcj-danmaku-prize-select-text';
        currentText.textContent = '等待奖项';

        var currentIcon = doc.createElement('span');
        currentIcon.innerHTML = SVG_ICONS.chevronDown;
        btnCurrent.appendChild(currentText);
        btnCurrent.appendChild(currentIcon);

        var btnNext = doc.createElement('button');
        btnNext.type = 'button';
        btnNext.className = 'importcj-danmaku-track-btn is-next';
        btnNext.setAttribute('aria-label', '下一奖品');
        btnNext.title = '下一奖品';
        btnNext.innerHTML = SVG_ICONS.next;

        track.appendChild(btnPrev);
        track.appendChild(btnCurrent);
        track.appendChild(btnNext);

        var stepper = doc.createElement('div');
        stepper.className = 'importcj-danmaku-stepper';
        stepper.setAttribute('role', 'group');
        stepper.setAttribute('aria-label', '单次抽取人数设置');

        var stepperLabel = doc.createElement('span');
        stepperLabel.className = 'importcj-danmaku-stepper-label';
        stepperLabel.textContent = '单次抽取';

        var stepperWrap = doc.createElement('div');
        stepperWrap.className = 'importcj-danmaku-stepper-wrap';

        var btnDec = doc.createElement('button');
        btnDec.type = 'button';
        btnDec.className = 'importcj-danmaku-stepper-btn is-dec';
        btnDec.setAttribute('aria-label', '减少抽取人数');
        btnDec.textContent = '-';

        var stepperInput = doc.createElement('input');
        stepperInput.type = 'text';
        stepperInput.className = 'importcj-danmaku-stepper-input';
        stepperInput.value = String(this.drawCount || 1);
        stepperInput.setAttribute('inputmode', 'numeric');
        stepperInput.setAttribute('aria-label', '单次抽取人数输入');

        var btnInc = doc.createElement('button');
        btnInc.type = 'button';
        btnInc.className = 'importcj-danmaku-stepper-btn is-inc';
        btnInc.setAttribute('aria-label', '增加抽取人数');
        btnInc.textContent = '+';

        stepperWrap.appendChild(btnDec);
        stepperWrap.appendChild(stepperInput);
        stepperWrap.appendChild(btnInc);

        var stepperUnit = doc.createElement('span');
        stepperUnit.className = 'importcj-danmaku-stepper-unit';
        stepperUnit.textContent = '人';

        stepper.appendChild(stepperLabel);
        stepper.appendChild(stepperWrap);
        stepper.appendChild(stepperUnit);

        var dropdown = doc.createElement('div');
        dropdown.className = 'importcj-danmaku-prize-dropdown';
        dropdown.setAttribute('role', 'listbox');
        dropdown.setAttribute('aria-label', '奖品切换列表');

        var dropdownList = doc.createElement('div');
        dropdownList.className = 'importcj-danmaku-prize-dropdown-list';
        dropdown.appendChild(dropdownList);

        controlsWrap.appendChild(track);
        controlsWrap.appendChild(stepper);
        controlsWrap.appendChild(dropdown);

        panel.appendChild(kicker);
        panel.appendChild(imageWrap);
        panel.appendChild(name);
        panel.appendChild(count);
        panel.appendChild(controlsWrap);

        panel._kicker = kicker;
        panel._imageWrap = imageWrap;
        panel._image = image;
        panel._name = name;
        panel._count = countValue;
        panel._selectBtn = btnCurrent;
        panel._selectText = currentText;
        panel._btnPrev = btnPrev;
        panel._btnNext = btnNext;
        panel._btnDec = btnDec;
        panel._btnInc = btnInc;
        panel._input = stepperInput;
        panel._dropdown = dropdown;
        panel._dropdownList = dropdownList;

        this.btnPrev = btnPrev;
        this.btnNext = btnNext;
        this.btnPrizeSelect = btnCurrent;
        this.btnDec = btnDec;
        this.btnInc = btnInc;
        this.stepperInput = stepperInput;
        this.prizeDropdown = dropdown;
        this.prizeDropdownList = dropdownList;

        var self = this;
        btnPrev.addEventListener('click', function (e) {
            e.stopPropagation();
            if (self.state !== 'ready' || btnPrev.disabled) return;
            self.triggerCallback('onPrizePrev');
        });

        btnNext.addEventListener('click', function (e) {
            e.stopPropagation();
            if (self.state !== 'ready' || btnNext.disabled) return;
            self.triggerCallback('onPrizeNext');
        });

        btnCurrent.addEventListener('click', function (e) {
            e.stopPropagation();
            if (self.state !== 'ready' || btnCurrent.disabled) return;
            self.togglePrizeDropdown();
        });

        btnDec.addEventListener('click', function (e) {
            e.stopPropagation();
            if (self.state !== 'ready' || btnDec.disabled) return;
            self.setDrawCount(self.drawCount - 1, true);
        });

        btnInc.addEventListener('click', function (e) {
            e.stopPropagation();
            if (self.state !== 'ready' || btnInc.disabled) return;
            self.setDrawCount(self.drawCount + 1, true);
        });

        stepperInput.addEventListener('input', function () {
            if (self.state !== 'ready' || stepperInput.disabled) return;
            var raw = this.value.replace(/\D/g, '');
            this.value = raw;
        });

        stepperInput.addEventListener('change', function () {
            if (self.state !== 'ready' || stepperInput.disabled) return;
            var val = parseInt(this.value, 10);
            self.setDrawCount(isNaN(val) ? 1 : val, true);
        });

        stepperInput.addEventListener('blur', function () {
            if (self.state !== 'ready' || stepperInput.disabled) return;
            var val = parseInt(this.value, 10);
            self.setDrawCount(isNaN(val) ? 1 : val, true);
        });

        stepperInput.addEventListener('keydown', function (e) {
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.stopPropagation();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                var val = parseInt(this.value, 10);
                self.setDrawCount(isNaN(val) ? 1 : val, true);
                this.blur();
            }
        });

        return panel;
    };

    DanmakuStage.prototype.createResultPanel = function (doc) {
        var panel = doc.createElement('section');
        panel.className = 'importcj-danmaku-result';
        panel.setAttribute('aria-label', '中奖揭晓结果');

        var kicker = doc.createElement('span');
        kicker.className = 'importcj-danmaku-result-kicker';
        kicker.textContent = 'RESULT · 中奖揭晓';

        var summary = doc.createElement('div');
        summary.className = 'importcj-danmaku-result-summary';
        var summaryImageWrap = doc.createElement('div');
        summaryImageWrap.className = 'importcj-danmaku-result-prize-image is-missing';
        var summaryImage = doc.createElement('img');
        summaryImage.alt = '礼品图片';
        summaryImageWrap.appendChild(summaryImage);
        var summaryTitle = doc.createElement('strong');
        summaryTitle.className = 'importcj-danmaku-result-prize-title';
        summaryTitle.textContent = '';
        var summaryCount = doc.createElement('span');
        summaryCount.className = 'importcj-danmaku-result-prize-count';
        summaryCount.textContent = '剩余 ';
        var summaryCountValue = doc.createElement('strong');
        summaryCountValue.className = 'importcj-danmaku-result-prize-count-value';
        summaryCountValue.textContent = '-';
        summaryCount.appendChild(summaryCountValue);

        summary.appendChild(summaryImageWrap);
        summary.appendChild(summaryTitle);
        summary.appendChild(summaryCount);

        var list = doc.createElement('div');
        list.className = 'importcj-danmaku-result-list';
        panel.appendChild(kicker);
        panel.appendChild(summary);
        panel.appendChild(list);

        panel._summary = summary;
        panel._imageWrap = summaryImageWrap;
        panel._image = summaryImage;
        panel._title = summaryTitle;
        panel._count = summaryCountValue;
        return panel;
    };

    DanmakuStage.prototype.createFloatingDock = function (doc) {
        var dock = doc.createElement('div');
        dock.className = 'importcj-danmaku-floating-bar';
        dock.setAttribute('role', 'toolbar');
        dock.setAttribute('aria-label', '舞台功能控制组');

        var btnPrimary = doc.createElement('button');
        btnPrimary.type = 'button';
        btnPrimary.className = 'importcj-danmaku-dock-btn is-primary state-ready';
        btnPrimary.setAttribute('aria-label', '开始抽奖');

        var btnPrimaryIcon = doc.createElement('span');
        btnPrimaryIcon.innerHTML = SVG_ICONS.play;
        var btnPrimaryText = doc.createElement('span');
        btnPrimaryText.textContent = '开始抽奖';
        btnPrimary.appendChild(btnPrimaryIcon);
        btnPrimary.appendChild(btnPrimaryText);

        var divider = doc.createElement('div');
        divider.className = 'importcj-danmaku-dock-divider';
        divider.setAttribute('aria-hidden', 'true');

        var group = doc.createElement('div');
        group.className = 'importcj-danmaku-dock-group';

        var btnSpeed = doc.createElement('button');
        btnSpeed.type = 'button';
        btnSpeed.className = 'importcj-danmaku-dock-btn is-speed';
        btnSpeed.setAttribute('aria-haspopup', 'menu');
        btnSpeed.setAttribute('aria-expanded', 'false');
        btnSpeed.setAttribute('aria-label', '调节弹幕速度');
        btnSpeed.title = '调节弹幕速度';

        var btnSpeedIcon = doc.createElement('span');
        btnSpeedIcon.innerHTML = SVG_ICONS.speed;
        var btnSpeedText = doc.createElement('span');
        btnSpeedText.textContent = '速度: ' + (SPEED_PRESETS[this.speedPreset] || SPEED_PRESETS.normal).label;
        btnSpeed.appendChild(btnSpeedIcon);
        btnSpeed.appendChild(btnSpeedText);

        var btnRecords = doc.createElement('button');
        btnRecords.type = 'button';
        btnRecords.className = 'importcj-danmaku-dock-btn is-records';
        btnRecords.setAttribute('aria-label', '查看中奖记录');
        btnRecords.title = '查看中奖记录';

        var btnRecordsIcon = doc.createElement('span');
        btnRecordsIcon.innerHTML = SVG_ICONS.records;
        var btnRecordsText = doc.createElement('span');
        btnRecordsText.textContent = '中奖记录';
        btnRecords.appendChild(btnRecordsIcon);
        btnRecords.appendChild(btnRecordsText);

        group.appendChild(btnSpeed);
        group.appendChild(btnRecords);

        dock.appendChild(btnPrimary);
        dock.appendChild(divider);
        dock.appendChild(group);

        this.btnPrimary = btnPrimary;
        this.btnPrimaryIcon = btnPrimaryIcon;
        this.btnPrimaryText = btnPrimaryText;
        this.btnSpeed = btnSpeed;
        this.btnSpeedText = btnSpeedText;
        this.btnRecords = btnRecords;

        var self = this;
        btnPrimary.addEventListener('click', function (e) {
            e.stopPropagation();
            if (btnPrimary.disabled) return;
            self.triggerCallback('onPrimaryAction');
        });

        btnPrimary.addEventListener('keydown', function (e) {
            if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
            e.preventDefault();
            e.stopPropagation();
            if (!btnPrimary.disabled) self.triggerCallback('onPrimaryAction');
        });

        btnSpeed.addEventListener('click', function (e) {
            e.stopPropagation();
            if (self.state !== 'ready' || btnSpeed.disabled) return;
            self.toggleSpeedPopover();
        });

        btnRecords.addEventListener('click', function (e) {
            e.stopPropagation();
            if (btnRecords.disabled) return;
            self.openRecords();
            self.triggerCallback('onRecords');
        });

        return dock;
    };

    DanmakuStage.prototype.createSpeedPopover = function (doc) {
        var popover = doc.createElement('div');
        popover.className = 'importcj-danmaku-speed-popover';
        popover.setAttribute('role', 'menu');
        popover.setAttribute('aria-label', '弹幕速度选择');

        var title = doc.createElement('div');
        title.className = 'importcj-danmaku-speed-popover-title';
        title.textContent = '弹幕流动速度';
        popover.appendChild(title);

        var optionsWrap = doc.createElement('div');
        optionsWrap.className = 'importcj-danmaku-speed-options';

        var self = this;
        ['slow', 'normal', 'fast'].forEach(function (key) {
            var item = SPEED_PRESETS[key];
            var btn = doc.createElement('button');
            btn.type = 'button';
            btn.className = 'importcj-danmaku-speed-opt' + (self.speedPreset === key ? ' is-active' : '');
            btn.setAttribute('role', 'menuitemradio');
            btn.setAttribute('aria-checked', self.speedPreset === key ? 'true' : 'false');
            btn.setAttribute('data-speed', key);

            var main = doc.createElement('div');
            var name = doc.createElement('strong');
            name.className = 'importcj-danmaku-speed-opt-name';
            name.textContent = item.label;
            var desc = doc.createElement('span');
            desc.className = 'importcj-danmaku-speed-opt-desc';
            desc.textContent = item.desc;
            main.appendChild(name);
            main.appendChild(desc);

            var check = doc.createElement('span');
            check.className = 'importcj-danmaku-speed-opt-check';
            check.innerHTML = SVG_ICONS.check;

            btn.appendChild(main);
            btn.appendChild(check);

            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (self.state !== 'ready' || btn.disabled) return;
                self.setSpeedPreset(key);
                self.closeSpeedPopover();
                self.triggerCallback('onSpeedChange', key, item.factor);
            });

            optionsWrap.appendChild(btn);
        });

        popover.appendChild(optionsWrap);
        return popover;
    };

    DanmakuStage.prototype.createRecordsDrawer = function (doc) {
        var drawer = doc.createElement('aside');
        drawer.className = 'importcj-danmaku-drawer';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-label', '中奖记录抽屉');

        var backdrop = doc.createElement('div');
        backdrop.className = 'importcj-danmaku-drawer-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');

        var panel = doc.createElement('div');
        panel.className = 'importcj-danmaku-drawer-panel';

        var header = doc.createElement('header');
        header.className = 'importcj-danmaku-drawer-header';

        var titleWrap = doc.createElement('div');
        var kicker = doc.createElement('span');
        kicker.className = 'importcj-danmaku-drawer-kicker';
        kicker.textContent = 'WINNERS RECORD';
        var title = doc.createElement('h3');
        title.className = 'importcj-danmaku-drawer-title';
        title.textContent = '中奖记录';
        titleWrap.appendChild(kicker);
        titleWrap.appendChild(title);

        var meta = doc.createElement('div');
        meta.className = 'importcj-danmaku-drawer-meta';
        var badge = doc.createElement('span');
        badge.className = 'importcj-danmaku-drawer-badge';
        badge.textContent = '共 ';
        var totalCount = doc.createElement('strong');
        totalCount.textContent = '0';
        badge.appendChild(totalCount);
        badge.appendChild(doc.createTextNode(' 人'));

        var closeBtn = doc.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'importcj-danmaku-drawer-close';
        closeBtn.setAttribute('aria-label', '关闭中奖记录抽屉');
        closeBtn.title = '关闭';
        closeBtn.innerHTML = SVG_ICONS.close;

        meta.appendChild(badge);
        meta.appendChild(closeBtn);
        header.appendChild(titleWrap);
        header.appendChild(meta);

        var content = doc.createElement('div');
        content.className = 'importcj-danmaku-drawer-content';

        var loadingState = doc.createElement('div');
        loadingState.className = 'importcj-danmaku-drawer-state is-loading';
        loadingState.style.display = 'none';
        var spinner = doc.createElement('div');
        spinner.className = 'importcj-danmaku-drawer-spinner';
        var loadingText = doc.createElement('p');
        loadingText.textContent = '正在加载中奖记录...';
        loadingState.appendChild(spinner);
        loadingState.appendChild(loadingText);

        var errorState = doc.createElement('div');
        errorState.className = 'importcj-danmaku-drawer-state is-error';
        errorState.style.display = 'none';
        var errorIcon = doc.createElement('div');
        errorIcon.className = 'importcj-danmaku-drawer-error-icon';
        errorIcon.textContent = '!';
        var errorMsg = doc.createElement('p');
        errorMsg.textContent = '中奖记录加载失败';
        var retryBtn = doc.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'importcj-danmaku-drawer-retry-btn';
        retryBtn.setAttribute('aria-label', '重新加载中奖记录');
        retryBtn.textContent = '重新加载';
        errorState.appendChild(errorIcon);
        errorState.appendChild(errorMsg);
        errorState.appendChild(retryBtn);

        var emptyState = doc.createElement('div');
        emptyState.className = 'importcj-danmaku-drawer-state is-empty';
        emptyState.style.display = 'none';
        var emptyIcon = doc.createElement('div');
        emptyIcon.className = 'importcj-danmaku-drawer-empty-icon';
        emptyIcon.textContent = '🏆';
        var emptyText = doc.createElement('p');
        emptyText.textContent = '暂无中奖记录';
        emptyState.appendChild(emptyIcon);
        emptyState.appendChild(emptyText);

        var listWrap = doc.createElement('div');
        listWrap.className = 'importcj-danmaku-drawer-list';

        content.appendChild(loadingState);
        content.appendChild(errorState);
        content.appendChild(emptyState);
        content.appendChild(listWrap);

        panel.appendChild(header);
        panel.appendChild(content);
        drawer.appendChild(backdrop);
        drawer.appendChild(panel);

        this.recordsTotalCount = totalCount;
        this.recordsLoadingState = loadingState;
        this.recordsErrorState = errorState;
        this.recordsErrorMsg = errorMsg;
        this.recordsEmptyState = emptyState;
        this.recordsListWrap = listWrap;

        var self = this;
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            self.closeRecords();
            self.triggerCallback('onRecordsClose');
        });

        backdrop.addEventListener('click', function (e) {
            e.stopPropagation();
            self.closeRecords();
            self.triggerCallback('onRecordsClose');
        });

        retryBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var handled = self.triggerCallback('onRecordsRetry');
            if (handled === undefined) {
                self.triggerCallback('onRecords');
            }
        });

        return drawer;
    };

    DanmakuStage.prototype.createWinnerCard = function (doc, winner, serialNum) {
        var card = doc.createElement('div');
        card.className = 'importcj-danmaku-drawer-card';

        var num = doc.createElement('span');
        num.className = 'importcj-danmaku-drawer-card-num';
        num.textContent = String(serialNum);
        card.appendChild(num);

        var info = doc.createElement('div');
        info.className = 'importcj-danmaku-drawer-card-info';
        var name = doc.createElement('strong');
        name.className = 'importcj-danmaku-drawer-card-name';
        name.textContent = winner.name;
        info.appendChild(name);

        if (winner.extras && winner.extras.length) {
            var extrasWrap = doc.createElement('div');
            extrasWrap.className = 'importcj-danmaku-drawer-card-extras';
            winner.extras.forEach(function (extra) {
                var chip = doc.createElement('span');
                chip.className = 'importcj-danmaku-drawer-card-chip';
                chip.textContent = extra;
                extrasWrap.appendChild(chip);
            });
            info.appendChild(extrasWrap);
        }
        card.appendChild(info);
        return card;
    };

    DanmakuStage.prototype.bindLifecycle = function () {
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('resize', this.boundResize);
            this.resizeBound = true;
        }
        if (typeof document !== 'undefined' && document.addEventListener) {
            document.addEventListener('visibilitychange', this.boundVisibility);
            document.addEventListener('click', this.boundDocClick);
            document.addEventListener('keydown', this.boundKeyDown);
        }
        if (typeof window !== 'undefined' && window.ResizeObserver && this.root) {
            this.resizeObserver = new window.ResizeObserver(this.boundResize);
            this.resizeObserver.observe(this.root);
        }
    };

    DanmakuStage.prototype.bindImage = function (wrap, img, url) {
        if (!wrap || !img) return;
        if (url) {
            img.onerror = function () {
                wrap.classList.add('is-missing');
            };
            img.onload = function () {
                wrap.classList.remove('is-missing');
            };
            img.src = url;
            wrap.classList.remove('is-missing');
        } else {
            img.onerror = null;
            img.onload = null;
            img.removeAttribute('src');
            wrap.classList.add('is-missing');
        }
    };

    DanmakuStage.prototype.startFocusRoll = function () {
        this.stopFocusRoll();
        if (!this.focus || !this.candidates.length) return;
        var candidate = this.candidates[this.focusIndex % this.candidates.length];
        this.focus.textContent = candidate ? candidate.name : '';
        var self = this;
        this.focusTimer = window.setInterval(function () {
            if (!self.candidates.length || !self.focus) return;
            self.focusIndex = (self.focusIndex + 1) % self.candidates.length;
            var item = self.candidates[self.focusIndex];
            self.focus.textContent = item ? item.name : '';
        }, 70);
    };

    DanmakuStage.prototype.stopFocusRoll = function () {
        if (this.focusTimer) {
            window.clearInterval(this.focusTimer);
            this.focusTimer = null;
        }
    };

    DanmakuStage.prototype.updateCandidates = function (values) {
        var self = this;
        this.candidates = (values || []).map(normalizeCandidate).filter(function (candidate) {
            return candidate.name !== '';
        });
        if (!this.candidates.length) {
            this.clearItems();
            this.stopFocusRoll();
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

    DanmakuStage.prototype.updateControlGates = function () {
        var isReady = (this.state === 'ready');
        var isRecords = (this.state === 'records');
        var isResult = (this.state === 'result');
        var isBusy = (this.state === 'requesting' || this.state === 'starting');

        if (this.btnPrev) this.btnPrev.disabled = !isReady;
        if (this.btnNext) this.btnNext.disabled = !isReady;
        if (this.btnPrizeSelect) this.btnPrizeSelect.disabled = !isReady;
        if (this.btnDec) this.btnDec.disabled = !isReady;
        if (this.btnInc) this.btnInc.disabled = !isReady;
        if (this.stepperInput) this.stepperInput.disabled = !isReady;
        if (this.btnSpeed) this.btnSpeed.disabled = !isReady;

        if (this.btnRecords) {
            this.btnRecords.disabled = (!isReady && !isResult) || isRecords || isBusy;
        }

        if (!isReady) {
            this.closePrizeDropdown();
            this.closeSpeedPopover();
        }
    };

    DanmakuStage.prototype.setState = function (state) {
        this.state = state === 'drawing' ? 'drawing' : (state === 'result' ? 'result' : (state === 'records' ? 'records' : (state === 'requesting' ? 'requesting' : (state === 'starting' ? 'starting' : 'ready'))));
        if (!this.stage) return;
        if (this.transitionFallbackTimer) {
            window.clearTimeout(this.transitionFallbackTimer);
            this.transitionFallbackTimer = null;
        }
        this.stage.classList.remove('is-settled');
        void this.stage.offsetWidth;
        if (this.state === 'result') {
            this.stage.classList.add('is-result');
        } else {
            this.stage.classList.remove('is-result');
        }
        this.stage.setAttribute('data-state', this.state);
        if (this.reducedMotion) {
            this.stage.classList.add('is-settled');
        } else {
            var self = this;
            this.transitionFallbackTimer = window.setTimeout(function () {
                self.transitionFallbackTimer = null;
                if (self.stage) {
                    self.stage.classList.add('is-settled');
                }
            }, 420);
        }
        if (this.focus && this.state !== 'drawing') {
            this.focus.textContent = this.candidates.length ? '名单已就绪' : '等待导入名单';
        }

        this.updateDockPrimaryUI();
        this.updateControlGates();

        if (this.state === 'records') {
            this.openRecords();
        }

        if (this.reducedMotion) return;
        if (this.state === 'drawing') {
            this.startLoop();
        }
    };

    DanmakuStage.prototype.setDrawing = function (drawing) {
        if (drawing) {
            this.startSpawn();
            this.startFocusRoll();
            this.setState('drawing');
        } else {
            this.stopFocusRoll();
            this.setState('ready');
        }
    };

    DanmakuStage.prototype.updatePrize = function (prize, prizes, prizeIndex) {
        prize = prize || {};
        this.currentPrize = prize;
        if (prizes !== undefined) {
            this.prizes = prizes || [];
        }
        if (prizeIndex !== undefined) {
            this.prizeIndex = prizeIndex;
        }
        var awardName = asText(prize.awardname || prize.roundtitle || '');
        var prizeName = asText(prize.prizename || '');
        var displayName = prizeName || awardName || '等待奖项';
        var selectName = awardName || displayName;
        var fullTitle = (awardName && prizeName && awardName !== prizeName) ? (awardName + ' · ' + prizeName) : displayName;
        var kickerText = awardName ? ('CURRENT PRIZE · ' + awardName) : 'CURRENT PRIZE · 准备抽取';

        var remainingText = (prize.remaining !== undefined && prize.remaining !== null) ? asText(prize.remaining) : '';
        var countText = remainingText !== '' ? remainingText : '—';
        var imageUrl = safeImageUrl(prize.prizeimg || prize.image);

        if (this.prizePanel) {
            if (this.prizePanel._kicker) this.prizePanel._kicker.textContent = kickerText;
            if (this.prizePanel._name) this.prizePanel._name.textContent = displayName;
            if (this.prizePanel._count) this.prizePanel._count.textContent = countText;
            if (this.prizePanel._selectText) this.prizePanel._selectText.textContent = selectName;
            if (this.prizePanel._image && this.prizePanel._imageWrap) {
                this.bindImage(this.prizePanel._imageWrap, this.prizePanel._image, imageUrl);
            }
        }

        if (this.resultPanel) {
            if (this.resultPanel._title) this.resultPanel._title.textContent = fullTitle;
            if (this.resultPanel._count) this.resultPanel._count.textContent = countText;
            if (this.resultPanel._image && this.resultPanel._imageWrap) {
                this.bindImage(this.resultPanel._imageWrap, this.resultPanel._image, imageUrl);
            }
        }

        this.renderPrizeDropdown();
    };

    DanmakuStage.prototype.renderPrizeDropdown = function () {
        if (!this.prizeDropdownList) return;
        this.prizeDropdownList.textContent = '';
        var list = this.prizes && this.prizes.length ? this.prizes : (this.currentPrize ? [this.currentPrize] : []);
        var doc = this.prizeDropdownList.ownerDocument || document;
        var self = this;
        if (!list.length) {
            var empty = doc.createElement('div');
            empty.className = 'importcj-danmaku-prize-dropdown-empty';
            empty.textContent = '暂无奖品列表';
            this.prizeDropdownList.appendChild(empty);
            return;
        }

        list.forEach(function (p, idx) {
            var item = doc.createElement('button');
            item.type = 'button';
            item.className = 'importcj-danmaku-prize-dropdown-item';
            if (self.prizeIndex === idx || (p.id && self.currentPrize && p.id === self.currentPrize.id)) {
                item.classList.add('is-active');
            }
            var pAward = asText(p.awardname || p.roundtitle || '');
            var pName = asText(p.prizename || '');
            var label = (pAward && pName && pAward !== pName) ? (pAward + ' (' + pName + ')') : (pAward || pName || ('奖品 ' + (idx + 1)));

            var nameSpan = doc.createElement('span');
            nameSpan.textContent = label;
            item.appendChild(nameSpan);

            item.addEventListener('click', function (e) {
                e.stopPropagation();
                if (self.state !== 'ready') return;
                self.prizeIndex = idx;
                self.closePrizeDropdown();
                self.updatePrize(p, self.prizes, idx);
                self.triggerCallback('onPrizeSelect', p, idx);
            });

            self.prizeDropdownList.appendChild(item);
        });
    };

    DanmakuStage.prototype.openPrizeDropdown = function () {
        if (!this.prizeDropdown || this.state !== 'ready') return;
        this.closeSpeedPopover();
        this.renderPrizeDropdown();
        this.prizeDropdown.style.display = 'block';
        void this.prizeDropdown.offsetWidth;
        this.prizeDropdown.classList.add('is-open');
        if (this.btnPrizeSelect) {
            this.btnPrizeSelect.setAttribute('aria-expanded', 'true');
        }
    };

    DanmakuStage.prototype.closePrizeDropdown = function () {
        if (!this.prizeDropdown) return;
        this.prizeDropdown.classList.remove('is-open');
        if (this.btnPrizeSelect) {
            this.btnPrizeSelect.setAttribute('aria-expanded', 'false');
        }
        var self = this;
        window.setTimeout(function () {
            if (self.prizeDropdown && !self.prizeDropdown.classList.contains('is-open')) {
                self.prizeDropdown.style.display = 'none';
            }
        }, 200);
    };

    DanmakuStage.prototype.togglePrizeDropdown = function () {
        if (this.state !== 'ready') return;
        if (this.prizeDropdown && this.prizeDropdown.classList.contains('is-open')) {
            this.closePrizeDropdown();
        } else {
            this.openPrizeDropdown();
        }
    };

    DanmakuStage.prototype.setDrawCount = function (count, triggerCallback) {
        var val = parseInt(count, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (this.maxDrawCount && val > this.maxDrawCount) val = this.maxDrawCount;
        this.drawCount = val;
        if (this.stepperInput) {
            this.stepperInput.value = String(val);
        }
        if (triggerCallback) {
            this.triggerCallback('onDrawCountChange', val);
        }
    };

    DanmakuStage.prototype.setResult = function (values, prize) {
        this.stopFocusRoll();
        if (this.spawnTimer) window.clearInterval(this.spawnTimer);
        this.spawnTimer = null;
        this.clearItems();

        this.updatePrize(prize || {});

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
                    if (winner.extras && winner.extras.length) {
                        winner.extras.forEach(function (extra) {
                            var extraNode = doc.createElement('small');
                            extraNode.textContent = extra;
                            card.appendChild(extraNode);
                        });
                    }
                    this.resultList.appendChild(card);
                }, this);
            }
        }

        this.setState('result');
    };

    DanmakuStage.prototype.flattenWinners = function (values) {
        var winners = [];
        if (!values) return winners;
        var list = Array.isArray ? (Array.isArray(values) ? values : [values]) : (Object.prototype.toString.call(values) === '[object Array]' ? values : [values]);
        list.forEach(function (value) {
            if (value && value.luckers && value.luckers.length) {
                value.luckers.forEach(function (lucker) { winners.push(normalizeCandidate(lucker)); });
            } else {
                winners.push(normalizeCandidate(value));
            }
        });
        return winners.filter(function (winner) { return winner.name !== ''; });
    };

    DanmakuStage.prototype.setReady = function (values, prize) {
        this.stopFocusRoll();
        if (this.stage) this.stage.classList.remove('has-winner');
        if (prize) {
            this.updatePrize(prize);
        }
        this.setState('ready');
        this.updateCandidates(values || []);
        this.startSpawn();
        this.startLoop();
    };

    DanmakuStage.prototype.showWinners = function (values) {
        this.stopFocusRoll();
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

    DanmakuStage.prototype.setControls = function (controlsData) {
        this.updateControls(controlsData);
    };

    DanmakuStage.prototype.updateControls = function (controlsData) {
        if (!controlsData) return;
        if (controlsData.maxDrawCount !== undefined) {
            this.maxDrawCount = parseInt(controlsData.maxDrawCount, 10) || 999;
        }
        if (controlsData.onceout !== undefined || controlsData.drawCount !== undefined) {
            var count = controlsData.onceout !== undefined ? controlsData.onceout : controlsData.drawCount;
            this.setDrawCount(count, false);
        } else if (this.drawCount > this.maxDrawCount) {
            this.setDrawCount(this.drawCount, false);
        }
        if (controlsData.prize !== undefined) {
            this.updatePrize(controlsData.prize, controlsData.prizes, controlsData.prizeIndex);
        } else if (controlsData.prizes !== undefined) {
            this.prizes = controlsData.prizes || [];
            this.prizeIndex = controlsData.prizeIndex !== undefined ? controlsData.prizeIndex : this.prizeIndex;
            this.renderPrizeDropdown();
        }
        if (controlsData.speedPreset !== undefined) {
            this.setSpeedPreset(controlsData.speedPreset);
        }
        if (controlsData.state !== undefined) {
            this.setState(controlsData.state);
        }
		if (controlsData.primaryText !== undefined) {
			this.updateDockPrimaryUI(controlsData.primaryText);
		}
		if (controlsData.primaryEnabled !== undefined && this.btnPrimary && this.state === 'ready') {
			this.btnPrimary.disabled = !controlsData.primaryEnabled;
		}
	};

    DanmakuStage.prototype.setRecords = function (data, status) {
        if (!this.recordsDrawer) return;

        if (this.recordsLoadingState) this.recordsLoadingState.style.display = 'none';
        if (this.recordsErrorState) this.recordsErrorState.style.display = 'none';
        if (this.recordsEmptyState) this.recordsEmptyState.style.display = 'none';
        if (this.recordsListWrap) this.recordsListWrap.style.display = 'none';

        if (status === 'loading') {
            if (this.recordsLoadingState) this.recordsLoadingState.style.display = 'flex';
            this.openRecords();
            return;
        }

        if (status === 'error') {
            if (this.recordsErrorState) {
                this.recordsErrorState.style.display = 'flex';
                if (this.recordsErrorMsg && typeof data === 'string' && data) {
                    this.recordsErrorMsg.textContent = data;
                }
            }
            this.openRecords();
            return;
        }

        var winners = this.flattenWinners(data || []);
        if (this.recordsTotalCount) {
            this.recordsTotalCount.textContent = String(winners.length);
        }

        if (!winners.length) {
            if (this.recordsEmptyState) this.recordsEmptyState.style.display = 'flex';
            this.openRecords();
            return;
        }

        if (this.recordsListWrap) {
            this.recordsListWrap.style.display = 'block';
            this.recordsListWrap.textContent = '';
            var doc = this.recordsListWrap.ownerDocument || document;
            var self = this;
            var isGrouped = Array.isArray(data) && data.length > 0 && (data[0].luckers || data[0].roundawards);

            if (isGrouped) {
                data.forEach(function (group) {
                    var groupLuckers = group.luckers || [];
                    if (!groupLuckers.length) return;
                    var gAward = asText(group.awardname || group.roundtitle || '');
                    var gPrize = asText(group.prizename || '');
                    var gTitle = (gAward && gPrize && gAward !== gPrize) ? (gAward + ' · ' + gPrize) : (gAward || gPrize || '中奖奖项');

                    var section = doc.createElement('div');
                    section.className = 'importcj-danmaku-drawer-section';

                    var sHeader = doc.createElement('div');
                    sHeader.className = 'importcj-danmaku-drawer-section-header';
                    var sTitle = doc.createElement('strong');
                    sTitle.textContent = gTitle;
                    var sCount = doc.createElement('span');
                    sCount.textContent = groupLuckers.length + '人';
                    sHeader.appendChild(sTitle);
                    sHeader.appendChild(sCount);
                    section.appendChild(sHeader);

                    var sGrid = doc.createElement('div');
                    sGrid.className = 'importcj-danmaku-drawer-grid';
                    groupLuckers.forEach(function (lucker, idx) {
                        var card = self.createWinnerCard(doc, normalizeCandidate(lucker), idx + 1);
                        sGrid.appendChild(card);
                    });
                    section.appendChild(sGrid);
                    self.recordsListWrap.appendChild(section);
                });
            } else {
                var grid = doc.createElement('div');
                grid.className = 'importcj-danmaku-drawer-grid';
                winners.forEach(function (winner, idx) {
                    var card = self.createWinnerCard(doc, winner, idx + 1);
                    grid.appendChild(card);
                });
                this.recordsListWrap.appendChild(grid);
            }
        }

        this.openRecords();
    };

    DanmakuStage.prototype.openRecords = function () {
        if (!this.recordsDrawer) return;
        this.closeSpeedPopover();
        this.closePrizeDropdown();
        this.recordsDrawer.style.display = 'flex';
        void this.recordsDrawer.offsetWidth;
        this.recordsDrawer.classList.add('is-open');
    };

    DanmakuStage.prototype.closeRecords = function () {
        if (!this.recordsDrawer) return;
        this.recordsDrawer.classList.remove('is-open');
        var self = this;
        window.setTimeout(function () {
            if (self.recordsDrawer && !self.recordsDrawer.classList.contains('is-open')) {
                self.recordsDrawer.style.display = 'none';
            }
        }, 320);
    };

    DanmakuStage.prototype.setSpeedPreset = function (presetKey) {
        if (!SPEED_PRESETS[presetKey]) presetKey = 'normal';
        this.speedPreset = presetKey;
        var preset = SPEED_PRESETS[presetKey];
        this.speedFactor = preset.factor;
        this.updateSpeedUI();
        if (this.state !== 'result' && !this.reducedMotion) {
            this.startSpawn();
        }
    };

    DanmakuStage.prototype.getSpeedPreset = function () {
        return this.speedPreset || 'normal';
    };

    DanmakuStage.prototype.updateSpeedUI = function () {
        if (this.btnSpeedText) {
            this.btnSpeedText.textContent = '速度: ' + (SPEED_PRESETS[this.speedPreset] || SPEED_PRESETS.normal).label;
        }
        if (this.speedPopover) {
            var opts = this.speedPopover.querySelectorAll('.importcj-danmaku-speed-opt');
            var self = this;
            Array.prototype.forEach.call(opts, function (btn) {
                var speed = btn.getAttribute('data-speed');
                if (speed === self.speedPreset) {
                    btn.classList.add('is-active');
                    btn.setAttribute('aria-checked', 'true');
                } else {
                    btn.classList.remove('is-active');
                    btn.setAttribute('aria-checked', 'false');
                }
            });
        }
    };

    DanmakuStage.prototype.openSpeedPopover = function () {
        if (!this.speedPopover || this.state !== 'ready') return;
        this.closePrizeDropdown();
        this.updateSpeedUI();
        this.speedPopover.style.display = 'block';
        void this.speedPopover.offsetWidth;
        this.speedPopover.classList.add('is-open');
        if (this.btnSpeed) this.btnSpeed.setAttribute('aria-expanded', 'true');
    };

    DanmakuStage.prototype.closeSpeedPopover = function () {
        if (!this.speedPopover) return;
        this.speedPopover.classList.remove('is-open');
        if (this.btnSpeed) this.btnSpeed.setAttribute('aria-expanded', 'false');
        var self = this;
        window.setTimeout(function () {
            if (self.speedPopover && !self.speedPopover.classList.contains('is-open')) {
                self.speedPopover.style.display = 'none';
            }
        }, 200);
    };

    DanmakuStage.prototype.toggleSpeedPopover = function () {
        if (this.state !== 'ready') return;
        if (this.speedPopover && this.speedPopover.classList.contains('is-open')) {
            this.closeSpeedPopover();
        } else {
            this.openSpeedPopover();
        }
    };

    DanmakuStage.prototype.updateDockPrimaryUI = function (customText) {
        if (!this.btnPrimary) return;
        this.btnPrimary.className = 'importcj-danmaku-dock-btn is-primary state-' + this.state;
        var state = this.state;
        if (state === 'drawing') {
            this.btnPrimary.disabled = false;
            if (this.btnPrimaryIcon) this.btnPrimaryIcon.innerHTML = SVG_ICONS.stop;
            var text = customText || '停止';
            if (this.btnPrimaryText) this.btnPrimaryText.textContent = text;
            this.btnPrimary.setAttribute('aria-label', customText || '停止抽奖');
        } else if (state === 'result') {
            this.btnPrimary.disabled = false;
            if (this.btnPrimaryIcon) this.btnPrimaryIcon.innerHTML = SVG_ICONS.refresh;
            var text = customText || '再抽一次';
            if (this.btnPrimaryText) this.btnPrimaryText.textContent = text;
            this.btnPrimary.setAttribute('aria-label', customText || '再抽一次');
        } else if (state === 'records') {
            this.btnPrimary.disabled = true;
            if (this.btnPrimaryIcon) this.btnPrimaryIcon.innerHTML = SVG_ICONS.play;
            var text = customText || '开始抽奖';
            if (this.btnPrimaryText) this.btnPrimaryText.textContent = text;
            this.btnPrimary.setAttribute('aria-label', customText || '中奖记录查看中');
        } else if (state === 'requesting' || state === 'starting') {
            this.btnPrimary.disabled = true;
            if (this.btnPrimaryIcon) this.btnPrimaryIcon.innerHTML = SVG_ICONS.play;
            var defaultLabel = state === 'requesting' ? '正在请求...' : '正在启动...';
            var text = customText || defaultLabel;
            if (this.btnPrimaryText) this.btnPrimaryText.textContent = text;
            this.btnPrimary.setAttribute('aria-label', text);
        } else {
            this.btnPrimary.disabled = false;
            if (this.btnPrimaryIcon) this.btnPrimaryIcon.innerHTML = SVG_ICONS.play;
            var text = customText || '开始抽奖';
            if (this.btnPrimaryText) this.btnPrimaryText.textContent = text;
            this.btnPrimary.setAttribute('aria-label', customText || '开始抽奖');
        }
    };

    DanmakuStage.prototype.triggerCallback = function (name) {
        if (this.callbacks && typeof this.callbacks[name] === 'function') {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.callbacks[name].apply(null, args);
        }
        return undefined;
    };

    DanmakuStage.prototype.startSpawn = function () {
        var self = this;
        if (this.spawnTimer) window.clearInterval(this.spawnTimer);
        this.spawnTimer = null;
        if (this.reducedMotion) return;
        var preset = SPEED_PRESETS[this.speedPreset] || SPEED_PRESETS.normal;
        var interval = preset.interval || 420;
        this.spawnTimer = window.setInterval(function () {
            if (self.paused || (typeof document !== 'undefined' && document.hidden) || !self.candidates.length || self.items.length >= MAX_ITEMS) return;
            self.spawnItem(false);
        }, interval);
    };

    DanmakuStage.prototype.pickCandidate = function () {
        return this.candidates[randomInt(0, this.candidates.length - 1)] || null;
    };

    DanmakuStage.prototype.getLaneCount = function () {
        var height = this.field ? this.field.clientHeight : (this.root ? this.root.clientHeight : 660);
        var usable = Math.max(160, height - 60);
        return Math.max(3, Math.min(LANE_COUNT, Math.floor(usable / this.laneHeight)));
    };

    DanmakuStage.prototype.getLaneTop = function (lane) {
        var count = this.getLaneCount();
        var height = this.field ? this.field.clientHeight : (this.root ? this.root.clientHeight : 660);
        var itemHeight = 56;
        var usable = Math.max(160, height - itemHeight - 30);
        var step = count > 1 ? usable / (count - 1) : 0;
        return Math.round(15 + step * lane);
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

        var laneCount = this.getLaneCount();
        var lane = (this.laneIndex++) % laneCount;
        var width = this.field.clientWidth || (this.root ? this.root.clientWidth : 1920);
        var x = staticItem ? Math.round(width * (0.08 + ((this.items.length * 0.16) % 0.82))) : width + randomInt(20, 160);
        var top = this.getLaneTop(lane);
        item.style.top = top + 'px';
        item.style.transform = 'translate3d(' + x + 'px,0,0)';
        this.field.appendChild(item);
        var widthCache = item.offsetWidth || 200;
        var entry = { element: item, x: x, width: widthCache, baseSpeed: 1.25 + Math.random() * 0.85, staticItem: !!staticItem, lane: lane };
        this.items.push(entry);
        if (staticItem) item.classList.add('is-static');
    };

    DanmakuStage.prototype.startLoop = function () {
        if (this.reducedMotion || this.paused || (typeof document !== 'undefined' && document.hidden) || this.rafId !== null) return;
        this.rafId = window.requestAnimationFrame(this.tick.bind(this));
    };

    DanmakuStage.prototype.tick = function () {
        this.rafId = null;
        if (this.reducedMotion || this.paused || (typeof document !== 'undefined' && document.hidden)) return;
        var speedFactor = this.speedFactor || 1.0;
        var multiplier = (this.state === 'drawing' ? 2.15 : 1) * speedFactor;
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
        if (!this.field || !this.root) return;
        var laneCount = this.getLaneCount();
        for (var i = 0; i < this.items.length; i++) {
            var entry = this.items[i];
            if (entry.lane !== undefined) {
                var top = this.getLaneTop(entry.lane % laneCount);
                entry.element.style.top = top + 'px';
            }
        }
    };

    DanmakuStage.prototype.handleVisibility = function () {
        this.paused = typeof document !== 'undefined' && !!document.hidden;
        if (!this.paused) this.startLoop();
    };

    DanmakuStage.prototype.handleDocumentClick = function (e) {
        if (this.speedPopover && this.speedPopover.classList.contains('is-open')) {
            if (!this.speedPopover.contains(e.target) && (!this.btnSpeed || !this.btnSpeed.contains(e.target))) {
                this.closeSpeedPopover();
            }
        }
        if (this.prizeDropdown && this.prizeDropdown.classList.contains('is-open')) {
            var selectBtn = this.btnPrizeSelect;
            if (!this.prizeDropdown.contains(e.target) && (!selectBtn || !selectBtn.contains(e.target))) {
                this.closePrizeDropdown();
            }
        }
    };

    DanmakuStage.prototype.handleKeyDown = function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            if (this.recordsDrawer && this.recordsDrawer.classList.contains('is-open')) {
                this.closeRecords();
                this.triggerCallback('onRecordsClose');
            } else if (this.speedPopover && this.speedPopover.classList.contains('is-open')) {
                this.closeSpeedPopover();
            } else if (this.prizeDropdown && this.prizeDropdown.classList.contains('is-open')) {
                this.closePrizeDropdown();
            }
        }
    };

    DanmakuStage.prototype.clearItems = function () {
        this.items.forEach(function (entry) {
            if (entry.element && entry.element.parentNode) entry.element.parentNode.removeChild(entry.element);
        });
        this.items = [];
    };

    DanmakuStage.prototype.destroy = function () {
        this.stopFocusRoll();
        if (this.transitionFallbackTimer) {
            window.clearTimeout(this.transitionFallbackTimer);
            this.transitionFallbackTimer = null;
        }
        if (this.spawnTimer) window.clearInterval(this.spawnTimer);
        this.spawnTimer = null;
        if (this.rafId !== null && typeof window !== 'undefined' && window.cancelAnimationFrame) {
            window.cancelAnimationFrame(this.rafId);
        }
        this.rafId = null;
        if (this.resizeObserver) this.resizeObserver.disconnect();
        this.resizeObserver = null;
        if (this.resizeBound && typeof window !== 'undefined' && window.removeEventListener) {
            window.removeEventListener('resize', this.boundResize);
        }
        this.resizeBound = false;
        if (typeof document !== 'undefined') {
            if (document.removeEventListener) {
                document.removeEventListener('visibilitychange', this.boundVisibility);
                document.removeEventListener('click', this.boundDocClick);
                document.removeEventListener('keydown', this.boundKeyDown);
            }
        }
        this.clearItems();
        if (this.stage && this.stage.parentNode) {
            this.stage.parentNode.removeChild(this.stage);
        }
        this.stage = null;
        this.field = null;
        this.focus = null;
        this.prizePanel = null;
        this.resultPanel = null;
        this.resultList = null;
        this.floatingBar = null;
        this.btnPrimary = null;
        this.btnPrimaryIcon = null;
        this.btnPrimaryText = null;
        this.btnSpeed = null;
        this.btnSpeedText = null;
        this.btnRecords = null;
        this.btnPrev = null;
        this.btnNext = null;
        this.btnPrizeSelect = null;
        this.btnDec = null;
        this.btnInc = null;
        this.speedPopover = null;
        this.prizeDropdown = null;
        this.prizeDropdownList = null;
        this.stepperInput = null;
        this.recordsDrawer = null;
        this.recordsTotalCount = null;
        this.recordsLoadingState = null;
        this.recordsErrorState = null;
        this.recordsErrorMsg = null;
        this.recordsEmptyState = null;
        this.recordsListWrap = null;
    };

    return {
        create: function (options) { return new DanmakuStage(options); },
        normalizeCandidate: normalizeCandidate
    };
});
