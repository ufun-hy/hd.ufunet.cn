/* 留言抽奖显示适配层：复用后台弹幕模板、样式及轨道配置，不负责开奖。 */
define(['danmuku'], function (Danmuku) {
    'use strict';

    function text(value) { return value == null ? '' : String(value); }
    function imageUrl(value) {
        value = text(value).trim();
        return /^(https?:\/\/|\/(?!\/))/.test(value) ? value : '';
    }
    function MessageStream(options) {
        this.root = options.root;
        this.formatContent = options.formatContent || text;
        this.messages = [];
        this.pendingMessages = [];
        this.cursor = 0;
        this.state = 'ready';
        this.lockPhase = '';
        this.factor = 1;
        this.drawFactor = 2.6;
        this.timers = [];
        this.rafId = null;
        this.animationTimer = null;
        this.disposed = false;
        this.visible = true;
        this.nextFeedAt = 0;
        this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.onResize = this.resize.bind(this);
        this.onVisibility = this.visibility.bind(this);
    }
    MessageStream.prototype.content = function (node, value) {
        // 只保留文字与表情图片；模板解析本身不执行用户提供的 HTML。
        var doc = this.root.ownerDocument, template = doc.createElement('template');
        template.innerHTML = this.formatContent(text(value).slice(0, 2000));
        function append(parent, source) {
            Array.prototype.forEach.call(source.childNodes, function (child) {
                if (child.nodeType === 3) parent.appendChild(doc.createTextNode(child.textContent));
                else if (child.nodeType === 1 && child.tagName === 'IMG') {
                    var src = imageUrl(child.getAttribute('src'));
                    if (src) {
                        var img = doc.createElement('img');
                        img.className = 'faceImg'; img.src = src; img.alt = child.alt || '';
                        parent.appendChild(img);
                    }
                } else if (child.nodeType === 1 && !/^(SCRIPT|STYLE|IFRAME|OBJECT|SVG)$/.test(child.tagName)) append(parent, child);
            });
        }
        append(node, template.content);
    };
    MessageStream.prototype.renderBarrage = function (barrage, node) {
        // 保留原渲染模板与随机颜色；仅净化留言内容，避免 raw HTML 执行。
        var content = this.root.ownerDocument.createElement('div');
        this.content(content, barrage.data.content);
        var data = Object.assign({}, barrage.data, {content: content.innerHTML});
        this.fulldm.rebindBarragedom({data: data}, node);
    };
    MessageStream.prototype.configure = function (fulldm) {
        if (this.disposed || !fulldm.dmtpl || !fulldm.container || !fulldm.container[0]) return;
        if (this.manager && this.config === fulldm.config && this.field === fulldm.container[0]) return;
        if (this.manager) this.manager.clear();
        this.fulldm = fulldm;
        this.config = fulldm.config;
        // 使用页脚原容器，保留后台半屏、上下区域与原始坐标系。
        this.field = fulldm.container[0];
        this.field.classList.add('message-danmaku-field');
        this.field.setAttribute('aria-hidden', 'true');
        var self = this, options = fulldm.getManagerOptions();
        this.baseTimes = options.times.slice();
        this.drawFactor = 2.6;
        this.readyFeedInterval = this.config.ismiji == '2' ? 800 : 2000;
        this.feedInterval = this.readyFeedInterval;
        options.hooks = {
            barrageCreate: function (barrage, node) { self.renderBarrage(barrage, node); },
            // 引擎可能在下一帧才挂载已入队节点；暂停状态下也不能漏出运动。
            barrageMove: function (barrage) { if (!self.canMove()) barrage.pause(); }
        };
        this.manager = Danmuku.create(options);
        this.speed(this.state === 'drawing' && !this.reducedMotion ? this.drawFactor : this.factor);
        this.syncField(); this.visibility(); this.feed();
    };
    MessageStream.prototype.mount = function (messages) {
        var self = this, doc = this.root.ownerDocument;
        this.root.classList.add('message-danmaku');
        this.status = doc.createElement('div'); this.status.className = 'message-danmaku-status';
        this.status.setAttribute('role', 'status'); this.root.appendChild(this.status);
        (messages || []).forEach(function (message) { self.add(message, true); });
        this.setState('ready');
        this.feedTimer = window.setInterval(function () { self.feed(); }, 200);
        window.addEventListener('resize', this.onResize);
        doc.addEventListener('visibilitychange', this.onVisibility);
        return this;
    };
    MessageStream.prototype.add = function (message, history) {
        if (this.disposed || !message) return;
        if (message.type === '2' || message.type === 2) return;
        var id = message.id == null ? '' : String(message.id);
        if (id && this.messages.some(function (m) { return m.id === id; })) return;
        var copy = {id: id, nickname: text(message.nickname), avatar: imageUrl(message.avatar), content: text(message.content), type: '1'};
        this.messages.push(copy);
        if (this.messages.length > 300) this.messages.shift();
        if (!history) {
            this.pendingMessages.push(copy);
            if (this.pendingMessages.length > 30) this.pendingMessages.shift();
        }
        this.feed();
        if (this.state === 'ready' && this.status) this.status.textContent = '扫码留言，让你的声音上大屏';
    };
    MessageStream.prototype.remove = function (ids) {
        ids = (Array.isArray(ids) ? ids : [ids]).map(String);
        this.messages = this.messages.filter(function (m) { return ids.indexOf(m.id) === -1; });
        // clear 同时清理已排队消息，避免审核删除后再次进入画面。
        this.pendingMessages = this.pendingMessages.filter(function (m) { return ids.indexOf(m.id) === -1; });
        if (this.manager) this.manager.clear();
        this.visibility();
        this.feed();
    };
    MessageStream.prototype.reset = function () {
        this.messages = []; this.pendingMessages = []; this.cursor = 0; if (this.manager) this.manager.clear();
        if (this.state === 'ready') this.status.textContent = '等待第一条现场留言';
    };
    MessageStream.prototype.feed = function () {
        if (this.disposed || !this.manager || !this.canMove() || !/^(ready|drawing)$/.test(this.state) || !this.messages.length || Date.now() < this.nextFeedAt) return;
        this.nextFeedAt = Date.now() + this.feedInterval;
        if (!this.manager.runing) this.manager.start();
        if (this.pendingMessages.length && this.manager.stashLength < 14) {
            this.manager.send(this.pendingMessages.shift(), true);
            return;
        }
        var count = this.state === 'drawing' ? 2 : 1;
        for (var i = 0; i < count && this.manager.stashLength < 10; i++) {
            this.cursor %= this.messages.length;
            this.manager.send(this.messages[this.cursor++]);
        }
    };
    MessageStream.prototype.clearTimers = function () {
        this.timers.forEach(window.clearTimeout); this.timers = [];
        if (this.rafId) { window.cancelAnimationFrame(this.rafId); this.rafId = null; }
        if (this.animationTimer) { window.clearTimeout(this.animationTimer); this.animationTimer = null; }
    };
    MessageStream.prototype.later = function (fn, delay) {
        var self = this;
        this.timers.push(window.setTimeout(function () { if (!self.disposed) fn(); }, delay));
    };
    MessageStream.prototype.canMove = function () {
        return !this.disposed && !this.root.ownerDocument.hidden &&
            /^(ready|drawing|locking)$/.test(this.state) && (this.visible || this.state !== 'ready');
    };
    MessageStream.prototype.speed = function (factor) {
        var previous = this.factor; this.factor = factor;
        if (!this.manager) return;
        this.manager.setOptions({times: this.baseTimes.map(function (time) { return time / factor; })});
        var moving = [], now = Date.now();
        this.manager.each(function (barrage) {
            if (!barrage.moveing) return;
            var totalSpan = (barrage.direction === 'left' || barrage.direction === 'right')
                ? (barrage.RuntimeManager.containerWidth + barrage.getWidth())
                : (barrage.RuntimeManager.containerHeight + barrage.getHeight());
            var percent = null, currentPos = null;
            if (barrage.node) {
                var style = window.getComputedStyle(barrage.node);
                var transform = style.transform || style.webkitTransform;
                if (transform && transform !== 'none') {
                    try {
                        var matrix = window.DOMMatrixReadOnly ? new DOMMatrixReadOnly(transform) : (window.WebKitCSSMatrix ? new WebKitCSSMatrix(transform) : null);
                        if (matrix) {
                            currentPos = (barrage.direction === 'left' || barrage.direction === 'right') ? matrix.m41 : matrix.m42;
                            if (totalSpan > 0) percent = Math.abs(currentPos) / totalSpan;
                        }
                    } catch (e) {}
                }
            }
            barrage.pause();
            if (percent == null || isNaN(percent)) {
                percent = barrage.getMovePercent();
            }
            percent = Math.max(0, Math.min(0.999999, percent));
            if (currentPos != null && barrage.node) {
                if (barrage.direction === 'left' || barrage.direction === 'right') {
                    barrage.node.style.transform = 'translateX(' + currentPos + 'px)';
                } else {
                    barrage.node.style.transform = 'translateY(' + currentPos + 'px)';
                }
                barrage.node.style.transitionDuration = '0s';
            }
            // 保持每条消息的实际时长比例（含引擎避碰修正），不重置位置。
            barrage.duration = barrage.duration * previous / factor;
            barrage.timeInfo.startTime = now - percent * barrage.duration * 1000;
            barrage.timeInfo.pauseTime = 0;
            barrage.timeInfo.prevPauseTime = now;
            moving.push(barrage);
        });
        if (moving.length && this.canMove()) {
            // 一次批量布局刷新提交暂停位置，再恢复 CSS 位移，避免逐帧跳回/卡住。
            void this.field.offsetWidth;
            moving.forEach(function (barrage) { barrage.resume(); });
        }
    };
    MessageStream.prototype.animateFactor = function (target, duration, complete, easing) {
        var self = this, from = this.factor, started = performance.now();
        if (this.rafId) { window.cancelAnimationFrame(this.rafId); this.rafId = null; }
        if (this.animationTimer) { window.clearTimeout(this.animationTimer); this.animationTimer = null; }
        easing = easing || function (p) { return p * p * (3 - 2 * p); };
        function frame() {
            if (self.disposed) return;
            var elapsed = performance.now() - started;
            var progress = Math.min(1, elapsed / duration);
            var eased = easing(progress);
            self.speed(from + (target - from) * eased);
            if (progress < 1) self.animationTimer = window.setTimeout(frame, Math.min(30, duration - elapsed));
            else {
                self.animationTimer = null;
                if (complete) complete();
            }
        }
        if (this.reducedMotion || !duration) { this.speed(target); if (complete) complete(); }
        else this.animationTimer = window.setTimeout(frame, Math.min(30, duration));
    };
    MessageStream.prototype.syncField = function () {
        this.root.setAttribute('data-state', this.state);
        this.root.setAttribute('data-phase', this.lockPhase || '');
        this.root.setAttribute('data-muted', String(!this.visible));
        if (this.field) {
            this.field.setAttribute('data-state', this.state);
            this.field.setAttribute('data-phase', this.lockPhase || '');
            this.field.setAttribute('data-muted', String(!this.visible));
        }
    };
    MessageStream.prototype.setState = function (state) {
        if (this.disposed || (this.state === state && this.root.getAttribute('data-state') === state)) return;
        var previousState = this.state;
        this.clearTimers();
        this.state = state;
        this.lockPhase = '';
        this.syncField();
        if (state === 'ready' || state === 'drawing') {
            this.status.textContent = state === 'drawing'
                ? '幸运留言飞速抽取中'
                : (this.messages.length ? '扫码留言，让你的声音上大屏' : '等待第一条现场留言');
            this.visibility();
            this.resize();
            var target = state === 'drawing' && !this.reducedMotion ? (this.drawFactor || 2.6) : 1;
            if (state === 'drawing') {
                this.feedInterval = 420;
                var easeInOutCubic = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
                this.animateFactor(target, 750, null, easeInOutCubic);
            } else {
                this.feedInterval = this.readyFeedInterval || 2000;
                this.animateFactor(1, previousState === 'ready' ? 0 : 300);
            }
            this.nextFeedAt = 0;
            this.feed();
        } else {
            this.visibility();
        }
    };
    MessageStream.prototype.lock = function (winners, complete) {
        var self = this;
        if (this.disposed || this.state !== 'drawing') return false;
        this.clearTimers();
        this.state = 'locking';
        this.lockPhase = 'decelerating';
        this.syncField();
        this.status.textContent = '正在减速锁定幸运留言';
        if (this.manager) this.manager.stop();
        var finished = false;
        function finish() {
            if (finished || self.disposed || self.state !== 'locking') return;
            finished = true;
            self.clearTimers();
            self.speed(0.2);
            self.lockPhase = 'complete';
            self.state = 'locked';
            self.syncField();
            self.visibility();
            // 不制造中奖节点；单人、多人、不可见中奖留言都只揭晓一次公共结果。
            complete();
        }
        function fadeOut() {
            if (self.disposed || self.state !== 'locking') return;
            self.lockPhase = 'fading';
            self.status.textContent = '正在揭晓中奖结果';
            self.syncField();
            if (self.reducedMotion) { finish(); return; }
            self.later(finish, 380);
        }
        function coast() {
            if (self.disposed || self.state !== 'locking') return;
            self.speed(0.2);
            self.lockPhase = 'coasting';
            self.status.textContent = '幸运留言已锁定，即将揭晓';
            self.syncField();
            self.later(fadeOut, 650);
        }
        if (this.reducedMotion) {
            this.speed(1);
            fadeOut();
        } else {
            var easeOutCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
            this.animateFactor(0.2, 900, function () {
                coast();
            }, easeOutCubic);
        }
        // 后台标签页的 rAF 会暂停，计时兜底避免控制台永久锁定。
        this.later(function () {
            if (self.state !== 'locking') return;
            self.lockPhase = 'complete';
            finish();
        }, 2600);
        return true;
    };
    MessageStream.prototype.isVisible = function () { return this.visible; };
    MessageStream.prototype.setVisible = function (visible) {
        this.visible = !!visible; this.syncField(); this.visibility();
    };
    MessageStream.prototype.resize = function () {
        if (!this.disposed && this.manager) this.manager.resize();
    };
    MessageStream.prototype.visibility = function () {
        if (this.disposed || !this.manager) return;
        if (!this.canMove()) {
            this.manager.stop(); this.manager.each(function (b) { b.pause(); });
        } else {
            this.manager.each(function (b) { b.resume(); });
            if (this.state !== 'locking') this.manager.start();
        }
    };
    MessageStream.prototype.destroy = function () {
        this.disposed = true; this.clearTimers(); window.clearInterval(this.feedTimer);
        window.removeEventListener('resize', this.onResize);
        this.root.ownerDocument.removeEventListener('visibilitychange', this.onVisibility);
        if (this.manager) this.manager.clear();
        if (this.field) {
            this.field.classList.remove('message-danmaku-field');
            this.field.removeAttribute('data-state'); this.field.removeAttribute('data-phase'); this.field.removeAttribute('data-muted');
            this.field.removeAttribute('aria-hidden');
        }
        this.root.textContent = ''; this.manager = null; this.messages = []; this.pendingMessages = [];
    };
    return {create: function (options) { return new MessageStream(options); }};
});
