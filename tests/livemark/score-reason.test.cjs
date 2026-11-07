const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../../public/static/js/screenjs/screenlivemark.js'), 'utf8');
const start = source.indexOf("var tiphtml = '';");
const end = source.indexOf('self.detailPftype', start);
assert.ok(start >= 0 && end > start, 'score-tip rendering block exists');
const renderBlock = source.slice(start, end);

function render(score, reason, show, extra = {}) {
    let html = '';
    let label = '';
    let title = '';
    const labelNode = {
        text(value) { label = value; return this; },
        attr(name, value) { if (name === 'title') title = value; return this; },
    };
    const scoreTips = {
        html(value) { html = value; return this; },
        find() { return labelNode; },
    };
    const $ = selector => selector === '.decscorebox' ? { length: Number(show) } : scoreTips;
    $.trim = value => String(value).trim();
    vm.runInNewContext(renderBlock, {
        $, basicscore: score, json: { msg: { pfmode: '1', score_reason: reason, ...extra } }, isNaN,
    });
    return { html, label, title };
}

test('a reason replaces the generic label and keeps the signed amount', () => {
    const added = render(3, '表现优秀', true);
    assert.equal(added.label, '表现优秀');
    assert.equal(added.title, '表现优秀');
    assert.match(added.html, /\+3\.00分/);

    const deducted = render(-3.5, '迟到', true);
    assert.equal(deducted.label, '迟到');
    assert.match(deducted.html, /-3\.50分/);

    const untrusted = render(3, '<img src=x>', true);
    assert.equal(untrusted.label, '<img src=x>');
    assert.doesNotMatch(untrusted.html, /<img/);
});

test('older scores keep their labels; a disabled display hides the adjustment', () => {
    const legacy = render(3, '', true);
    assert.equal(legacy.label, '加分');
    assert.match(legacy.html, />3\.00分/);

    const hidden = render(3, '表现优秀', false, {
        pfmode: '2', maxmintype: '1', maxscore: '50', minscore: '20',
    });
    assert.doesNotMatch(hidden.html, /scoretip-adjust/);
    assert.match(hidden.html, /去最高/);
    assert.match(hidden.html, /去最低/);
});
