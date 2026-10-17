/* Presentation only: consumes confirmed, privacy-formatted ImportCJ winners. */
define([], function () {
    'use strict';
    function text(value) { return value == null ? '' : String(value).trim(); }
    function fieldIndex(value, fallback) {
        return /^[1-4]$/.test(String(value)) ? Number(value) - 1 : fallback;
    }

    function safeColor(value, doc) {
        var color = text(value);
        if (!color || color.length > 64 || /[;"'{}]/.test(color) || /var\s*\(|url\s*\(|^(inherit|initial|unset|revert|revert-layer|currentcolor)$/i.test(color)) return '';
        var probe = doc.createElement('span');
        probe.style.color = color;
        return probe.style.color;
    }
    function applyCardBackground(host, config) {
        var color = config.resultcardmode === 'custom' ? safeColor(config.resultcardcolor, host.ownerDocument) : '';
        if (color) host.style.setProperty('--import-card-background', color);
        else host.style.removeProperty('--import-card-background');
    }

    // Never modify the controller's result objects or undo its privacy masking.
    function selectFields(value, config, fieldConfig) {
        if (Array.isArray(value)) return value.map(function (item) { return selectFields(item, config, fieldConfig); });
        if (!value || typeof value !== 'object') value = { name: text(value) };
        var copy = {};
        Object.keys(value).forEach(function (key) { copy[key] = value[key]; });
        var grouped = false;
        ['roundawards', 'luckers', 'winners'].forEach(function (key) {
            if (Array.isArray(value[key])) { copy[key] = selectFields(value[key], config, fieldConfig); grouped = true; }
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
            (Array.isArray(value.showitems) && value.showitems.length ? value.showitems.map(text) :
            [text(value.name == null ? value.nickname : value.name)].concat((value.extras || []).map(text)));
        var available = [0, 1, 2, 3].filter(function (i) { return fieldConfig && fieldConfig.length ? !!fieldConfig[i] : !!fields[i]; });
        var primary = fieldIndex(config.resultmainfield, 0);
        var remaining = available.filter(function (i) { return i !== primary; });
        var extras = [];
        for (var slot = 1; slot <= 3; slot++) {
            var selected = config['resultextra' + slot];
            var index = selected === undefined || selected === 'auto' ? remaining[slot - 1] : fieldIndex(selected, -1);
            if (available.indexOf(index) >= 0 && index !== primary && extras.indexOf(index) < 0) extras.push(index);
        }
        if (!fields[primary]) {
            var fallback = extras.filter(function (i) { return !!fields[i]; });
            if (fallback.length) primary = fallback[0];
        }
        copy.name = fields[primary] || '信息缺失';
        copy.displayFields = [primary].concat(extras.filter(function (i) { return i !== primary; })).map(function (i, slot) {
            return { index: i, color: fieldConfig && fieldConfig[i] && fieldConfig[i].fieldcolor, label: text(fieldConfig && fieldConfig[i] && fieldConfig[i].fieldname) || '字段' + (i + 1), value: fields[i] || (slot ? '—' : '信息缺失') };
        });
        copy.extras = copy.displayFields.slice(1).map(function (field) { return field.value; });
        return copy;
    }

    // Shared DOM hierarchy for ImportCJ result and records; no HTML from imported values.
    function fillFields(card, winner) {
        card.querySelectorAll('[data-field-value]').forEach(function (node) {
            var field = winner.displayFields[Number(node.getAttribute('data-field-value'))];
            node.textContent = field.value;
            node.title = field.value;
            node.style.color = safeColor(field.color, card.ownerDocument);
        });
    }
    function appendFields(card, winner, prefix, pending) {
        var doc = card.ownerDocument, fields = winner.displayFields;
        function el(tag, cls, parent) {
            var node = doc.createElement(tag); node.className = prefix + '-' + cls; parent.appendChild(node); return node;
        }
        el('div', 'main', card).setAttribute('data-field-value', '0');
        if (fields.length >= 2) el('div', 'secondary', card).setAttribute('data-field-value', '1');
        if (fields.length >= 3) {
            var bottom = el('div', 'fields', card);
            bottom.style.gridTemplateColumns = 'repeat(' + (fields.length - 2) + ', minmax(0, 1fr))';
            fields.slice(2).forEach(function (field, i) {
                var cell = el('div', 'field', bottom);
                el('em', 'label', cell).textContent = field.label;
                el('b', 'extra', cell).setAttribute('data-field-value', String(i + 2));
            });
        }
        if (!pending) fillFields(card, winner);
    }

    // Field-dependent geometry from 中奖界面布局演示（动效版） (2).html.
    var HF = [1.9, 2.4, 3.2, 3.2], WF = [2.6, 2.8, 3.8, 3.8];
    function best(m, aw, ah, H, f) {
        var b = null;
        for (var c = 1; c <= m; c++) {
            var r = Math.ceil(m / c), g = Math.min(aw, ah) * .03;
            var cw = (aw - (c - 1) * g) / c, ch = (ah - (r - 1) * g) / r;
            var fs = Math.min(ch / HF[f - 1], cw / WF[f - 1], H * .24);
            if (!b || fs > b.fs + .5) b = { c: c, r: r, g: g, cw: cw, ch: ch, fs: fs };
        }
        return b;
    }
    function ResultView(options) {
        this.host = options.host;
        this.doc = this.host.ownerDocument;
        this.win = this.doc.defaultView;
        this.config = options.config || {};
        this.fieldConfig = options.fieldConfig || [];
        this.normalizeGroups = options.normalizeGroups;
        this.groups = [];
        this.pages = [];
        this.pageIndex = 0;
        this.total = 0;
        this.active = false;
        this.firstReveal = false;
        this.revealInProgress = false;
        this.revealedWinners = new Set();
        this.timers = [];
        this.rotation = null;
        this.resizeTimer = null;
        this.mount();
    }
    ResultView.prototype.element = function (tag, className, value) {
        var el = this.doc.createElement(tag);
        el.className = className;
        if (value !== undefined) el.textContent = value;
        return el;
    };
    ResultView.prototype.later = function (fn, delay) {
        var self = this;
        var id = this.win.setTimeout(function () {
            self.timers = self.timers.filter(function (timer) { return timer !== id; });
            fn();
        }, delay);
        this.timers.push(id);
    };
    ResultView.prototype.mount = function () {
        var self = this;
        this.el = this.element('section', 'import-result');
        applyCardBackground(this.el, this.config);
        this.el.setAttribute('aria-label', '中奖结果');
        this.el.hidden = true;
        this.content = this.element('div', 'import-result-content');
        this.header = this.element('header', 'import-result-header');
        this.image = this.element('img', 'import-result-image');
        this.image.alt = '奖品图片';
        this.image.onerror = function () { self.image.hidden = true; };
        this.title = this.element('h2', 'import-result-title');
        this.header.appendChild(this.image);
        this.header.appendChild(this.title);
        this.board = this.element('div', 'import-result-board');
        this.board.setAttribute('role', 'list');
        this.pager = this.element('div', 'import-result-pager');
        this.pager.setAttribute('aria-live', 'polite');
        this.content.appendChild(this.header);
        this.content.appendChild(this.board);
        this.content.appendChild(this.pager);
        this.el.appendChild(this.content);
        this.host.insertBefore(this.el, this.host.firstChild);
        this.onResize = function () {
            self.win.clearTimeout(self.resizeTimer);
            self.resizeTimer = self.win.setTimeout(function () {
                self.resizeTimer = null;
                if (self.active && self.layoutSize !== self.sizeKey()) self.layout();
            }, 150);
        };
        this.onVisibility = function () {
            if (!self.active) return;
            self.stopAll();
            self.revealInProgress = false;
            self.renderedPage = null;
            if (!self.doc.hidden) { self.render(false, false); self.startRotation(); }
        };
        this.win.addEventListener('resize', this.onResize);
        this.doc.addEventListener('visibilitychange', this.onVisibility);
        if (this.win.ResizeObserver) {
            this.observer = new this.win.ResizeObserver(this.onResize);
            this.observer.observe(this.host);
            var dock = this.host.querySelector('.screen-stage-dock');
            if (dock) this.observer.observe(dock);
        }
        if (this.win.MutationObserver) {
            this.styleObserver = new this.win.MutationObserver(this.onResize);
            this.styleObserver.observe(this.host.parentElement, { attributes: true, attributeFilter: ['style'] });
        }
    };
    ResultView.prototype.setData = function (values, prize) {
        this.stopAll();
        this.groups = this.normalizeGroups(selectFields(values, this.config, this.fieldConfig), prize).groups;
        this.fieldCount = Math.max(1, this.groups.reduce(function (max, group) {
            return group.winners.reduce(function (n, winner) { return Math.max(n, winner.displayFields.length); }, max);
        }, 1));
        this.total = this.groups.reduce(function (count, group) { return count + group.winners.length; }, 0);
        this.pageIndex = 0;
        this.pages = [];
        this.renderedPage = null;
        this.revealInProgress = false;
        this.revealedWinners.clear();
        this.firstReveal = true;
        if (this.active) this.layout();
    };
    ResultView.prototype.setActive = function (active) {
        if (this.active === active) return;
        this.active = active;
        this.el.hidden = !active;
        if (active) this.layout();
        else { this.stopAll(); this.revealInProgress = false; this.renderedPage = null; }
    };
    ResultView.prototype.sizeKey = function () {
        var dock = this.host.querySelector('.screen-stage-dock');
        return [this.host.clientWidth, this.host.clientHeight, dock && dock.offsetTop, dock && dock.offsetHeight].join(':');
    };
    ResultView.prototype.setHeading = function (group) {
        group = group || {};
        this.title.textContent = group.prizename || '中奖结果';
        var src = text(group.prizeimg);
        var show = this.total <= 3 && this.width > this.height && /^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(src);
        this.image.hidden = !show;
        if (show && this.image.getAttribute('src') !== src) this.image.src = src;
        this.title.style.maxWidth = (show ? .9 * this.width - .265 * this.unit : .9 * this.width) + 'px';
    };
    ResultView.prototype.layout = function () {
        if (!this.active || !this.host.clientWidth || !this.host.clientHeight) return;
        // The existing control dock occupies the demo's external toolbar area.
        var dock = this.host.querySelector('.screen-stage-dock');
        var ratio = this.host.clientWidth / this.host.clientHeight;
        var maxH = Math.max(1, (dock ? dock.offsetTop : this.host.clientHeight) - 6);
        var W = this.host.clientWidth, H = W / ratio;
        if (H > maxH) { H = maxH; W = H * ratio; }
        this.width = W; this.height = H;
        var u = this.unit = Math.min(H, W * 9 / 16);
        this.content.style.width = W + 'px';
        this.content.style.height = H + 'px';
        this.header.style.top = .05 * u + 'px';
        this.image.style.width = .225 * u + 'px';
        this.image.style.height = .15 * u + 'px';
        this.image.style.marginRight = .04 * u + 'px';
        this.title.style.fontSize = .063 * u + 'px';
        this.title.style.marginTop = .012 * u + 'px';
        var n = this.total, aw = .9 * W, top = .27 * u;
        var m = n, ah = H * .93 - top;
        if (n && best(n, aw, ah, H, this.fieldCount).fs < .07 * H) {
            ah = H * .88 - top;
            for (m = Math.min(15, n); m > 1; m--) if (best(m, aw, ah, H, this.fieldCount).fs >= .07 * H) break;
        }
        this.cardLayout = n ? best(m, aw, ah, H, this.fieldCount) : null;
        this.capacity = m;
        this.board.style.cssText = 'left:' + (W - aw) / 2 + 'px;top:' + top + 'px;width:' + aw + 'px;height:' + ah + 'px';
        this.pager.style.top = H * .9 + 'px';
        this.pager.style.fontSize = .026 * u + 'px';
        var old = this.pages[this.pageIndex], pages = [];
        this.groups.forEach(function (group, groupIndex) {
            for (var start = 0; start < group.winners.length; start += m) {
                pages.push({ group: group, groupIndex: groupIndex, start: start, winners: group.winners.slice(start, start + m) });
            }
        });
        this.pages = pages;
        this.pageIndex = old ? Math.max(0, pages.findIndex(function (page) {
            return page.groupIndex === old.groupIndex && page.start <= old.start && page.start + page.winners.length > old.start;
        })) : 0;
        var reveal = (this.firstReveal || this.revealInProgress) && !this.doc.hidden;
        var page = pages[this.pageIndex], previous = this.renderedPage;
        var samePage = previous && page && previous.group === page.group && previous.start === page.start && previous.winners.length === page.winners.length;
        if (samePage) {
            // A resize or dock adjustment must not replace nodes or restart their effects.
            this.setHeading(page.group);
            this.pager.textContent = this.pages.length > 1 ? '第 ' + (this.pageIndex + 1) + ' / ' + this.pages.length + ' 页' : '';
            this.sizeCards();
            this.renderedPage = page;
            this.layoutSize = this.sizeKey();
            return;
        }
        this.stopAll();
        this.render(reveal, false);
        this.firstReveal = false;
        // Keep the reading time after reveal, without the demo's removed number-roll delay.
        var count = pages[this.pageIndex] ? pages[this.pageIndex].winners.length : 0;
        var delay = count && reveal && !this.reducedMotion() ? count * Math.min(380, 2200 / count) + 2500 : 0;
        this.startRotation(delay);
        this.layoutSize = this.sizeKey();
    };
    ResultView.prototype.reducedMotion = function () {
        return this.win.matchMedia && this.win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };
    ResultView.prototype.sizeCards = function () {
        var lay = this.cardLayout, H = this.height;
        var inner = this.board.querySelector('.import-result-inner');
        if (!lay || !inner) return;
        var cardW = Math.min(lay.cw, lay.fs * Math.max(3.6, WF[this.fieldCount - 1])), cardH = Math.min(lay.ch, lay.fs * HF[this.fieldCount - 1]);
        inner.style.cssText = 'width:' + (lay.c * cardW + (lay.c - 1) * lay.g) + 'px;gap:' + lay.g + 'px';
        inner.querySelectorAll('.import-result-card').forEach(function (card) {
            card.style.cssText = '--fs:' + lay.fs + 'px;width:' + cardW + 'px;height:' + cardH + 'px;border-width:' + Math.max(2, H * .003) + 'px;border-radius:' + Math.min(28, cardH * .1) + 'px';
            card.querySelector('.import-result-main').style.fontSize = lay.fs + 'px';
        });
    };
    ResultView.prototype.render = function (reveal, pageTransition) {
        this.board.textContent = '';
        this.content.querySelectorAll('.import-result-particle').forEach(function (p) { p.remove(); });
        var page = this.pages[this.pageIndex], self = this;
        this.renderedPage = page;
        this.setHeading(page && page.group);
        this.pager.textContent = this.pages.length > 1 ? '第 ' + (this.pageIndex + 1) + ' / ' + this.pages.length + ' 页' : '';
        if (!page) { this.board.appendChild(this.element('div', 'import-result-empty', '暂无中奖结果')); return; }
        var inner = this.element('div', 'import-result-inner');
        this.board.appendChild(inner);
        var reduced = this.reducedMotion(), count = page.winners.length, reveals = [];
        this.revealInProgress = reveal && !reduced;
        page.winners.forEach(function (winner, i) {
            var pending = reveal && !reduced && !self.revealedWinners.has(winner);
            var card = self.element('div', 'import-result-card' + (pending ? ' is-pending' : (pageTransition && !reduced ? ' done' : '')));
            card.setAttribute('role', 'listitem');
            if (pending) card.setAttribute('aria-hidden', 'true');
            // Keep the complete card concealed and its fields empty until its reveal.
            appendFields(card, winner, 'import-result', pending);
            inner.appendChild(card);
            if (pending) reveals.push({ delay: i * Math.min(380, 2200 / count), run: function () {
                fillFields(card, winner);
                card.removeAttribute('aria-hidden');
                card.classList.remove('is-pending');
                card.classList.add('done', 'sw');
                self.revealedWinners.add(winner);
                if (!self.board.querySelector('.is-pending')) self.revealInProgress = false;
                if (i < 12) self.burst(card, count > 6 ? 8 : 14);
            } });
        });
        this.sizeCards();
        reveals.forEach(function (effect) {
            // The first card enters in this render, not after a timer or a blank frame.
            if (!effect.delay) effect.run();
            else self.later(effect.run, effect.delay);
        });
        if (!this.board.querySelector('.is-pending')) this.revealInProgress = false;
    };
    ResultView.prototype.burst = function (card, count) {
        var r = card.getBoundingClientRect(), f = this.content.getBoundingClientRect();
        // Convert viewport pixels to local pixels so CSS zoom does not move the burst.
        var k = f.width / this.width;
        var cx = (r.left - f.left + r.width / 2) / k, cy = (r.top - f.top + r.height / 2) / k;
        var colors = ['#ffe29a', '#f0c96b', '#fff', '#e8803a'], self = this;
        for (var i = 0; i < count; i++) {
            var particle = this.element('div', 'import-result-particle');
            particle.style.left = cx + 'px'; particle.style.top = cy + 'px'; particle.style.background = colors[i % 4];
            var angle = Math.random() * Math.PI * 2, distance = (.08 + Math.random() * .12) * this.unit;
            particle.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--dy', Math.sin(angle) * distance - this.unit * .03 + 'px');
            this.content.appendChild(particle);
            (function (p) { self.later(function () { p.remove(); }, 1400); })(particle);
        }
    };
    ResultView.prototype.startRotation = function (delay) {
        if (!this.active || this.doc.hidden || this.pages.length < 2) return;
        var self = this;
        function start() {
            self.rotation = self.win.setInterval(function () {
                self.pageIndex = (self.pageIndex + 1) % self.pages.length;
                self.render(false, true);
            }, 4000);
        }
        if (delay) this.later(start, delay); else start();
    };
    ResultView.prototype.stopAll = function () {
        var self = this;
        this.timers.forEach(function (timer) { self.win.clearTimeout(timer); });
        this.timers = [];
        this.win.clearInterval(this.rotation);
        this.rotation = null;
        if (this.content) this.content.querySelectorAll('.import-result-particle').forEach(function (p) { p.remove(); });
    };
    ResultView.prototype.destroy = function () {
        this.stopAll();
        this.win.clearTimeout(this.resizeTimer);
        if (this.observer) this.observer.disconnect();
        if (this.styleObserver) this.styleObserver.disconnect();
        this.win.removeEventListener('resize', this.onResize);
        this.doc.removeEventListener('visibilitychange', this.onVisibility);
        this.image.onerror = null;
        this.el.remove();
        this.active = false;
    };
    return { create: function (options) { return new ResultView(options); }, selectFields: selectFields, appendFields: appendFields, applyCardBackground: applyCardBackground };
});
