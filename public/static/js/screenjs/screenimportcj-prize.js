/*
 * 导入名单抽奖共享奖品展示组件。
 * 只负责奖品视觉、奖品选择和单次抽取数量；业务状态与接口仍由 screenimportcj.js 管理。
 */
define([], function () {
    'use strict';

    function asText(value) {
        return value === null || value === undefined ? '' : String(value).replace(/^\s+|\s+$/g, '');
    }

    function safeImageUrl(value) {
        value = asText(value);
        if (!value || /^javascript:/i.test(value) || /^data:/i.test(value)) return '';
        return /^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(value) ? value : '';
    }

    function createElement(doc, tag, className, value) {
        var node = doc.createElement(tag);
        if (className) node.className = className;
        if (value !== undefined) node.textContent = value;
        return node;
    }

    function displayQuota(value) {
        if (value === undefined || value === null || String(value).replace(/^\s+|\s+$/g, '') === '') return '';
        var number = Number(value);
        if (!isFinite(number) || number <= 0 || Math.floor(number) !== number) return '';
        return String(value).replace(/^\s+|\s+$/g, '');
    }

    function UnifiedPrize(options) {
        options = options || {};
        this.root = options.root || null;
        this.callbacks = options.callbacks || {};
        this.panel = null;
        this.prize = null;
        this.prizes = [];
        this.prizeIndex = 0;
        this.drawCount = 1;
        this.maxDrawCount = 999;
        this.drawCountReadonly = false;
        this.drawCountLabel = '单次抽取';
        this.drawCountUnit = '人';
        this.state = 'ready';
        this.controlsVisible = false;
        this.refs = {};
        this.boundDocumentClick = this.handleDocumentClick.bind(this);
        this.boundKeyDown = this.handleKeyDown.bind(this);
    }

    UnifiedPrize.prototype.trigger = function (name) {
        if (!this.callbacks || typeof this.callbacks[name] !== 'function') return;
        return this.callbacks[name].apply(null, Array.prototype.slice.call(arguments, 1));
    };

    UnifiedPrize.prototype.mount = function () {
        this.destroy();
        if (!this.root) return this;

        var doc = this.root.ownerDocument || document;
        var panel = createElement(doc, 'section', 'importcj-unified-prize');
        panel.setAttribute('aria-label', '奖品信息');
        panel.setAttribute('data-state', 'ready');

        var award = createElement(doc, 'strong', 'importcj-unified-prize-award', '等待奖项');

        var media = createElement(doc, 'div', 'importcj-unified-prize-media');
        var single = createElement(doc, 'div', 'importcj-unified-prize-single is-missing');
        var image = createElement(doc, 'img');
        image.alt = '奖品图片';
        var placeholder = createElement(doc, 'span', 'importcj-unified-prize-placeholder', '礼');
        single.appendChild(image);
        single.appendChild(placeholder);
        var roundList = createElement(doc, 'div', 'importcj-unified-prize-round-list');
        media.appendChild(single);
        media.appendChild(roundList);

        var info = createElement(doc, 'div', 'importcj-unified-prize-info');
        var name = createElement(doc, 'h2', 'importcj-unified-prize-name', '等待奖品');
        var count = createElement(doc, 'p', 'importcj-unified-prize-count');
        count.appendChild(doc.createTextNode('剩余名额 '));
        var countValue = createElement(doc, 'strong', '', '—');
        count.appendChild(countValue);
        info.appendChild(award);
        info.appendChild(name);
        info.appendChild(count);

        var controls = createElement(doc, 'div', 'importcj-unified-prize-controls');
        var switcher = createElement(doc, 'div', 'importcj-unified-prize-switcher');
        switcher.setAttribute('role', 'group');
        switcher.setAttribute('aria-label', '奖品切换');
        var prev = createElement(doc, 'button', 'importcj-unified-prize-arrow', '‹');
        prev.type = 'button';
        prev.setAttribute('aria-label', '上一奖品');
        var select = createElement(doc, 'button', 'importcj-unified-prize-select', '选择奖品');
        select.type = 'button';
        select.setAttribute('aria-haspopup', 'listbox');
        select.setAttribute('aria-expanded', 'false');
        var next = createElement(doc, 'button', 'importcj-unified-prize-arrow', '›');
        next.type = 'button';
        next.setAttribute('aria-label', '下一奖品');
        switcher.appendChild(prev);
        switcher.appendChild(select);
        switcher.appendChild(next);

        var stepper = createElement(doc, 'div', 'importcj-unified-prize-stepper');
        stepper.setAttribute('role', 'group');
        stepper.setAttribute('aria-label', '单次抽取人数');
        var stepperLabel = createElement(doc, 'span', 'importcj-unified-prize-stepper-label', '单次抽取');
        stepper.appendChild(stepperLabel);
        var decrease = createElement(doc, 'button', 'importcj-unified-prize-step', '−');
        decrease.type = 'button';
        decrease.setAttribute('aria-label', '减少抽取人数');
        var input = createElement(doc, 'input', 'importcj-unified-prize-input');
        input.type = 'text';
        input.value = '1';
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('aria-label', '单次抽取人数');
        var increase = createElement(doc, 'button', 'importcj-unified-prize-step', '+');
        increase.type = 'button';
        increase.setAttribute('aria-label', '增加抽取人数');
        stepper.appendChild(decrease);
        stepper.appendChild(input);
        stepper.appendChild(increase);
        var stepperUnit = createElement(doc, 'span', 'importcj-unified-prize-stepper-unit', '人');
        stepper.appendChild(stepperUnit);

        var menu = createElement(doc, 'div', 'importcj-unified-prize-menu');
        menu.setAttribute('role', 'listbox');
        menu.setAttribute('aria-label', '奖品列表');

        controls.appendChild(switcher);
        controls.appendChild(stepper);
        controls.appendChild(menu);
        panel.appendChild(media);
        panel.appendChild(info);
        panel.appendChild(controls);
        this.root.appendChild(panel);
        this.root.classList.add('importcj-unified-prize-enabled');

        this.panel = panel;
        this.refs = {
            award: award,
            media: media,
            single: single,
            image: image,
            roundList: roundList,
            name: name,
            count: countValue,
            prev: prev,
            select: select,
            next: next,
            decrease: decrease,
            input: input,
            increase: increase,
            stepper: stepper,
            stepperLabel: stepperLabel,
            stepperUnit: stepperUnit,
            menu: menu,
            controls: controls
        };
        this.bindEvents();
        doc.addEventListener('click', this.boundDocumentClick);
        doc.addEventListener('keydown', this.boundKeyDown);
        this.setControlsVisible(false);
        return this;
    };

    UnifiedPrize.prototype.bindEvents = function () {
        var self = this;
        this.refs.prev.addEventListener('click', function (event) {
            event.stopPropagation();
            if (!self.disabled(this)) self.trigger('onPrizePrev');
        });
        this.refs.next.addEventListener('click', function (event) {
            event.stopPropagation();
            if (!self.disabled(this)) self.trigger('onPrizeNext');
        });
        this.refs.select.addEventListener('click', function (event) {
            event.stopPropagation();
            if (!self.disabled(this)) self.toggleMenu();
        });
        this.refs.decrease.addEventListener('click', function (event) {
            event.stopPropagation();
            if (!self.disabled(this)) self.commitDrawCount(self.drawCount - 1);
        });
        this.refs.increase.addEventListener('click', function (event) {
            event.stopPropagation();
            if (!self.disabled(this)) self.commitDrawCount(self.drawCount + 1);
        });
        this.refs.input.addEventListener('input', function () {
            if (!this.disabled && !self.drawCountReadonly) this.value = this.value.replace(/\D/g, '');
        });
        this.refs.input.addEventListener('change', function () {
            if (!this.disabled && !self.drawCountReadonly) self.commitDrawCount(this.value);
        });
        this.refs.input.addEventListener('blur', function () {
            if (!this.disabled && !self.drawCountReadonly) self.commitDrawCount(this.value);
        });
        this.refs.input.addEventListener('keydown', function (event) {
            if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') event.stopPropagation();
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                if (!self.drawCountReadonly) self.commitDrawCount(this.value);
                this.blur();
            }
        });
    };

    UnifiedPrize.prototype.disabled = function (node) {
        return this.state !== 'ready' || !!node.disabled;
    };

    UnifiedPrize.prototype.bindImage = function (wrap, image, url) {
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

    UnifiedPrize.prototype.renderRoundItems = function (items) {
        var list = this.refs.roundList;
        list.textContent = '';
        var doc = list.ownerDocument || document;
        items.forEach(function (item) {
            var card = createElement(doc, 'div', 'importcj-unified-prize-round-item');
            var imageWrap = createElement(doc, 'div', 'importcj-unified-prize-round-image is-missing');
            var image = createElement(doc, 'img');
            image.alt = asText(item.prizename || item.awardname || '奖品');
            imageWrap.appendChild(image);
            var name = createElement(doc, 'strong', '', asText(item.prizename || item.awardname || '奖品'));
            card.appendChild(imageWrap);
            card.appendChild(name);
            var quota = displayQuota(item.num);
            if (quota) card.appendChild(createElement(doc, 'span', 'importcj-unified-prize-round-quota', '抽取 ' + quota + ' 名'));
            list.appendChild(card);
            this.bindImage(imageWrap, image, item.prizeimg || item.image);
        }, this);
    };

    UnifiedPrize.prototype.updatePrize = function (prize) {
        prize = prize || {};
        this.prize = prize;
        var awardName = asText(prize.awardname || prize.roundtitle);
        var prizeName = asText(prize.prizename || awardName || '等待奖品');
        var remaining = prize.remaining === undefined || prize.remaining === null || asText(prize.remaining) === '' ? '—' : asText(prize.remaining);
        var roundItems = Object.prototype.toString.call(prize.items) === '[object Array]' ? prize.items : [];

        this.refs.award.textContent = awardName && awardName !== prizeName ? awardName : '';
        this.refs.select.textContent = awardName || prizeName;
        this.refs.count.textContent = remaining;
        this.panel.classList.toggle('is-round', roundItems.length > 0);
        if (roundItems.length) {
            this.refs.name.textContent = '';
            this.renderRoundItems(roundItems);
        } else {
            this.refs.name.textContent = prizeName;
            this.refs.roundList.textContent = '';
            this.bindImage(this.refs.single, this.refs.image, prize.prizeimg || prize.image);
        }
    };

    UnifiedPrize.prototype.renderMenu = function () {
        var menu = this.refs.menu;
        menu.textContent = '';
        var doc = menu.ownerDocument || document;
        var self = this;
        if (!this.prizes.length) {
            menu.appendChild(createElement(doc, 'p', 'importcj-unified-prize-menu-empty', '暂无奖品'));
            return;
        }
        this.prizes.forEach(function (prize, index) {
            var award = asText(prize.awardname || prize.roundtitle || ('奖品 ' + (index + 1)));
            var name = asText(prize.prizename || '');
            var item = createElement(doc, 'button', 'importcj-unified-prize-option');
            item.type = 'button';
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', index === self.prizeIndex ? 'true' : 'false');
            if (index === self.prizeIndex) item.classList.add('is-active');
            item.appendChild(createElement(doc, 'strong', '', award));
            if (name && name !== award) item.appendChild(createElement(doc, 'small', '', name));
            item.addEventListener('click', function (event) {
                event.stopPropagation();
                if (self.state !== 'ready') return;
                self.closeMenu();
                self.trigger('onPrizeSelect', prize, index);
            });
            menu.appendChild(item);
        });
    };

    UnifiedPrize.prototype.commitDrawCount = function (value) {
        if (this.state !== 'ready') return;
        var count = parseInt(value, 10);
        if (isNaN(count) || count < 1) count = 1;
        this.drawCount = count;
        this.refs.input.value = String(count);
        this.trigger('onDrawCountChange', count);
    };

    UnifiedPrize.prototype.openMenu = function () {
        if (this.state !== 'ready' || this.refs.select.disabled) return;
        this.renderMenu();
        this.refs.menu.classList.add('is-open');
        this.refs.select.setAttribute('aria-expanded', 'true');
    };

    UnifiedPrize.prototype.closeMenu = function () {
        if (!this.refs.menu) return;
        this.refs.menu.classList.remove('is-open');
        if (this.refs.select) this.refs.select.setAttribute('aria-expanded', 'false');
    };

    UnifiedPrize.prototype.toggleMenu = function () {
        if (this.refs.menu.classList.contains('is-open')) this.closeMenu();
        else this.openMenu();
    };

    UnifiedPrize.prototype.handleDocumentClick = function (event) {
        if (!this.panel || this.panel.contains(event.target)) return;
        this.closeMenu();
    };

    UnifiedPrize.prototype.handleKeyDown = function (event) {
        if (!this.refs.menu || !this.refs.menu.classList.contains('is-open')) return;
        if (event.key === 'Escape' || event.keyCode === 27) {
            event.preventDefault();
            event.stopPropagation();
            this.closeMenu();
            this.refs.select.focus();
            return;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        var options = this.refs.menu.querySelectorAll('button');
        if (!options.length) return;
        event.preventDefault();
        event.stopPropagation();
        var current = Array.prototype.indexOf.call(options, event.target);
        var next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        if (next < 0) next = options.length - 1;
        if (next >= options.length) next = 0;
        options[next].focus();
    };

    UnifiedPrize.prototype.setState = function (nextState) {
        var previousState = this.state;
        this.state = /^(ready|requesting|starting|drawing|result|records)$/.test(nextState) ? nextState : 'ready';
        if (!this.panel) return;
        this.panel.setAttribute('data-state', this.state);
        var ready = this.state === 'ready';
        var singlePrize = this.prizes.length < 2;
        var readonly = !!this.drawCountReadonly;
        this.refs.prev.disabled = !ready || singlePrize;
        this.refs.next.disabled = !ready || singlePrize;
        this.refs.select.disabled = !ready || singlePrize;
        this.panel.classList.toggle('is-single-prize', singlePrize);
        this.refs.decrease.disabled = !ready || readonly;
        this.refs.input.disabled = !ready;
        this.refs.input.readOnly = readonly;
        this.refs.input.setAttribute('aria-readonly', readonly ? 'true' : 'false');
        this.refs.increase.disabled = !ready || readonly;
        this.refs.decrease.hidden = readonly;
        this.refs.increase.hidden = readonly;
        this.refs.input.classList.toggle('is-readonly', readonly);
        this.refs.stepper.classList.toggle('is-readonly', readonly);
        this.refs.stepperLabel.textContent = this.drawCountLabel || (readonly ? '本轮抽取' : '单次抽取');
        this.refs.stepperUnit.textContent = this.drawCountUnit || (readonly ? '名' : '人');
        this.refs.stepper.setAttribute('aria-label', readonly ? '本轮抽取人数（只读）' : '单次抽取人数');
        if (!ready || previousState !== 'ready') this.setControlsVisible(false);
    };

    UnifiedPrize.prototype.setControlsVisible = function (visible) {
        var show = !!visible && this.state === 'ready';
        this.controlsVisible = show;
        if (!this.panel || !this.refs.controls) return show;
        this.panel.classList.toggle('is-controls-visible', show);
        this.refs.controls.hidden = !show;
        this.refs.controls.setAttribute('aria-hidden', show ? 'false' : 'true');
        if (!show) this.closeMenu();
        return show;
    };

    UnifiedPrize.prototype.isControlsVisible = function () {
        return !!this.controlsVisible;
    };

    UnifiedPrize.prototype.update = function (data) {
        data = data || {};
        if (!this.panel) return this;
        if (data.prizes !== undefined) this.prizes = data.prizes || [];
        if (data.prizeIndex !== undefined) this.prizeIndex = Math.max(0, parseInt(data.prizeIndex, 10) || 0);
        if (data.maxDrawCount !== undefined) this.maxDrawCount = Math.max(1, parseInt(data.maxDrawCount, 10) || 1);
        if (data.drawCountReadonly !== undefined) this.drawCountReadonly = !!data.drawCountReadonly;
        if (data.prizeSettingsVisible !== undefined) this.setControlsVisible(data.prizeSettingsVisible);
        if (data.drawCountLabel !== undefined) this.drawCountLabel = String(data.drawCountLabel);
        if (data.drawCountUnit !== undefined) this.drawCountUnit = String(data.drawCountUnit);
        if (data.onceout !== undefined || data.drawCount !== undefined) {
            this.drawCount = parseInt(data.drawCount !== undefined ? data.drawCount : data.onceout, 10) || 1;
            this.drawCount = Math.max(1, this.drawCount);
            this.refs.input.value = String(this.drawCount);
        }
        if (data.prize !== undefined) this.updatePrize(data.prize);
        else this.renderMenu();
        this.setState(data.state || this.state);
        return this;
    };

    UnifiedPrize.prototype.setAccent = function (value) {
        if (!this.panel || !value) return this;
        var test = this.panel.ownerDocument.createElement('span');
        test.style.color = asText(value);
        if (test.style.color) this.panel.style.setProperty('--importcj-prize-accent', test.style.color);
        return this;
    };

    UnifiedPrize.prototype.destroy = function () {
        var doc = this.root && (this.root.ownerDocument || document);
        if (doc) {
            doc.removeEventListener('click', this.boundDocumentClick);
            doc.removeEventListener('keydown', this.boundKeyDown);
        }
        if (this.panel && this.panel.parentNode) this.panel.parentNode.removeChild(this.panel);
        if (this.root) this.root.classList.remove('importcj-unified-prize-enabled');
        this.panel = null;
        this.controlsVisible = false;
        this.refs = {};
        return this;
    };

    return {
        create: function (options) { return new UnifiedPrize(options); }
    };
});
