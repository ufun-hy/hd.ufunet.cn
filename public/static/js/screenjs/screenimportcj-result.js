/* Presentation only: consumes confirmed, privacy-formatted ImportCJ winners. */
define([], function () {
    'use strict';
    var FONT = 'Arial, "PingFang SC", "Microsoft YaHei", sans-serif';
    function text(value) { return value == null ? '' : String(value).trim(); }
    function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
    function fieldIndex(value, fallback) {
        return /^[1-4]$/.test(String(value)) ? Number(value) - 1 : fallback;
    }

    // Never modify the controller's result objects or undo its privacy masking.
    function selectFields(value, config) {
        if (Array.isArray(value)) return value.map(function (item) { return selectFields(item, config); });
        if (!value || typeof value !== 'object') value = { name: text(value) };
        var copy = {};
        Object.keys(value).forEach(function (key) { copy[key] = value[key]; });
        var grouped = false;
        ['roundawards', 'luckers', 'winners'].forEach(function (key) {
            if (Array.isArray(value[key])) { copy[key] = selectFields(value[key], config); grouped = true; }
        });
        if (grouped) {
            // Some round APIs put prize metadata beside luckers rather than inside prize.
            if (!copy.prize && !copy.award && (Array.isArray(copy.luckers) || Array.isArray(copy.winners))) {
                copy.prize = {};
                ['awardname', 'roundtitle', 'prizename', 'prizeimg', 'image', 'prizeid', 'id', 'num'].forEach(function (key) {
                    if (copy[key] !== undefined) copy.prize[key] = copy[key];
                });
            }
            return copy;
        }
        var imported = [1, 2, 3, 4].some(function (i) { return Object.prototype.hasOwnProperty.call(value, 'datafield' + i); });
        var fields = imported ? [1, 2, 3, 4].map(function (i) { return text(value['datafield' + i]); }) :
            [text(value.name || value.nickname || (value.showitems || [])[0])].concat((value.extras || []).map(text));
        var primary = fieldIndex(config.resultmainfield, 0);
        var remaining = [0, 1, 2, 3].filter(function (i) { return i !== primary; });
        var extras = [];
        for (var slot = 1; slot <= 3; slot++) {
            var selected = config['resultextra' + slot];
            var index = selected === undefined || selected === 'auto' ? remaining[slot - 1] : fieldIndex(selected, -1);
            if (index >= 0 && index !== primary && extras.indexOf(index) < 0) extras.push(index);
        }
        if (!fields[primary]) {
            var fallback = extras.filter(function (i) { return !!fields[i]; });
            if (fallback.length) primary = fallback[0];
        }
        copy.name = fields[primary] || '信息缺失';
        copy.extras = extras.filter(function (i) { return i !== primary && !!fields[i]; }).map(function (i) { return fields[i]; });
        return copy;
    }

    function ResultView(options) {
        this.host = options.host;
        this.doc = this.host.ownerDocument;
        this.win = this.doc.defaultView;
        this.config = options.config || {};
        this.normalizeGroups = options.normalizeGroups;
        this.interval = clamp(Number(this.config.resultinterval) || 8, 4, 60) * 1000;
        this.groups = [];
        this.pages = [];
        this.pageIndex = 0;
        this.total = 0;
        this.active = false;
        this.paused = false;
        this.firstReveal = false;
        this.timer = null;
        this.frame = null;
        this.canvas = this.doc.createElement('canvas').getContext('2d');
        this.mount();
    }
    ResultView.prototype.element = function (tag, className, value) {
        var el = this.doc.createElement(tag);
        el.className = className;
        if (value !== undefined) el.textContent = value;
        return el;
    };
    ResultView.prototype.mount = function () {
        var self = this;
        this.el = this.element('section', 'import-result');
        this.el.setAttribute('aria-label', '中奖结果');
        this.el.hidden = true;
        this.content = this.element('div', 'import-result-content');
        this.header = this.element('header', 'import-result-header');
        this.award = this.element('div', 'import-result-award');
        this.titleRow = this.element('div', 'import-result-title-row');
        this.title = this.element('h2', 'import-result-title');
        this.image = this.element('img', 'import-result-image');
        this.image.alt = '奖品图片';
        this.image.onerror = function () { self.image.hidden = true; };
        this.titleRow.appendChild(this.title);
        this.titleRow.appendChild(this.image);
        this.count = this.element('div', 'import-result-count');
        this.header.appendChild(this.award);
        this.header.appendChild(this.titleRow);
        this.header.appendChild(this.count);
        this.board = this.element('div', 'import-result-board');
        this.board.setAttribute('role', 'list');
        this.pager = this.element('nav', 'import-result-pager');
        this.pager.setAttribute('aria-label', '中奖结果分页');
        function button(label, action) {
            var el = self.element('button', 'import-result-page-button', label);
            el.type = 'button';
            el.addEventListener('click', action);
            self.pager.appendChild(el);
            return el;
        }
        this.prev = button('上一页', function () { self.changePage(-1, true); });
        this.pageLabel = this.element('span', 'import-result-page-label');
        this.pageLabel.setAttribute('aria-live', 'polite');
        this.pager.appendChild(this.pageLabel);
        this.next = button('下一页', function () { self.changePage(1, true); });
        this.pause = button('暂停轮播', function () {
            self.paused = !self.paused;
            self.updatePager();
            self.schedule(0);
        });
        this.content.appendChild(this.header);
        this.content.appendChild(this.board);
        this.content.appendChild(this.pager);
        this.el.appendChild(this.content);
        this.host.insertBefore(this.el, this.host.firstChild);
        this.onResize = function () {
            if (!self.active || self.frame !== null) return;
            self.frame = self.win.requestAnimationFrame(function () {
                self.frame = null;
                if (self.layoutSize !== self.sizeKey()) self.layout();
            });
        };
        this.onVisibility = function () { self.schedule(0); };
        this.win.addEventListener('resize', this.onResize);
        this.doc.addEventListener('visibilitychange', this.onVisibility);
        if (this.win.ResizeObserver) {
            this.observer = new this.win.ResizeObserver(this.onResize);
            this.observer.observe(this.host);
            this.observer.observe(this.board);
        }
        if (this.win.MutationObserver) {
            this.styleObserver = new this.win.MutationObserver(this.onResize);
            this.styleObserver.observe(this.host.parentElement, { attributes: true, attributeFilter: ['style'] });
        }
        this.onKey = function (event) {
            if (!self.active || self.pages.length < 2 || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                event.stopImmediatePropagation();
                self.changePage(event.key === 'ArrowLeft' ? -1 : 1, true);
            }
        };
        this.doc.addEventListener('keydown', this.onKey, true);
    };
    ResultView.prototype.setData = function (values, prize) {
        this.clearTimer();
        this.groups = this.normalizeGroups(selectFields(values, this.config), prize).groups;
        this.total = this.groups.reduce(function (count, group) { return count + group.winners.length; }, 0);
        this.pageIndex = 0;
        this.pages = [];
        this.paused = false;
        this.firstReveal = true;
        if (this.active) this.layout();
    };
    ResultView.prototype.setActive = function (active) {
        if (this.active === active) return;
        this.active = active;
        this.el.hidden = !active;
        if (active) this.layout();
        else {
            this.clearTimer();
            // Returning from records must not replay the reveal.
            this.board.querySelectorAll('.is-revealing,.is-entering').forEach(function (el) { el.classList.remove('is-revealing', 'is-entering'); });
        }
    };
    ResultView.prototype.measure = function (value, weight) {
        this.canvas.font = weight + ' 100px ' + FONT;
        return this.canvas.measureText(value).width / 100;
    };
    ResultView.prototype.setHeading = function (group) {
        group = group || {};
        this.award.textContent = group.awardname || '';
        this.award.hidden = !group.awardname;
        this.title.textContent = group.prizename || (group.awardname ? '' : '中奖结果');
        this.title.hidden = !this.title.textContent;
        this.count.textContent = this.groups.length > 1 ? '本奖项 ' + (group.winners || []).length + ' 名 · 本轮共 ' + this.total + ' 名' : '共 ' + this.total + ' 名';
        var src = text(group.prizeimg);
        var show = this.total <= 3 && this.width >= this.height && /^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(src);
        this.image.hidden = !show;
        if (show && this.image.getAttribute('src') !== src) this.image.src = src;
    };
    ResultView.prototype.metrics = function (winners) {
        var self = this;
        return winners.map(function (winner) {
            return { main: self.measure(winner.name, 800), extras: winner.extras.map(function (extra) { return self.measure(extra, 600); }) };
        });
    };
    ResultView.prototype.chooseLayout = function (count, metrics, width, height) {
        var maxCols = this.width < this.height ? 2 : 5;
        var gap = this.gap, minFont = this.height * .045, best = null;
        var preferred = count <= 3 ? count : (count <= 4 ? 2 : (count <= 6 ? 3 : (count <= 8 ? 4 : (count <= 10 ? 5 : 4))));
        for (var cols = 1; cols <= Math.min(count, maxCols); cols++) {
            var rows = Math.ceil(count / cols);
            var cardWidth = (width - gap * (cols - 1)) / cols;
            if (count === 1) cardWidth = Math.min(cardWidth, this.width * (this.width < this.height ? .86 : .46));
            var cardHeight = Math.min((height - gap * (rows - 1)) / rows, this.height * .44);
            var pad = Math.min(cardWidth, cardHeight) * .10;
            var innerWidth = cardWidth - pad * 2 - 6, innerHeight = cardHeight - pad * 2 - 6;
            var mainSize = this.height * .215, extraSize = this.height * .047;
            var extraMin = this.height * .022;
            metrics.forEach(function (metric) {
                metric.extras.forEach(function (size) { extraSize = Math.min(extraSize, innerWidth / Math.max(size, 1)); });
            });
            extraSize = Math.max(extraMin, extraSize);
            metrics.forEach(function (metric) {
                var lines = metric.extras.reduce(function (n, size) { return n + Math.max(1, Math.ceil(size * extraSize / innerWidth)); }, 0);
                var extraHeight = lines ? lines * extraSize * 1.3 + gap * 1.4 : 0;
                mainSize = Math.min(mainSize, innerWidth / Math.max(metric.main, 1), (innerHeight - extraHeight) / 1.12);
            });
            if (mainSize < minFont || cardHeight <= 0) continue;
            var score = mainSize * (cols === preferred ? 1.25 : 1);
            if (!best || score > best.score) best = { cols: cols, rows: rows, width: cardWidth, height: cardHeight, main: mainSize, extra: Math.min(extraSize, mainSize * .38), pad: pad, score: score };
        }
        return best;
    };
    ResultView.prototype.sizeKey = function () {
        var dock = this.host.querySelector('.screen-stage-dock');
        return [this.host.clientWidth, this.host.clientHeight, this.board.clientWidth, this.board.clientHeight, dock && this.win.getComputedStyle(dock).bottom].join(':');
    };
    ResultView.prototype.layout = function () {
        if (!this.active) return;
        this.width = this.host.clientWidth;
        this.height = this.host.clientHeight;
        if (!this.width || !this.height) return;
        var scale = Math.min(this.width / 1920, this.height / 1080);
        this.gap = Math.max(8, 24 * scale);
        this.el.style.setProperty('--ir-scale', scale);
        this.el.style.setProperty('--ir-gap', this.gap + 'px');
        this.content.style.width = Math.min(this.width * (this.width < this.height ? .88 : .80), this.height * 1.6) + 'px';
        this.content.style.top = Math.max(12, this.height * .065) + 'px';
        var dock = this.host.querySelector('.screen-stage-dock');
        var dockStyle = dock && this.win.getComputedStyle(dock);
        var bottom = dock ? (parseFloat(dockStyle.bottom) || 24) + dock.offsetHeight + this.gap : this.height * .08;
        this.content.style.bottom = bottom + 'px';
        var old = this.pages[this.pageIndex];
        var self = this, pages = [];
        // Reserve the tallest heading so differently named prizes never resize the grid mid-cycle.
        this.header.style.minHeight = '';
        var headerHeight = 0;
        this.groups.forEach(function (group) { self.setHeading(group); headerHeight = Math.max(headerHeight, self.header.offsetHeight); });
        this.header.style.minHeight = headerHeight + 'px';
        this.pager.hidden = false;
        var width = this.board.clientWidth, height = this.board.clientHeight;
        this.groups.forEach(function (group, groupIndex) {
            var metrics = self.metrics(group.winners);
            var capacity = Math.min(12, group.winners.length), layout;
            while (capacity > 0) {
                layout = self.chooseLayout(capacity, metrics, width, height);
                if (layout || capacity === 1) break;
                capacity--;
            }
            if (!layout) layout = { cols: 1, rows: 1, width: width, height: height, main: self.height * .045, extra: self.height * .025, pad: self.gap, wrapped: true };
            for (var start = 0; start < group.winners.length; start += capacity) {
                var winners = group.winners.slice(start, start + capacity);
                var pageLayout = winners.length === capacity ? layout : self.chooseLayout(winners.length, metrics.slice(start, start + capacity), width, height) || layout;
                pages.push({ group: group, groupIndex: groupIndex, start: start, winners: winners, layout: pageLayout });
            }
        });
        this.pages = pages;
        if (old) {
            var anchor = pages.findIndex(function (page) { return page.groupIndex === old.groupIndex && page.start <= old.start && page.start + page.winners.length > old.start; });
            this.pageIndex = Math.max(0, anchor);
        }
        this.pageIndex = Math.min(this.pageIndex, Math.max(0, pages.length - 1));
        this.render(this.firstReveal);
        this.firstReveal = false;
        this.layoutSize = this.sizeKey();
    };
    ResultView.prototype.render = function (reveal) {
        this.clearTimer();
        var page = this.pages[this.pageIndex], self = this;
        this.board.textContent = '';
        if (!page) {
            this.setHeading(null);
            this.board.appendChild(this.element('div', 'import-result-empty', '暂无中奖结果'));
            this.pager.hidden = true;
            return;
        }
        this.setHeading(page.group);
        var layout = page.layout;
        this.board.style.setProperty('--ir-main-size', layout.main + 'px');
        this.board.style.setProperty('--ir-extra-size', layout.extra + 'px');
        this.board.style.setProperty('--ir-card-pad', layout.pad + 'px');
        var reduced = this.win.matchMedia && this.win.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var lastDelay = 0;
        page.winners.forEach(function (winner, index) {
            var card = self.element('div', 'import-result-card' + (layout.wrapped ? ' is-wrapped' : '') + (!reduced ? (reveal ? ' is-revealing' : ' is-entering') : ''));
            card.setAttribute('role', 'listitem');
            card.style.width = layout.width + 'px';
            card.style.height = layout.height + 'px';
            var delay = reveal ? (page.winners.length <= 6 ? index * .16 : Math.floor(index / layout.cols) * .22) : 0;
            lastDelay = Math.max(lastDelay, delay);
            card.style.setProperty('--ir-delay', delay + 's');
            var body = self.element('div', 'import-result-card-body');
            body.appendChild(self.element('strong', 'import-result-main', winner.name));
            if (winner.extras.length) {
                var extras = self.element('div', 'import-result-extras');
                winner.extras.forEach(function (extra) { extras.appendChild(self.element('div', 'import-result-extra', extra)); });
                body.appendChild(extras);
            }
            card.appendChild(body);
            // Extreme multi-line content remains fully accessible instead of being truncated.
            if (layout.wrapped) { card.tabIndex = 0; card.setAttribute('aria-label', winner.name + ' ' + winner.extras.join(' ')); }
            self.board.appendChild(card);
        });
        this.updatePager();
        this.schedule(reveal && !reduced ? Math.min(2000, (lastDelay + .9) * 1000) : 0);
    };
    ResultView.prototype.updatePager = function () {
        this.pager.hidden = this.pages.length <= 1;
        this.pageLabel.textContent = (this.pageIndex + 1) + ' / ' + this.pages.length + ' 页 · 共 ' + this.total + ' 名';
        this.pause.textContent = this.paused ? '继续轮播' : '暂停轮播';
        this.pause.setAttribute('aria-pressed', this.paused ? 'true' : 'false');
    };
    ResultView.prototype.changePage = function (step, manual) {
        if (!this.active || this.pages.length < 2) return;
        if (manual) this.paused = true;
        this.pageIndex = (this.pageIndex + step + this.pages.length) % this.pages.length;
        this.render(false);
    };
    ResultView.prototype.clearTimer = function () {
        if (this.timer !== null) this.win.clearTimeout(this.timer);
        this.timer = null;
    };
    ResultView.prototype.schedule = function (revealTime) {
        this.clearTimer();
        if (!this.active || this.paused || this.doc.hidden || this.pages.length < 2) return;
        var self = this;
        this.timer = this.win.setTimeout(function () { self.timer = null; self.changePage(1, false); }, this.interval + revealTime);
    };
    ResultView.prototype.destroy = function () {
        this.clearTimer();
        if (this.frame !== null) this.win.cancelAnimationFrame(this.frame);
        if (this.observer) this.observer.disconnect();
        if (this.styleObserver) this.styleObserver.disconnect();
        this.win.removeEventListener('resize', this.onResize);
        this.doc.removeEventListener('visibilitychange', this.onVisibility);
        this.doc.removeEventListener('keydown', this.onKey, true);
        this.image.onerror = null;
        this.el.remove();
        this.active = false;
    };
    return { create: function (options) { return new ResultView(options); }, selectFields: selectFields };
});
