/* 留言动画适配层：复用扫码弹幕 Danmuku 的轨道和位移，不负责选人或调用业务接口。 */
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
        this.factor = 1;
        this.timers = [];
        this.disposed = false;
        this.visible = true;
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
                        img.className = 'message-danmaku-emoji'; img.src = src; img.alt = child.alt || '';
                        parent.appendChild(img);
                    }
                } else if (child.nodeType === 1 && !/^(SCRIPT|STYLE|IFRAME|OBJECT|SVG)$/.test(child.tagName)) append(parent, child);
            });
        }
        append(node, template.content);
    };
    MessageStream.prototype.card = function (node, message) {
        var doc = this.root.ownerDocument;
        node.className = 'message-danmaku-card';
        var avatar = doc.createElement('span'); avatar.className = 'message-danmaku-avatar';
        var src = imageUrl(message.avatar);
        if (src) {
            var img = doc.createElement('img'); img.src = src; img.alt = ''; avatar.appendChild(img);
        } else avatar.textContent = text(message.nickname || '留').slice(0, 1);
        var body = doc.createElement('div'); body.className = 'message-danmaku-body';
        var name = doc.createElement('strong'); name.textContent = message.nickname || '现场用户';
        var content = doc.createElement('div'); content.className = 'message-danmaku-content';
        this.content(content, message.content);
        body.appendChild(name); body.appendChild(content); node.appendChild(avatar); node.appendChild(body);
    };
    MessageStream.prototype.mount = function (messages) {
        var self = this, doc = this.root.ownerDocument;
        this.root.classList.add('message-danmaku');
        this.field = doc.createElement('div'); this.field.className = 'message-danmaku-field';
        this.field.setAttribute('aria-hidden', 'true');
        this.status = doc.createElement('div'); this.status.className = 'message-danmaku-status';
        this.status.setAttribute('role', 'status');
        this.spotlight = doc.createElement('div'); this.spotlight.className = 'message-danmaku-spotlight';
        this.root.appendChild(this.field); this.root.appendChild(this.status); this.root.appendChild(this.spotlight);
        this.manager = Danmuku.create({container: this.field, direction: 'right', height: 88, rowGap: 64,
            times: [14, 18], limit: 36, capacity: 60, interval: 0.25,
            hooks: { barrageCreate: function (barrage, node) { self.card(node, barrage.data); } }});
        (messages || []).forEach(function (message) { self.add(message, true); });
        this.setState('ready');
        this.feedTimer = window.setInterval(function () { self.feed(); }, 350);
        window.addEventListener('resize', this.onResize);
        doc.addEventListener('visibilitychange', this.onVisibility);
        return this;
    };
    MessageStream.prototype.add = function (message, history) {
        if (this.disposed || !message) return;
        if (message.type === '2' || message.type === 2) return;
        var id = message.id == null ? '' : String(message.id);
        if (id && this.messages.some(function (m) { return m.id === id; })) return;
        var copy = {id: id, nickname: text(message.nickname), avatar: imageUrl(message.avatar), content: text(message.content)};
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
        this.manager.clear();
        this.visibility();
        this.feed();
    };
    MessageStream.prototype.reset = function () {
        this.messages = []; this.pendingMessages = []; this.cursor = 0; this.manager.clear();
        if (this.state === 'ready') this.status.textContent = '等待第一条现场留言';
    };
    MessageStream.prototype.feed = function () {
        if (this.disposed || this.root.ownerDocument.hidden || (!this.visible && this.state === 'ready') || !/^(ready|drawing)$/.test(this.state) || !this.messages.length) return;
        if (!this.manager.runing) this.manager.start();
        // 优先给新留言一次前插机会；历史循环不会把实时消息压在队尾。
        if (this.pendingMessages.length && this.manager.stashLength < 12) {
            this.manager.send(this.pendingMessages.shift(), true);
            return;
        }
        var count = this.state === 'drawing' ? 3 : 1;
        for (var i = 0; i < count && this.manager.stashLength < 8; i++) {
            this.cursor %= this.messages.length;
            this.manager.send(this.messages[this.cursor++]);
        }
    };
    MessageStream.prototype.clearTimers = function () {
        this.timers.forEach(window.clearTimeout); this.timers = [];
    };
    MessageStream.prototype.later = function (fn, delay) {
        var self = this;
        this.timers.push(window.setTimeout(function () { if (!self.disposed) fn(); }, delay));
    };
    MessageStream.prototype.speed = function (factor) {
        if (!this.manager) return;
        var previous = this.factor; this.factor = factor;
        this.manager.setOptions({times: [14 / factor, 18 / factor]});
        // Danmuku 的 resume2 只改 CSS 时长，不更新位移时钟；这里保持两者一致。
        this.manager.each(function (barrage) {
            barrage.pause();
            var percent = Math.max(0, Math.min(0.999, barrage.getMovePercent())), now = Date.now();
            barrage.duration = barrage.duration * previous / factor;
            barrage.timeInfo.startTime = now - percent * barrage.duration * 1000;
            barrage.timeInfo.pauseTime = 0;
            barrage.timeInfo.prevPauseTime = now;
            if (!barrage.node.ownerDocument.hidden) barrage.resume();
        });
    };
    MessageStream.prototype.setState = function (state) {
        if (this.disposed || this.state === state && this.root.getAttribute('data-state') === state) return;
        this.clearTimers(); this.state = state; this.root.setAttribute('data-state', state);
        if (state === 'ready' || state === 'drawing') {
            this.spotlight.textContent = '';
            this.status.textContent = state === 'drawing' ? '幸运留言流动中' : (this.messages.length ? '扫码留言，让你的声音上大屏' : '等待第一条现场留言');
            this.speed(state === 'drawing' && !this.reducedMotion ? 2 : 1);
            if (state === 'drawing' && !this.reducedMotion) {
                var self = this; this.later(function () { self.speed(4); }, 400);
            }
            this.visibility(); this.feed();
        } else {
            this.manager.stop(); this.manager.each(function (b) { b.pause(); });
        }
    };
    MessageStream.prototype.lock = function (winners, complete) {
        var self = this;
        if (this.disposed || this.state !== 'drawing') return false;
        this.clearTimers(); this.state = 'locking'; this.root.setAttribute('data-state', 'locking');
        this.status.textContent = '正在锁定幸运留言'; this.manager.stop();
        this.speed(this.reducedMotion ? 1 : 1.4);
        this.later(function () { self.speed(0.4); }, this.reducedMotion ? 0 : 240);
        this.later(function () {
            self.manager.each(function (b) { b.pause(); });
            self.root.setAttribute('data-state', 'locked');
            self.status.textContent = '本轮锁定 ' + winners.length + ' 位幸运用户';
            winners.slice(0, 3).forEach(function (winner) {
                var node = self.root.ownerDocument.createElement('div');
                self.card(node, winner); self.spotlight.appendChild(node);
            });
            if (winners.length > 3) {
                var more = self.root.ownerDocument.createElement('p');
                more.textContent = '另有 ' + (winners.length - 3) + ' 位，完整名单即将揭晓'; self.spotlight.appendChild(more);
            }
        }, this.reducedMotion ? 0 : 650);
        this.later(function () { complete(); }, this.reducedMotion ? 150 : 1500);
        return true;
    };
    MessageStream.prototype.isVisible = function () { return this.visible; };
    MessageStream.prototype.setVisible = function (visible) {
        this.visible = !!visible; this.root.setAttribute('data-muted', String(!this.visible));
        this.visibility();
    };
    MessageStream.prototype.resize = function () {
        if (!this.disposed && this.manager) this.manager.resize();
    };
    MessageStream.prototype.visibility = function () {
        if (this.disposed) return;
        if (this.root.ownerDocument.hidden || (!this.visible && this.state === 'ready') || !/^(ready|drawing)$/.test(this.state)) {
            this.manager.stop(); this.manager.each(function (b) { b.pause(); });
        } else {
            this.manager.each(function (b) { b.resume(); }); this.manager.start();
        }
    };
    MessageStream.prototype.destroy = function () {
        this.disposed = true; this.clearTimers(); window.clearInterval(this.feedTimer);
        window.removeEventListener('resize', this.onResize);
        this.root.ownerDocument.removeEventListener('visibilitychange', this.onVisibility);
        if (this.manager) this.manager.clear();
        this.root.textContent = ''; this.manager = null; this.messages = []; this.pendingMessages = [];
    };
    return {create: function (options) { return new MessageStream(options); }};
});
