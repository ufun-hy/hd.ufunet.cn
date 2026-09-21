/*
 * ImportCJ compatibility entry.
 * Shared stage UI lives in screen-stage-ui.js; ImportCJ business logic remains in screenimportcj.js.
 */
define(['screenjs/screen-stage-ui'], function (screenStageUi) {
    'use strict';
    return screenStageUi;
});
