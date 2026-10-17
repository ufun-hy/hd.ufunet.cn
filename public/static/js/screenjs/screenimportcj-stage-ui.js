/* ImportCJ-only result presentation; shared message/avatar UI stays unchanged. */
define(['screenjs/screen-stage-ui', 'screenjs/screenimportcj-result'], function (shared, resultView) {
    'use strict';
    return {
        normalizeCandidate: shared.normalizeCandidate,
        create: function (options) {
            options = options || {};
            var ui = shared.create(options);
            var mount = ui.mount, destroy = ui.destroy, setState = ui.setState, setRecords = ui.setRecords;
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
                    };
                    this.fitImportRecords();
                    if (window.ResizeObserver) {
                        this.importRecordObserver = new ResizeObserver(this.fitImportRecords);
                        this.importRecordObserver.observe(this.root);
                    }
                    window.addEventListener('resize', this.fitImportRecords);
                }
                return this;
            };
            ui.setResult = function (values, prize) {
                this.updatePrize(prize || {});
                if (this.importResult) this.importResult.setData(values, prize || {});
                return this.setState('result');
            };
            ui.setState = function (state) {
                setState.call(this, state);
                if (this.importResult) this.importResult.setActive(this.state === 'result');
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
                if (this.importResult) this.importResult.destroy();
                this.importResult = null;
                return destroy.call(this);
            };
            return ui;
        }
    };
});
