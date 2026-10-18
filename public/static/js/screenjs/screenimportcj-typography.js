/* ImportCJ presentation only. Measure formatted text with its actual font. */
define([], function () {
    'use strict';
    function scale(value) {
        var n = Number(value);
        return value !== '' && isFinite(n) && n >= 50 && n <= 150 ? n / 100 : 1;
    }
    function fit(node, values, target, width) {
        if (!width || !target) return target;
        var doc = node.ownerDocument, style = doc.defaultView.getComputedStyle(node);
        var ctx = doc.createElement('canvas').getContext('2d');
        if (!ctx) return target;
        ctx.font = style.fontStyle + ' ' + style.fontWeight + ' ' + target + 'px ' + style.fontFamily;
        var original = parseFloat(style.fontSize) || target;
        var spacing = (parseFloat(style.letterSpacing) || 0) * target / original;
        var measured = new Map(), longest = 0;
        values.forEach(function (value) {
            var text = value == null ? '' : String(value);
            if (!measured.has(text)) measured.set(text, ctx.measureText(text).width + Math.max(0, Array.from(text).length - 1) * spacing);
            longest = Math.max(longest, measured.get(text));
        });
        // Stop at half the target (at least 12px, never above the target).
        // Ellipsis handles pathological values without making the whole round tiny.
        var floor = Math.min(target, Math.max(12, target * .5));
        return Math.max(floor, Math.min(target, longest ? target * Math.max(0, width - 2) / longest : target));
    }
    return { scale: scale, fit: fit };
});
