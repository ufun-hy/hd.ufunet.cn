/* ImportCJ-only result presentation; shared message/avatar UI stays unchanged. */
define(['screenjs/screen-stage-ui', 'screenjs/screenimportcj-result'], function (shared, resultView) {
    'use strict';
    return {
        normalizeCandidate: shared.normalizeCandidate,
        create: function (options) {
            options = options || {};
            var ui = shared.create(options);
            var mount = ui.mount, destroy = ui.destroy, setState = ui.setState;
            ui.mount = function () {
                mount.call(this);
                if (this.stage) {
                    this.stage.classList.add('importcj-result-enabled');
                    this.importResult = resultView.create({
                        host: this.stage,
                        config: options.resultConfig || {},
                        normalizeGroups: this.normalizeWinnerGroups.bind(this)
                    });
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
            ui.destroy = function () {
                if (this.importResult) this.importResult.destroy();
                this.importResult = null;
                return destroy.call(this);
            };
            return ui;
        }
    };
});
