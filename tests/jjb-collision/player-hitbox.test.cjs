const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../public/static/js/wechatjs/appjjb.js'), 'utf8');

function startGame(value, width = 300, height = 300) {
    const calls = [];
    const player = { width, height, anchor: { set() {} } };
    let game;
    class FakeGame {
        constructor() {
            game = this;
            this.world = { centerX: 375 };
            this.height = 1200;
            this.add = { sprite: () => player };
            this.physics = {
                startSystem() {},
                arcade: {
                    enable(sprite) {
                        sprite.body = { sourceWidth: width, sourceHeight: height, setSize(...args) { calls.push(args); } };
                    },
                },
            };
            this.state = { add() {}, start() {} };
        }
    }
    const stop = new Error('stop after player setup');
    let app;
    const context = {
        define(name, deps, factory) { app = factory({}, {}, {}); },
        Phaser: { Game: FakeGame, CANVAS: 1, Physics: { ARCADE: 1 } },
        Gameconfig: { gameW: 750, gameH: 1200 },
        window: { getComputedStyle: () => ({ getPropertyValue: () => value }) },
        document: { documentElement: {} },
    };
    vm.runInNewContext(source, context);
    app.initGame();
    game.States.gameState.onStart = () => { throw stop; };
    assert.throws(() => game.States.gameState.create(), error => error === stop);
    return { calls, player };
}

test('the sheep style narrows only the physical body to the bag', () => {
    const { calls, player } = startGame('0.45 0.38 0.5 0.52');
    assert.deepEqual(calls, [[150, 156, 135, 114]]);
    assert.equal(player.width, 300);
    assert.equal(player.height, 300);
    assert.equal(player.body.collideWorldBounds, true);
});

test('styles without a collision setting keep the original body', () => {
    assert.deepEqual(startGame('').calls, []);
    assert.deepEqual(startGame('   ').calls, []);
});

test('invalid or out-of-bounds settings leave collision unchanged', () => {
    for (const value of ['0.4 0.3 0.5', '0.9 0.2 0.2 0.5', '0.1 0.1 0 0.5', '0 0 NaN 1', '-0.1 0 0.5 0.5']) {
        assert.deepEqual(startGame(value).calls, [], value);
    }
});

test('the hitbox follows the unscaled source image dimensions', () => {
    const { calls } = startGame('0.25 0.25 0.5 0.5', 180, 202);
    assert.deepEqual(calls, [[90, 101, 45, 50.5]]);
});
