/*
 * 大屏抽奖公共舞台 UI。
 * 统一主持控制坞、中奖结果和中奖记录抽屉；具体抽奖业务、接口和动画由各 Controller 负责。
 */
define([], function () {
    'use strict';

    var SPEED_PRESETS = {
        slow: { key: 'slow', label: '舒缓', factor: 0.6, desc: '平稳舒缓，适于观摩' },
        normal: { key: 'normal', label: '标准', factor: 1.0, desc: '均衡流畅，标准节奏' },
        fast: { key: 'fast', label: '热烈', factor: 1.6, desc: '极速穿梭，全场热烈' }
    };

    var SVG_ICONS = {
        settings: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"></line><circle cx="9" cy="7" r="2"></circle><line x1="4" y1="17" x2="20" y2="17"></line><circle cx="15" cy="17" r="2"></circle></svg>',
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
        if (typeof value === 'string') return { name: asText(value), extras: [] };
        value = value || {};
        var extras = value.extras || [value.datafield2, value.datafield3, value.datafield4];
        return {
            name: asText(value.name || value.nickname || value.datafield1 || ''),
            extras: extras.map(asText).filter(function (item) { return item !== ''; }).slice(0, 2),
            recordId: value.recordId || value.recordid || value.luckerid || null
        };
    }

    function safeImageUrl(value) {
        value = asText(value);
        if (!value || /^javascript:/i.test(value) || /^data:/i.test(value)) return '';
        return /^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(value) ? value : '';
    }

    function StageUi(options) {
        options = options || {};
        this.root = options.root || null;
        this.callbacks = options.callbacks || {};
        this.speedEnabled = options.speedEnabled !== false;
        this.speedPreset = SPEED_PRESETS[options.speedPreset] ? options.speedPreset : 'normal';
        this.state = 'ready';
        this.stage = null;
        this.resultPanel = null;
        this.resultList = null;
        this.btnPrimary = null;
        this.btnPrimaryIcon = null;
        this.btnPrimaryText = null;
        this.btnSpeed = null;
        this.btnSpeedText = null;
        this.btnRecords = null;
        this.btnPrizeSettings = null;
        this.btnPrizeSettingsText = null;
        this.prizeSettingsVisible = false;
        this.prizeSettingsEnabled = false;
        this.speedPopover = null;
        this.recordsDrawer = null;
        this.recordsTotalCount = null;
        this.recordsLoadingState = null;
        this.recordsErrorState = null;
        this.recordsErrorMsg = null;
        this.recordsEmptyState = null;
        this.recordsListWrap = null;
        this.currentPrize = null;
        this.boundDocClick = this.handleDocumentClick.bind(this);
        this.boundKeyDown = this.handleKeyDown.bind(this);
    }

    StageUi.prototype.triggerCallback = function (name) {
        if (!this.callbacks || typeof this.callbacks[name] !== 'function') return undefined;
        return this.callbacks[name].apply(null, Array.prototype.slice.call(arguments, 1));
    };

    StageUi.prototype.mount = function () {
        this.destroy();
        if (!this.root) return this;
        var doc = this.root.ownerDocument || document;
        var stage = doc.createElement('div');
        stage.className = 'screen-stage-ui';
        stage.setAttribute('data-state', 'ready');
        var result = this.createResultPanel(doc);
        var dock = this.createFloatingDock(doc);
        var speed = this.createSpeedPopover(doc);
        var drawer = this.createRecordsDrawer(doc);
        stage.appendChild(result);
        stage.appendChild(dock);
        stage.appendChild(speed);
        stage.appendChild(drawer);
        this.root.appendChild(stage);
        this.root.classList.add('screen-stage-ui-enabled');
        this.stage = stage;
        this.resultPanel = result;
        this.resultList = result.querySelector('.screen-stage-result-list');
        this.speedPopover = speed;
        this.recordsDrawer = drawer;
        doc.addEventListener('click', this.boundDocClick);
        doc.addEventListener('keydown', this.boundKeyDown, true);
        this.setState('ready');
        return this;
    };

    StageUi.prototype.createResultPanel = function (doc) {
        var panel = doc.createElement('section');
        panel.className = 'screen-stage-result';
        panel.setAttribute('aria-label', '中奖揭晓结果');
        panel.setAttribute('aria-live', 'polite');

        var summary = doc.createElement('div');
        summary.className = 'screen-stage-result-summary';
        var imageWrap = doc.createElement('div');
        imageWrap.className = 'screen-stage-result-prize-image is-missing';
        var image = doc.createElement('img');
        image.alt = '礼品图片';
        imageWrap.appendChild(image);
        var copy = doc.createElement('div');
        copy.className = 'screen-stage-result-prize-copy';
        var award = doc.createElement('span');
        award.className = 'screen-stage-result-prize-award';
        var title = doc.createElement('strong');
        title.className = 'screen-stage-result-prize-title';
        copy.appendChild(award);
        copy.appendChild(title);
        var count = doc.createElement('span');
        count.className = 'screen-stage-result-prize-count';
        count.textContent = '';
        var countValue = doc.createElement('strong');
        countValue.className = 'screen-stage-result-prize-count-value';
        countValue.textContent = '-';
        count.appendChild(countValue);
        summary.appendChild(imageWrap);
        summary.appendChild(copy);
        summary.appendChild(count);
        var list = doc.createElement('div');
        list.className = 'screen-stage-result-list';
        panel.appendChild(summary);
        panel.appendChild(list);
        panel._imageWrap = imageWrap;
        panel._image = image;
        panel._award = award;
        panel._title = title;
        panel._count = countValue;
        return panel;
    };

    StageUi.prototype.createFloatingDock = function (doc) {
        var dock = doc.createElement('div');
        dock.className = 'screen-stage-dock';
        dock.setAttribute('role', 'toolbar');
        dock.setAttribute('aria-label', '舞台功能控制组');
        var primary = doc.createElement('button');
        primary.type = 'button';
        primary.className = 'screen-stage-dock-btn is-primary state-ready';
        primary.setAttribute('aria-label', '开始抽奖');
        var primaryIcon = doc.createElement('span');
        primaryIcon.innerHTML = SVG_ICONS.play;
        var primaryText = doc.createElement('span');
        primaryText.textContent = '开始抽奖';
        primary.appendChild(primaryIcon);
        primary.appendChild(primaryText);
        var divider = doc.createElement('div');
        divider.className = 'screen-stage-dock-divider';
        divider.setAttribute('aria-hidden', 'true');
        var group = doc.createElement('div');
        group.className = 'screen-stage-dock-group';
        var settings = doc.createElement('button');
        settings.type = 'button';
        settings.className = 'screen-stage-dock-btn is-settings';
        settings.setAttribute('aria-label', '展开奖品设置');
        settings.setAttribute('aria-pressed', 'false');
        settings.disabled = true;
        settings.title = '奖品设置';
        var settingsIcon = doc.createElement('span');
        settingsIcon.innerHTML = SVG_ICONS.settings;
        var settingsText = doc.createElement('span');
        settingsText.textContent = '奖品设置';
        settings.appendChild(settingsIcon);
        settings.appendChild(settingsText);
        var speed = doc.createElement('button');
        speed.type = 'button';
        speed.className = 'screen-stage-dock-btn is-speed';
        speed.setAttribute('aria-haspopup', 'menu');
        speed.setAttribute('aria-expanded', 'false');
        speed.setAttribute('aria-label', '调节弹幕速度');
        speed.title = '调节弹幕速度';
        var speedIcon = doc.createElement('span');
        speedIcon.innerHTML = SVG_ICONS.speed;
        var speedText = doc.createElement('span');
        speedText.textContent = '速度: ' + SPEED_PRESETS[this.speedPreset].label;
        speed.appendChild(speedIcon);
        speed.appendChild(speedText);
        speed.hidden = !this.speedEnabled;
        var records = doc.createElement('button');
        records.type = 'button';
        records.className = 'screen-stage-dock-btn is-records';
        records.setAttribute('aria-label', '查看中奖记录');
        records.title = '查看中奖记录';
        var recordsIcon = doc.createElement('span');
        recordsIcon.innerHTML = SVG_ICONS.records;
        var recordsText = doc.createElement('span');
        recordsText.textContent = '中奖记录';
        records.appendChild(recordsIcon);
        records.appendChild(recordsText);
        group.appendChild(settings);
        group.appendChild(speed);
        group.appendChild(records);
        dock.appendChild(primary);
        dock.appendChild(divider);
        dock.appendChild(group);
        this.btnPrimary = primary;
        this.btnPrimaryIcon = primaryIcon;
        this.btnPrimaryText = primaryText;
        this.btnSpeed = speed;
        this.btnSpeedText = speedText;
        this.btnRecords = records;
        this.btnPrizeSettings = settings;
        this.btnPrizeSettingsText = settingsText;

        var self = this;
        primary.addEventListener('click', function (event) {
            event.stopPropagation();
            if (!primary.disabled) self.triggerCallback('onPrimaryAction');
        });
        primary.addEventListener('keydown', function (event) {
            if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return;
            event.preventDefault();
            event.stopPropagation();
            if (!primary.disabled) self.triggerCallback('onPrimaryAction');
        });
        settings.addEventListener('click', function (event) {
            event.stopPropagation();
            if (!settings.disabled) self.triggerCallback('onPrizeSettingsToggle');
        });
        speed.addEventListener('click', function (event) {
            event.stopPropagation();
            if (self.state === 'ready' && !speed.disabled) self.toggleSpeedPopover();
        });
        records.addEventListener('click', function (event) {
            event.stopPropagation();
            if (records.disabled) return;
            self.openRecords();
            self.triggerCallback('onRecords');
        });
        return dock;
    };

    StageUi.prototype.createSpeedPopover = function (doc) {
        var popover = doc.createElement('div');
        popover.className = 'screen-stage-speed-popover';
        popover.setAttribute('role', 'menu');
        popover.setAttribute('aria-label', '弹幕速度选择');
        popover.hidden = !this.speedEnabled;
        var title = doc.createElement('div');
        title.className = 'screen-stage-speed-popover-title';
        title.textContent = '弹幕流动速度';
        popover.appendChild(title);
        var options = doc.createElement('div');
        options.className = 'screen-stage-speed-options';
        var self = this;
        ['slow', 'normal', 'fast'].forEach(function (key) {
            var preset = SPEED_PRESETS[key];
            var button = doc.createElement('button');
            button.type = 'button';
            button.className = 'screen-stage-speed-opt' + (self.speedPreset === key ? ' is-active' : '');
            button.setAttribute('role', 'menuitemradio');
            button.setAttribute('aria-checked', self.speedPreset === key ? 'true' : 'false');
            button.setAttribute('data-speed', key);
            var main = doc.createElement('div');
            var name = doc.createElement('strong');
            name.className = 'screen-stage-speed-opt-name';
            name.textContent = preset.label;
            var desc = doc.createElement('span');
            desc.className = 'screen-stage-speed-opt-desc';
            desc.textContent = preset.desc;
            main.appendChild(name);
            main.appendChild(desc);
            var check = doc.createElement('span');
            check.className = 'screen-stage-speed-opt-check';
            check.innerHTML = SVG_ICONS.check;
            button.appendChild(main);
            button.appendChild(check);
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                if (self.state !== 'ready' || button.disabled) return;
                self.setSpeedPreset(key);
                self.closeSpeedPopover();
                self.triggerCallback('onSpeedChange', key, preset.factor);
            });
            options.appendChild(button);
        });
        popover.appendChild(options);
        return popover;
    };

    StageUi.prototype.createRecordsDrawer = function (doc) {
        var drawer = doc.createElement('aside');
        drawer.className = 'screen-stage-records';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-label', '中奖记录抽屉');
        var backdrop = doc.createElement('div');
        backdrop.className = 'screen-stage-records-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        var panel = doc.createElement('div');
        panel.className = 'screen-stage-records-drawer';
        var header = doc.createElement('header');
        header.className = 'screen-stage-records-header';
        var titleWrap = doc.createElement('div');
        var kicker = doc.createElement('span');
        kicker.className = 'screen-stage-records-kicker';
        kicker.textContent = 'WINNERS RECORD';
        var title = doc.createElement('h3');
        title.className = 'screen-stage-records-title';
        title.textContent = '中奖记录';
        titleWrap.appendChild(kicker);
        titleWrap.appendChild(title);
        var meta = doc.createElement('div');
        meta.className = 'screen-stage-records-meta';
        var badge = doc.createElement('span');
        badge.className = 'screen-stage-records-badge';
        badge.textContent = '共 ';
        var total = doc.createElement('strong');
        total.textContent = '0';
        badge.appendChild(total);
        badge.appendChild(doc.createTextNode(' 人'));
        var close = doc.createElement('button');
        close.type = 'button';
        close.className = 'screen-stage-records-close';
        close.setAttribute('aria-label', '关闭中奖记录抽屉');
        close.title = '关闭';
        close.innerHTML = SVG_ICONS.close;
        meta.appendChild(badge);
        meta.appendChild(close);
        header.appendChild(titleWrap);
        header.appendChild(meta);
        var content = doc.createElement('div');
        content.className = 'screen-stage-records-content';
        var loading = doc.createElement('div');
        loading.className = 'screen-stage-records-state is-loading';
        loading.style.display = 'none';
        var spinner = doc.createElement('div');
        spinner.className = 'screen-stage-records-spinner';
        var loadingText = doc.createElement('p');
        loadingText.textContent = '正在加载中奖记录...';
        loading.appendChild(spinner);
        loading.appendChild(loadingText);
        var error = doc.createElement('div');
        error.className = 'screen-stage-records-state is-error';
        error.style.display = 'none';
        var errorIcon = doc.createElement('div');
        errorIcon.className = 'screen-stage-records-error-icon';
        errorIcon.textContent = '!';
        var errorMsg = doc.createElement('p');
        errorMsg.textContent = '中奖记录加载失败';
        var retry = doc.createElement('button');
        retry.type = 'button';
        retry.className = 'screen-stage-records-retry-btn';
        retry.setAttribute('aria-label', '重新加载中奖记录');
        retry.textContent = '重新加载';
        error.appendChild(errorIcon);
        error.appendChild(errorMsg);
        error.appendChild(retry);
        var empty = doc.createElement('div');
        empty.className = 'screen-stage-records-state is-empty';
        empty.style.display = 'none';
        var emptyIcon = doc.createElement('div');
        emptyIcon.className = 'screen-stage-records-empty-icon';
        emptyIcon.textContent = '🏆';
        var emptyText = doc.createElement('p');
        emptyText.textContent = '暂无中奖记录';
        empty.appendChild(emptyIcon);
        empty.appendChild(emptyText);
        var list = doc.createElement('div');
        list.className = 'screen-stage-records-list';
        content.appendChild(loading);
        content.appendChild(error);
        content.appendChild(empty);
        content.appendChild(list);
        panel.appendChild(header);
        panel.appendChild(content);
        drawer.appendChild(backdrop);
        drawer.appendChild(panel);
        this.recordsTotalCount = total;
        this.recordsLoadingState = loading;
        this.recordsErrorState = error;
        this.recordsErrorMsg = errorMsg;
        this.recordsEmptyState = empty;
        this.recordsListWrap = list;

        var self = this;
        close.addEventListener('click', function (event) {
            event.stopPropagation();
            self.closeRecords();
            self.triggerCallback('onRecordsClose');
        });
        backdrop.addEventListener('click', function (event) {
            event.stopPropagation();
            self.closeRecords();
            self.triggerCallback('onRecordsClose');
        });
        retry.addEventListener('click', function (event) {
            event.stopPropagation();
            var handled = self.triggerCallback('onRecordsRetry');
            if (handled === undefined) self.triggerCallback('onRecords');
        });
        return drawer;
    };

    StageUi.prototype.bindImage = function (wrap, image, url) {
        url = safeImageUrl(url);
        if (!url) {
            image.removeAttribute('src');
            wrap.classList.add('is-missing');
            return;
        }
        image.onload = function () { wrap.classList.remove('is-missing'); };
        image.onerror = function () { wrap.classList.add('is-missing'); };
        image.src = url;
        wrap.classList.remove('is-missing');
    };

    StageUi.prototype.updatePrize = function (prize) {
        prize = prize || {};
        this.currentPrize = prize;
        if (!this.resultPanel) return;
        var award = asText(prize.awardname || prize.roundtitle || '');
        var name = asText(prize.prizename || '');
        var title = name || award || '等待奖项';
        this.resultPanel._award.textContent = award && award !== name ? award : '';
        this.resultPanel._title.textContent = title;
        this.resultPanel._count.textContent = '';
        this.bindImage(this.resultPanel._imageWrap, this.resultPanel._image, prize.prizeimg || prize.image);
    };

    StageUi.prototype.normalizeWinnerGroups = function (data, fallbackPrize) {
        var self = this;
        var list = Object.prototype.toString.call(data) === '[object Array]' ? data : (data ? [data] : []);
        var fallback = fallbackPrize || {};
        var groups = [];
        var grouped = false;

        function numberValue(value) {
            if (value === undefined || value === null || asText(value) === '') return null;
            var number = Number(value);
            return isFinite(number) && number >= 0 && Math.floor(number) === number ? number : null;
        }

        function stablePrizeId(value) {
            value = value || {};
            return value.prizeid || value.prizeId || value.id || null;
        }

        function prizeImageFor(prize, value, luckers) {
            var image = prize.prizeimg || prize.image || value.prizeimg || value.image || '';
            if (image) return image;
            var id = stablePrizeId(prize) || stablePrizeId(value);
            if (!id && luckers.length) id = stablePrizeId(luckers[0]);
            if (!id || !fallback.items || !fallback.items.length) return '';
            for (var i = 0; i < fallback.items.length; i++) {
                var item = fallback.items[i] || {};
                if (String(stablePrizeId(item)) == String(id)) return item.prizeimg || item.image || '';
            }
            return '';
        }

        function addGroup(value, inheritedPrize) {
            value = value || {};
            if (value.roundawards && value.roundawards.length) {
                grouped = true;
                value.roundawards.forEach(function (child) {
                    addGroup(child, value.prize || inheritedPrize || fallback);
                });
                return;
            }

            var prize = value.prize || value.award || inheritedPrize || fallback || {};
            var luckers = value.luckers || value.winners || [];
            var hasGroupShape = Object.prototype.toString.call(luckers) === '[object Array]' || !!value.prize || !!value.award;
            if (!hasGroupShape) return;
            grouped = true;

            var winnerList = self.flattenWinners(luckers);
            var awardname = asText(prize.awardname || prize.roundtitle || value.awardname || value.roundtitle || fallback.awardname || fallback.roundtitle || '');
            var prizename = asText(prize.prizename || value.prizename || fallback.prizename || '');
            var planned = numberValue(value.num);
            if (planned === null) planned = numberValue(prize.num);
            groups.push({
                awardname: awardname,
                prizename: prizename,
                prizeimg: prizeImageFor(prize, value, luckers),
                planned: planned,
                winners: winnerList
            });
        }

        list.forEach(function (value) {
            if (value && (value.roundawards || value.luckers || value.winners || value.prize || value.award)) {
                addGroup(value, fallback);
            }
        });

        if (!grouped) {
            groups = [{
                awardname: asText(fallback.awardname || fallback.roundtitle || ''),
                prizename: asText(fallback.prizename || ''),
                prizeimg: fallback.prizeimg || fallback.image || '',
                planned: numberValue(fallback.num),
                winners: self.flattenWinners(list)
            }];
        }

        return { grouped: grouped, groups: groups.filter(function (group) { return group.winners.length > 0; }) };
    };

    StageUi.prototype.createResultWinnerCard = function (doc, winner) {
        var card = doc.createElement('div');
        card.className = 'screen-stage-result-card';
        var name = doc.createElement('strong');
        name.textContent = winner.name;
        card.appendChild(name);
        winner.extras.forEach(function (extra) {
            var node = doc.createElement('small');
            node.textContent = extra;
            card.appendChild(node);
        });
        return card;
    };

    StageUi.prototype.createResultGroup = function (doc, group) {
        var section = doc.createElement('section');
        section.className = 'screen-stage-result-group';
        var header = doc.createElement('header');
        header.className = 'screen-stage-result-group-header';
        var prize = doc.createElement('div');
        prize.className = 'screen-stage-result-group-prize';
        var imageWrap = doc.createElement('span');
        imageWrap.className = 'screen-stage-result-group-image is-missing';
        var image = doc.createElement('img');
        image.alt = '奖品图片';
        imageWrap.appendChild(image);
        var title = doc.createElement('strong');
        title.className = 'screen-stage-result-group-title';
        title.textContent = group.prizename || group.awardname || '中奖奖品';
        var award = doc.createElement('span');
        award.className = 'screen-stage-result-group-award';
        award.textContent = group.awardname && group.awardname !== group.prizename ? group.awardname : '';
        var copy = doc.createElement('div');
        copy.className = 'screen-stage-result-group-copy';
        copy.appendChild(award);
        copy.appendChild(title);
        prize.appendChild(imageWrap);
        prize.appendChild(copy);
        header.appendChild(prize);
        var winners = doc.createElement('div');
        winners.className = 'screen-stage-result-group-winners';
        group.winners.forEach(function (winner) {
            winners.appendChild(this.createResultWinnerCard(doc, winner));
        }, this);
        section.appendChild(header);
        section.appendChild(winners);
        this.bindImage(imageWrap, image, group.prizeimg);
        return section;
    };

    StageUi.prototype.flattenWinners = function (values) {
        var winners = [];
        var list = Object.prototype.toString.call(values) === '[object Array]' ? values : (values ? [values] : []);
        list.forEach(function (value) {
            if (value && value.roundawards && value.roundawards.length) {
                value.roundawards.forEach(function (group) {
                    (group.luckers || []).forEach(function (lucker) { winners.push(normalizeCandidate(lucker)); });
                });
            } else if (value && value.luckers && value.luckers.length) {
                value.luckers.forEach(function (lucker) { winners.push(normalizeCandidate(lucker)); });
            } else {
                winners.push(normalizeCandidate(value));
            }
        });
        return winners.filter(function (winner) { return winner.name !== ''; });
    };

    StageUi.prototype.setResult = function (values, prize) {
        this.updatePrize(prize || {});
        this.resultList.textContent = '';
        var normalized = this.normalizeWinnerGroups(values || [], prize || {});
        var groups = normalized.groups;
        var winners = [];
        this.resultPanel.classList.toggle('is-grouped', normalized.grouped);
        groups.forEach(function (group) { winners = winners.concat(group.winners); });
        var doc = this.resultList.ownerDocument || document;
        this.resultList.className = 'screen-stage-result-list';
        if (!winners.length) {
            var empty = doc.createElement('span');
            empty.className = 'screen-stage-result-empty';
            empty.textContent = '暂无中奖记录';
            this.resultList.appendChild(empty);
        } else if (normalized.grouped) {
            this.resultList.classList.add('is-grouped');
            if (groups.length > 3) this.resultList.classList.add('is-dense');
            groups.forEach(function (group) {
                this.resultList.appendChild(this.createResultGroup(doc, group));
            }, this);
        } else {
            winners.forEach(function (winner) {
                this.resultList.appendChild(this.createResultWinnerCard(doc, winner));
            }, this);
        }
        this.setState('result');
        return this;
    };

    StageUi.prototype.createWinnerCard = function (doc, winner, serial) {
        var card = doc.createElement('div');
        card.className = 'screen-stage-records-card';
        var number = doc.createElement('span');
        number.className = 'screen-stage-records-card-num';
        number.textContent = String(serial);
        var info = doc.createElement('div');
        info.className = 'screen-stage-records-card-info';
        var name = doc.createElement('strong');
        name.className = 'screen-stage-records-card-name';
        name.textContent = winner.name;
        info.appendChild(name);
        if (winner.extras.length) {
            var extras = doc.createElement('div');
            extras.className = 'screen-stage-records-card-extras';
            winner.extras.forEach(function (value) {
                var chip = doc.createElement('span');
                chip.className = 'screen-stage-records-card-chip';
                chip.textContent = value;
                extras.appendChild(chip);
            });
            info.appendChild(extras);
        }
        card.appendChild(number);
        card.appendChild(info);
        if (this.callbacks && typeof this.callbacks.onRecordDelete === 'function' && winner.recordId !== null && winner.recordId !== undefined && winner.recordId !== '') {
            var action = doc.createElement('button');
            action.type = 'button';
            action.className = 'screen-stage-records-card-delete';
            action.setAttribute('aria-label', '删除中奖记录');
            action.textContent = '删除';
            var self = this;
            action.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                self.triggerCallback('onRecordDelete', winner.recordId, winner);
            });
            card.appendChild(action);
        }
        return card;
    };

    StageUi.prototype.setRecords = function (data, status) {
        if (!this.recordsDrawer) return this;
        this.recordsLoadingState.style.display = 'none';
        this.recordsErrorState.style.display = 'none';
        this.recordsEmptyState.style.display = 'none';
        this.recordsListWrap.style.display = 'none';
        if (status === 'loading') {
            this.recordsLoadingState.style.display = 'flex';
            this.openRecords();
            return this;
        }
        if (status === 'error') {
            this.recordsErrorState.style.display = 'flex';
            if (typeof data === 'string' && data) this.recordsErrorMsg.textContent = data;
            this.openRecords();
            return this;
        }
        var normalized = this.normalizeWinnerGroups(data || [], this.currentPrize || {});
        var groups = normalized.groups;
        var winners = [];
        groups.forEach(function (group) { winners = winners.concat(group.winners); });
        this.recordsTotalCount.textContent = String(winners.length);
        if (!winners.length) {
            this.recordsEmptyState.style.display = 'flex';
            this.openRecords();
            return this;
        }
        this.recordsListWrap.style.display = 'block';
        this.recordsListWrap.textContent = '';
        var doc = this.recordsListWrap.ownerDocument || document;
        var self = this;
        if (normalized.grouped) {
            groups.forEach(function (group) {
                var section = doc.createElement('div');
                section.className = 'screen-stage-records-section';
                var sectionHeader = doc.createElement('div');
                sectionHeader.className = 'screen-stage-records-section-header';
                var sectionTitle = doc.createElement('strong');
                var award = asText(group.awardname || '');
                var prize = asText(group.prizename || '');
                sectionTitle.textContent = award && prize && award !== prize ? award + ' · ' + prize : (prize || award || '中奖奖项');
                var sectionCount = doc.createElement('span');
                sectionCount.textContent = group.winners.length + '人';
                sectionHeader.appendChild(sectionTitle);
                sectionHeader.appendChild(sectionCount);
                section.appendChild(sectionHeader);
                var grid = doc.createElement('div');
                grid.className = 'screen-stage-records-grid';
                group.winners.forEach(function (winner, index) {
                    grid.appendChild(self.createWinnerCard(doc, winner, index + 1));
                });
                section.appendChild(grid);
                self.recordsListWrap.appendChild(section);
            });
        } else {
            var list = doc.createElement('div');
            list.className = 'screen-stage-records-grid';
            winners.forEach(function (winner, index) {
                list.appendChild(self.createWinnerCard(doc, winner, index + 1));
            });
            this.recordsListWrap.appendChild(list);
        }
        this.openRecords();
        return this;
    };

    StageUi.prototype.openRecords = function () {
        if (!this.recordsDrawer) return;
        this.closeSpeedPopover();
        this.recordsDrawer.style.display = 'flex';
        void this.recordsDrawer.offsetWidth;
        this.recordsDrawer.classList.add('is-open');
    };

    StageUi.prototype.closeRecords = function () {
        if (!this.recordsDrawer) return;
        this.recordsDrawer.classList.remove('is-open');
        var self = this;
        window.setTimeout(function () {
            if (self.recordsDrawer && !self.recordsDrawer.classList.contains('is-open')) self.recordsDrawer.style.display = 'none';
        }, 320);
    };

    StageUi.prototype.setSpeedPreset = function (key) {
        if (!SPEED_PRESETS[key]) key = 'normal';
        this.speedPreset = key;
        if (this.btnSpeedText) this.btnSpeedText.textContent = '速度: ' + SPEED_PRESETS[key].label;
        if (this.speedPopover) {
            var buttons = this.speedPopover.querySelectorAll('.screen-stage-speed-opt');
            Array.prototype.forEach.call(buttons, function (button) {
                var active = button.getAttribute('data-speed') === key;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-checked', active ? 'true' : 'false');
            });
        }
        return this;
    };

    StageUi.prototype.openSpeedPopover = function () {
        if (!this.speedEnabled || !this.speedPopover || this.state !== 'ready') return;
        this.speedPopover.style.display = 'block';
        void this.speedPopover.offsetWidth;
        this.speedPopover.classList.add('is-open');
        this.btnSpeed.setAttribute('aria-expanded', 'true');
    };

    StageUi.prototype.closeSpeedPopover = function () {
        if (!this.speedPopover) return;
        this.speedPopover.classList.remove('is-open');
        if (this.btnSpeed) this.btnSpeed.setAttribute('aria-expanded', 'false');
        var self = this;
        window.setTimeout(function () {
            if (self.speedPopover && !self.speedPopover.classList.contains('is-open')) self.speedPopover.style.display = 'none';
        }, 200);
    };

    StageUi.prototype.toggleSpeedPopover = function () {
        if (this.speedPopover.classList.contains('is-open')) this.closeSpeedPopover();
        else this.openSpeedPopover();
    };

    StageUi.prototype.setPrizeSettingsVisible = function (visible) {
        var show = !!visible && this.state === 'ready' && this.prizeSettingsEnabled;
        this.prizeSettingsVisible = show;
        if (!this.btnPrizeSettings) return show;
        this.btnPrizeSettings.classList.toggle('is-active', show);
        this.btnPrizeSettings.setAttribute('aria-pressed', show ? 'true' : 'false');
        this.btnPrizeSettings.setAttribute('aria-label', show ? '收起奖品设置' : '展开奖品设置');
        return show;
    };

    StageUi.prototype.updateDockPrimaryUI = function (customText) {
        if (!this.btnPrimary) return;
        this.btnPrimary.className = 'screen-stage-dock-btn is-primary state-' + this.state;
        var text;
        if (this.state === 'drawing') {
            this.btnPrimary.disabled = false;
            this.btnPrimaryIcon.innerHTML = SVG_ICONS.stop;
            text = customText || '停止';
        } else if (this.state === 'result') {
            this.btnPrimary.disabled = false;
            this.btnPrimaryIcon.innerHTML = SVG_ICONS.refresh;
            text = customText || '再抽一次';
        } else if (this.state === 'records') {
            this.btnPrimary.disabled = true;
            this.btnPrimaryIcon.innerHTML = SVG_ICONS.play;
            text = customText || '开始抽奖';
        } else if (this.state === 'requesting' || this.state === 'starting') {
            this.btnPrimary.disabled = true;
            this.btnPrimaryIcon.innerHTML = SVG_ICONS.play;
            text = customText || (this.state === 'requesting' ? '正在请求...' : '正在启动...');
        } else {
            this.btnPrimary.disabled = false;
            this.btnPrimaryIcon.innerHTML = SVG_ICONS.play;
            text = customText || '开始抽奖';
        }
        this.btnPrimaryText.textContent = text;
        this.btnPrimary.setAttribute('aria-label', text);
    };

    StageUi.prototype.updateControlGates = function () {
        var ready = this.state === 'ready';
        var result = this.state === 'result';
        var records = this.state === 'records';
        var busy = this.state === 'requesting' || this.state === 'starting';
        if (this.btnSpeed) this.btnSpeed.disabled = !ready || !this.speedEnabled;
        if (this.btnRecords) this.btnRecords.disabled = (!ready && !result) || records || busy;
        if (this.btnPrizeSettings) {
            this.btnPrizeSettings.disabled = !ready || !this.prizeSettingsEnabled;
            if (!ready) this.setPrizeSettingsVisible(false);
        }
        if (!ready) this.closeSpeedPopover();
    };

    StageUi.prototype.setState = function (state) {
        this.state = /^(ready|requesting|starting|drawing|result|records)$/.test(state) ? state : 'ready';
        if (!this.stage) return this;
        this.stage.setAttribute('data-state', this.state);
        this.updateDockPrimaryUI();
        this.updateControlGates();
        if (this.state === 'records') this.openRecords();
        else if (this.recordsDrawer && this.recordsDrawer.classList.contains('is-open')) this.closeRecords();
        return this;
    };

    StageUi.prototype.update = function (data) {
        data = data || {};
        if (!this.stage) return this;
        if (data.prize !== undefined) this.updatePrize(data.prize);
        if (data.speedPreset !== undefined) this.setSpeedPreset(data.speedPreset);
        if (data.prizeSettingsEnabled !== undefined) this.prizeSettingsEnabled = !!data.prizeSettingsEnabled;
        if (data.state !== undefined) this.setState(data.state);
        if (data.prizeSettingsVisible !== undefined) this.setPrizeSettingsVisible(data.prizeSettingsVisible);
        if (data.primaryText !== undefined) this.updateDockPrimaryUI(data.primaryText);
        if (data.primaryEnabled !== undefined && this.state === 'ready') this.btnPrimary.disabled = !data.primaryEnabled;
        return this;
    };

    StageUi.prototype.handleDocumentClick = function (event) {
        if (this.speedPopover && this.speedPopover.classList.contains('is-open') && !this.speedPopover.contains(event.target) && !this.btnSpeed.contains(event.target)) {
            this.closeSpeedPopover();
        }
    };

    StageUi.prototype.handleKeyDown = function (event) {
        if (event.key !== 'Escape' && event.keyCode !== 27) return;
        if (this.recordsDrawer && this.recordsDrawer.classList.contains('is-open')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.closeRecords();
            this.triggerCallback('onRecordsClose');
        } else if (this.speedPopover && this.speedPopover.classList.contains('is-open')) {
            this.closeSpeedPopover();
        }
    };

    StageUi.prototype.destroy = function () {
        var doc = this.root && (this.root.ownerDocument || document);
        if (doc) {
            doc.removeEventListener('click', this.boundDocClick);
            doc.removeEventListener('keydown', this.boundKeyDown, true);
        }
        if (this.stage && this.stage.parentNode) this.stage.parentNode.removeChild(this.stage);
        if (this.root) this.root.classList.remove('screen-stage-ui-enabled');
        this.stage = null;
        this.resultPanel = null;
        this.resultList = null;
        this.btnPrizeSettings = null;
        this.btnPrizeSettingsText = null;
        this.prizeSettingsVisible = false;
        this.prizeSettingsEnabled = false;
        this.recordsDrawer = null;
        return this;
    };

    return {
        create: function (options) { return new StageUi(options); },
        normalizeCandidate: normalizeCandidate
    };
});
