/* Timing only. Winners, card ownership and layout belong to ResultView. */
define([], function () {
    'use strict';
    return { create: function (options) {
        var win = options.window, tick = null, reveal = null, phase = 'prepared', first = false;
        function stopTick() { win.clearInterval(tick); tick = null; }
        function stopReveal() { win.clearTimeout(reveal); reveal = null; }
        function complete() {
            if (phase !== 'revealing') return;
            phase = 'complete'; stopTick(); stopReveal(); options.complete();
        }
        function lockNext() {
            if (phase !== 'revealing') return;
            var pending = options.pending();
            if (!pending.length) return complete();
            if (!first) { first = true; options.first(); }
            options.lock(pending[0]);
            if (!options.pending().length) return complete();
            reveal = win.setTimeout(lockNext, Math.min(420, 2400 / Math.max(1, options.count())));
        }
        var api = {
            start: function () {
                if (phase !== 'prepared') return false;
                phase = 'drawing'; api.resume(); return true;
            },
            resume: function () {
                stopTick();
                if ((phase === 'drawing' || phase === 'revealing') && !options.hidden() && !options.reduced()) {
                    tick = win.setInterval(options.tick, 90);
                }
            },
            reveal: function () {
                if (phase !== 'drawing') return false;
                phase = 'revealing';
                if (options.reduced() || options.hidden()) api.finish();
                else reveal = win.setTimeout(lockNext, 500);
                return true;
            },
            finish: function () {
                if (phase !== 'revealing') return;
                stopReveal();
                var pending = options.pending();
                if (pending.length && !first) { first = true; options.first(); }
                pending.forEach(options.lock); complete();
            },
            visibility: function () {
                if (options.hidden()) { stopTick(); api.finish(); }
                else api.resume();
            },
            cancel: function () { phase = 'cancelled'; stopTick(); stopReveal(); }
        };
        return api;
    } };
});
