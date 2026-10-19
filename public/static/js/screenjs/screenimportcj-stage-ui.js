/* ImportCJ-only result presentation; shared message/avatar UI stays unchanged. */
define(['screenjs/screen-stage-ui', 'screenjs/screenimportcj-result', 'screenjs/screenimportcj-typography'], function (shared, resultView, typography) {
    'use strict';
    return {
        normalizeCandidate: shared.normalizeCandidate,
        create: function (options) {
            options = options || {};
            var ui = shared.create(options);
            var mount = ui.mount, destroy = ui.destroy, setState = ui.setState, setRecords = ui.setRecords, update = ui.update;
            // Keep ImportCJ field descriptors through group normalization without changing shared UI.
            ui.flattenWinners = function (values) {
                var winners = [];
                function visit(value) {
                    if (Array.isArray(value)) return value.forEach(visit);
                    if (!value) return;
                    var children = value.roundawards || value.luckers || value.winners;
                    if (children) return visit(children);
                    if (!value.displayFields) value = resultView.selectFields(value, options.resultConfig || {}, options.fieldConfig || []);
                    var winner = shared.normalizeCandidate(value);
                    winner.displayFields = value.displayFields;
                    winners.push(winner);
                }
                visit(values);
                return winners;
            };
            ui.createWinnerCard = function (doc, winner) {
                var card = doc.createElement('div');
                card.className = 'import-record-card f' + winner.displayFields.length;
                card.style.animationDelay = Math.min(this.importRecordIndex++ * 40, 600) + 'ms';
                resultView.appendFields(card, winner, 'import-record', false);
                return card;
            };
            ui.fitRecordText = function () {
                var drawer = this.recordsDrawer;
                if (!drawer || !drawer.clientWidth) return;
                // Each section is one round/prize; use all its records, including offscreen rows.
                var sections = drawer.querySelectorAll('.screen-stage-records-section');
                (sections.length ? Array.prototype.slice.call(sections) : [this.recordsListWrap]).forEach(function (section) {
                    var buckets = {}, cards = Array.prototype.slice.call(section.querySelectorAll('.import-record-card'));
                    cards.forEach(function (card) {
                        card.style.height = '';
                        card.querySelectorAll('[data-field-value]').forEach(function (node) { node.style.fontSize = ''; });
                    });
                    // Batch reads/writes so large record lists do not reflow once per card.
                    var heights = cards.map(function (card) { return card.offsetHeight; });
                    cards.forEach(function (card, i) { card.style.height = heights[i] + 'px'; });
                    cards.forEach(function (card) {
                        card.querySelectorAll('[data-field-value]').forEach(function (node) {
                            var slot = Number(node.getAttribute('data-field-value'));
                            var id = slot + ':' + node.getAttribute('data-field-index') + ':' + card.classList.contains('f1');
                            var base = parseFloat(node.ownerDocument.defaultView.getComputedStyle(node).fontSize);
                            var target = base * (slot === 0 ? .8 : 1) * Number(node.getAttribute('data-field-scale'));
                            if (!buckets[id]) buckets[id] = { nodes: [], values: [], target: target, width: node.clientWidth };
                            buckets[id].nodes.push(node); buckets[id].values.push(node.textContent);
                            buckets[id].width = Math.min(buckets[id].width, node.clientWidth);
                        });
                    });
                    Object.keys(buckets).forEach(function (id) {
                        var b = buckets[id], size = typography.fit(b.nodes[0], b.values, b.target, b.width);
                        b.nodes.forEach(function (node) { node.style.fontSize = size + 'px'; });
                    });
                    // A uniform height cap for the round avoids clipping at enlarged settings.
                    var ratio = 1;
                    section.querySelectorAll('.import-record-card').forEach(function (card) {
                        var style = card.ownerDocument.defaultView.getComputedStyle(card), used = 0;
                        Array.prototype.forEach.call(card.children, function (node) {
                            var s = node.ownerDocument.defaultView.getComputedStyle(node);
                            used += node.offsetHeight + (parseFloat(s.marginTop) || 0) + (parseFloat(s.marginBottom) || 0);
                        });
                        var available = card.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom), textHeight = 0;
                        card.querySelectorAll('[data-field-value]').forEach(function (node) { textHeight += node.offsetHeight; });
                        // The two bottom cells share a row, so count only the tallest value there.
                        var extras = card.querySelectorAll('.import-record-extra');
                        if (extras.length === 2) textHeight -= Math.min(extras[0].offsetHeight, extras[1].offsetHeight);
                        if (textHeight) ratio = Math.min(ratio, Math.max(.1, (available - (used - textHeight)) / textHeight));
                    });
                    if (ratio < 1) section.querySelectorAll('[data-field-value]').forEach(function (node) { node.style.fontSize = parseFloat(node.style.fontSize) * ratio + 'px'; });
                });
            };
            ui.setRecords = function (values, status) {
                if (!this.recordsDrawer) return this;
                this.importRecordIndex = 0;
                this.recordsTotalCount.textContent = '0';
                this.recordsListWrap.textContent = '';
                if (this.importRecordTop) this.importRecordTop.hidden = true;
                var content = this.recordsListWrap.parentElement;
                content.scrollTop = 0;
                var data = status === 'loading' || status === 'error' ? values :
                    resultView.selectFields(values || [], options.resultConfig || {}, options.fieldConfig || []);
                setRecords.call(this, data, status);
                this.recordsDrawer.classList.toggle('has-many-cards', this.recordsListWrap.querySelectorAll('.import-record-card').length > 6);
                this.fitRecordText();
                return this;
            };
            ui.mount = function () {
                mount.call(this);
                if (this.stage) {
                    this.stage.classList.add('importcj-result-enabled');
                    this.importResult = resultView.create({
                        host: this.stage,
                        config: options.resultConfig || {},
                        fieldConfig: options.fieldConfig || [],
                        normalizeGroups: this.normalizeWinnerGroups.bind(this)
                    });
                }
                var self = this, drawer = this.recordsDrawer;
                if (drawer) {
                    drawer.classList.add('import-records');
                    resultView.applyCardBackground(drawer, options.resultConfig || {});
                    var panel = drawer.querySelector('.screen-stage-records-drawer');
                    var content = drawer.querySelector('.screen-stage-records-content');
                    var top = this.importRecordTop = drawer.ownerDocument.createElement('button');
                    top.className = 'import-record-top'; top.type = 'button'; top.textContent = '↑';
                    top.setAttribute('aria-label', '回到顶部'); top.hidden = true;
                    top.onclick = function () { content.scrollTo({ top: 0, behavior: 'smooth' }); };
                    content.addEventListener('scroll', function () { top.hidden = content.scrollTop <= 200; });
                    panel.appendChild(top);
                    this.fitImportRecords = function () {
                        var W = self.root.clientWidth, H = self.root.clientHeight;
                        drawer.style.setProperty('--u', (W < H ? W * .0109 : Math.min(H, W * 9 / 16) / 100) + 'px');
                        drawer.classList.toggle('is-portrait', W < H);
                        self.fitRecordText();
                    };
                    this.fitImportRecords();
                    if (window.ResizeObserver) {
                        this.importRecordObserver = new ResizeObserver(this.fitImportRecords);
                        this.importRecordObserver.observe(this.root);
                    }
                    window.addEventListener('resize', this.fitImportRecords);
                    this.recordFontsReady = function () { if (self.recordsDrawer) self.fitRecordText(); };
                    if (drawer.ownerDocument.fonts) drawer.ownerDocument.fonts.addEventListener('loadingdone', this.recordFontsReady);
                }
                return this;
            };
            ui.setResult = function (values, prize) {
                this.updatePrize(prize || {});
                if (this.importResult) this.importResult.setData(values, prize || {});
                return this.setState('result');
            };
            ui.prepareDrawing = function (data) {
                if (String(options.flytype) !== '7' || !this.importResult) return false;
                this.importResult.prepareJump(data);
                return true;
            };
            ui.beginDrawing = function () {
                return !!this.importResult && this.importResult.startJump();
            };
            ui.revealDrawing = function (callbacks) {
                if (!this.importResult) return false;
                callbacks = callbacks || {};
                var self = this;
                var accepted = this.importResult.revealJump({
                    onFirstReveal: callbacks.onFirstReveal,
                    onComplete: function () { if (callbacks.onComplete) callbacks.onComplete(); self.applyJumpGate(); }
                });
                this.applyJumpGate();
                return accepted;
            };
            ui.applyJumpGate = function () {
                if (!this.importResult || !this.importResult.jump || this.importResult.jump.phase !== 'revealing') return;
                this.btnPrimary.disabled = true;
                this.btnPrimaryText.textContent = '揭晓中…';
                this.btnPrimary.setAttribute('aria-label', '揭晓中…');
                this.btnRecords.disabled = true;
                this.btnPrizeSettings.disabled = true;
            };
            ui.update = function (data) {
                update.call(this, data);
                this.applyJumpGate();
                return this;
            };
            ui.setState = function (state) {
                setState.call(this, state);
                if (this.importResult) {
                    if (this.state === 'ready') this.importResult.cancelJump();
                    var jump = this.importResult.jump;
                    var running = jump && jump.phase !== 'prepared' && /^(starting|drawing)$/.test(this.state);
                    this.importResult.setActive(this.state === 'result' || !!running);
                }
                this.applyJumpGate();
                if (this.state === 'records') this.fitRecordText();
                return this;
            };
            ui.closeRecords = function () {
                if (!this.recordsDrawer) return;
                var drawer = this.recordsDrawer;
                drawer.classList.remove('is-open');
                window.clearTimeout(this.importRecordCloseTimer);
                this.importRecordCloseTimer = window.setTimeout(function () { if (!drawer.classList.contains('is-open')) drawer.style.display = 'none'; }, 450);
            };
            ui.destroy = function () {
                window.clearTimeout(this.importRecordCloseTimer);
                if (this.importRecordObserver) this.importRecordObserver.disconnect();
                if (this.fitImportRecords) window.removeEventListener('resize', this.fitImportRecords);
                if (this.recordFontsReady && this.root.ownerDocument.fonts) this.root.ownerDocument.fonts.removeEventListener('loadingdone', this.recordFontsReady);
                if (this.importResult) this.importResult.destroy();
                this.importResult = null;
                return destroy.call(this);
            };
            return ui;
        }
    };
});
