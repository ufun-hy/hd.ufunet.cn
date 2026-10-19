// Run in the existing Ego task space. No save/upload/business API is called.
const { strict: assert } = await import('node:assert');
const task = await taskSpace(globalThis.CONFIG_TEST_SPACE), page = task.page('p1');
const cases = [];
for (const mode of ['activity', 'web']) for (const initial of ['1', '2', '3', '4', '5', '6', '7']) {
    await page.goto(`http://127.0.0.1:8767/tests/importcj-config/?mode=${mode}&flytype=${initial}`);
    await page.waitForFunction(() => window.fixtureReady || window.fixtureError);
    const result = await page.evaluate(() => {
        if (window.fixtureError) return { errors: [window.fixtureError] };
        const errors = [], form = document.querySelector('#formBox');
        const check = (condition, label) => { if (!condition) errors.push(label); };
        const serialize = () => window.fixtureSerialize($(form));
        const select = type => $('#styleconfigbox .importcj-style-picker [data-val="' + type + '"]').trigger('click');
        const isVisible = node => !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length);
        const verifyStyle = type => {
            check(serialize()['styleconfig[flytype]'] === type, 'saved style ' + type);
            document.querySelectorAll('[data-importcj-styles]').forEach(panel => {
                check(isVisible(panel) === panel.dataset.importcjStyles.split(' ').includes(type), 'panel visibility ' + panel.dataset.importcjStyles + ' at ' + type);
            });
            check(document.querySelectorAll('.importcj-style-picker .hadchecked').length === 1, 'one selected style');
            check(document.querySelector('.importcj-style-picker .hadchecked').dataset.val === type, 'selected style');
            const fields = {rolltxt1:['1'],over8linenum:['1'],flyonesize:['2'],flygridsize:['3'],flysphereballw:['4'],danmakusize:['6'],maxrollnum:['1','5','6'],color:['1','2','3','4','5','7']};
            for (const [key, styles] of Object.entries(fields)) check(isVisible(form.querySelector('[name="styleconfig['+key+']"]')) === styles.includes(type), 'applicable field ' + key + ' at ' + type);
        };
        verifyStyle(window.fixtureReady.flytype);
        check(!document.querySelector('#importcj-legacy-settings').open, 'legacy initially collapsed');
        check(form.querySelectorAll('[name="autoscroll"]').length === 1, 'single autoscroll input');
        check(form.querySelectorAll('[name="styleconfig[resultcardcolor]"]').length === 1, 'single result config');
        const order = [...form.querySelectorAll('.config-titlename')].map(node => node.textContent.trim());
        check(JSON.stringify(order) === JSON.stringify(['基础与数据','抽奖风格与过程','结果与记录','音效与启动过渡','旧版兼容设置']), 'section order');
        form.querySelector('[name="styleconfig[flysphereballw]"]').value = '1777';
        const before = serialize();
        for (const type of ['7','6','4','1','5','3','2','7','6','4']) { select(type); verifyStyle(type); }
        // Compare every submitted setting except the deliberately selected style.
        const after = serialize();
        check(Object.keys(before).length === Object.keys(after).length, 'same serialized field count');
        for (const key of Object.keys(before)) if (key !== 'styleconfig[flytype]') {
            check(JSON.stringify(before[key]) === JSON.stringify(after[key]), 'preserved ' + key);
        }
        check(after['styleconfig[flysphereballw]'] === '1777', 'edited sphere value preserved');
        check(after['autoscroll'] === '1' && after['styleconfig[baozhavideo]'] === 'end.mp4', 'collapsed legacy values serialized');
        check(!form.querySelector('[data-importcj-styles] :disabled'), 'hidden inputs stay enabled');
        select('6');
        const modeInput = value => form.querySelector('[name="styleconfig[danmakucolormode]"][value="'+value+'"]');
        modeInput('random').checked = true; $(modeInput('random')).trigger('change');
        check(!isVisible(form.querySelector('.danmaku-color-picker')), 'random color hides picker');
        select('4');select('6');
        check(modeInput('random').checked && !isVisible(form.querySelector('.danmaku-color-picker')), 'color mode survives style switch');
        modeInput('fixed').checked = true; $(modeInput('fixed')).trigger('change');
        check(isVisible(form.querySelector('.danmaku-color-picker')), 'fixed color shows picker');
        const target = $('.importcj-style-picker [data-val="3"]');
        target.trigger($.Event('keydown', { key: 'Enter', target: target[0] }));
        verifyStyle('3');
        check(window.fixtureUploadCalls === 0, 'no incidental upload from style keyboard selection');
        document.querySelector('#importcj-legacy-settings').open = true;
        check(isVisible(form.querySelector('[name="styleconfig[baozhavideo]"]')), 'legacy can be inspected');
        document.querySelector('#importcj-legacy-settings').open = false;
        return { errors, mode: window.fixtureReady.mode, initial: window.fixtureReady.flytype, keys: Object.keys(after).length };
    });
    cases.push(result);
    assert.deepEqual(result.errors, [], JSON.stringify(result));
}
console.log({ cases, result: 'PASS: both entry templates, seven initial styles, switching, preserved serialized settings, legacy disclosure and keyboard selection' });
