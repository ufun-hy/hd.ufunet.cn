define('appcutfruit', ['appsocket', 'wechatcore', 'phaser'], function (appsocket, wechatcore) {
  var mathTool = {
    // 计算延长线,p2往p1延长(private)
    calcParallel: function (p1, p2, L) {
      var p = {};
      if (p1.x == p2.x) {
        if (p1.y - p2.y > 0) {
          p.x = p1.x;
          p.y = p1.y + L;
        } else {
          p.x = p1.x;
          p.y = p1.y - L;
        }
      } else {
        var k = (p2.y - p1.y) / (p2.x - p1.x);
        if (p2.x - p1.x < 0) {
          p.x = p1.x + L / Math.sqrt(1 + k * k);
          p.y = p1.y + L * k / Math.sqrt(1 + k * k);
        } else {
          p.x = p1.x - L / Math.sqrt(1 + k * k);
          p.y = p1.y - L * k / Math.sqrt(1 + k * k);
        }
      }
      p.x = Math.round(p.x);
      p.y = Math.round(p.y);
      return new Phaser.Point(p.x, p.y);
    },
    // 计算垂直线,p2点开始垂直(private)
    calcVertical: function (p1, p2, L, isLeft) {
      var p = {};
      if (p1.y == p2.y) {
        p.x = p2.x;
        if (isLeft) {
          if (p2.x - p1.x > 0) {
            p.y = p2.y - L;
          } else {
            p.y = p2.y + L;
          }
        } else {
          if (p2.x - p1.x > 0) {
            p.y = p2.y + L;
          } else {
            p.y = p2.y - L;
          }
        }
      } else {
        var k = -(p2.x - p1.x) / (p2.y - p1.y);
        if (isLeft) {
          if (p2.y - p1.y > 0) {
            p.x = p2.x + L / Math.sqrt(1 + k * k);
            p.y = p2.y + L * k / Math.sqrt(1 + k * k);
          } else {
            p.x = p2.x - L / Math.sqrt(1 + k * k);
            p.y = p2.y - L * k / Math.sqrt(1 + k * k);
          }
        } else {
          if (p2.y - p1.y > 0) {
            p.x = p2.x - L / Math.sqrt(1 + k * k);
            p.y = p2.y - L * k / Math.sqrt(1 + k * k);
          } else {
            p.x = p2.x + L / Math.sqrt(1 + k * k);
            p.y = p2.y + L * k / Math.sqrt(1 + k * k);
          }
        }
      }
      p.x = Math.round(p.x);
      p.y = Math.round(p.y);
      return new Phaser.Point(p.x, p.y);
    },
    // 形成刀光点
    generateBlade: function (points) {
      var res = [];
      if (points.length <= 0) {
        return;
      } else if (points.length == 1) {
        var oneLength = 6;
        res.push(new Phaser.Point(points[0].x - oneLength, points[0].y));
        res.push(new Phaser.Point(points[0].x, points[0].y - oneLength));
        res.push(new Phaser.Point(points[0].x + oneLength, points[0].y));
        res.push(new Phaser.Point(points[0].x, points[0].y + oneLength));
      } else {
        var tailLength = 10;
        var headLength = 20;
        var tailWidth = 1;
        var headWidth = 6;
        res.push(this.calcParallel(points[0], points[1], tailLength));
        for (var i = 0; i < points.length - 1; i++) {
          res.push(this.calcVertical(points[i + 1], points[i], Math.round((headWidth - tailWidth) * i / (points.length - 1) + tailWidth), true));
        }
        res.push(this.calcVertical(points[points.length - 2], points[points.length - 1], headWidth, false));
        res.push(this.calcParallel(points[points.length - 1], points[points.length - 2], headLength));
        res.push(this.calcVertical(points[points.length - 2], points[points.length - 1], headWidth, true));
        for (var i = points.length - 1; i > 0; i--) {
          res.push(this.calcVertical(points[i], points[i - 1], Math.round((headWidth - tailWidth) * (i - 1) / (points.length - 1) + tailWidth), false));
        }
      }
      return res;
    },
    randomMinMax: function (min, max) {
      return Math.random() * (max - min) + min;
    },
    randomPosX: function () {
      return this.randomMinMax(100, game.width - 100);
    },
    randomPosY: function () {
      return this.randomMinMax(-750, 0) + game.height;
    },
    randomVelocityX: function (posX) {
      if (posX < 0) {
        return this.randomMinMax(100, 500);
      } else if (posX >= 0 && posX < game.width / 2) {
        return this.randomMinMax(0, 500);
      } else if (posX >= game.width / 2 && posX < game.width) {
        return this.randomMinMax(-500, 0);
      } else {
        return this.randomMinMax(-500, -100);
      }
    },
    randomVelocityY: function () {
      return this.randomMinMax(-1000, -950);
    },
    degCos: function (deg) {
      return Math.cos(deg * Math.PI / 180);
    },
    degSin: function (deg) {
      return Math.sin(deg * Math.PI / 180);
    },
    shuffle: function (o) {
      for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    }
  };
  var Bomb = function (envConfig) {
    var env = {};
    var game = null;
    var sprite = null;
    var init = function () {
      env = envConfig;
      game = env.game;
      initSprite();
    };
    var initSprite = function () {
      sprite = game.add.sprite(env.x || 0, env.y || 0, 'bomb');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.scale.set(1.5);
      game.physics.enable(sprite, Phaser.Physics.ARCADE);
    };
    var explode = function () {
      this.boomani();
    };
    var boomani = function () {
      var bsprite = game.add.sprite(sprite.body.x + sprite.width / 2, sprite.body.y + sprite.height / 2, 'boomcut');
      bsprite.anchor.setTo(0.5, 0.5);
      bsprite.scale.set(2);
      bsprite.animations.add('boomed', [0, 1, 2]);
      bsprite.animations.play('boomed', 20, false, true);
      sprite.kill();
    };
    init();
    this.sprite = function () {
      return sprite;
    };
    this.explode = explode;
    this.boomani = boomani;
  };
  var Fruit = function (envConfig) {
    var env = {};
    var game = null;
    var sprite = null;
    var halfOne;
    var halfTwo;
    var init = function () {
      env = envConfig;
      game = env.game;
      sprite = game.add.sprite(env.x || 0, env.y || 0, env.key);
      sprite.anchor.setTo(0.5, 0.5);
      sprite.scale.set(1.5);
      game.physics.enable(sprite, Phaser.Physics.ARCADE);
    };
    var half = function (deg, shouldEmit) {
      halfOne = game.add.sprite(sprite.body.x + sprite.width / 2, sprite.body.y + sprite.height / 2, env.key + '-1');
      halfOne.anchor.setTo(0.5, 0.5);
      halfOne.scale.set(1.5);
      halfOne.rotation = deg + 45;
      game.physics.enable(halfOne, Phaser.Physics.ARCADE);
      halfOne.body.velocity.x = 100 + sprite.body.velocity.x;
      halfOne.body.velocity.y = sprite.body.velocity.y;
      halfOne.body.gravity.y = 2000;
      halfOne.checkWorldBounds = true;
      halfOne.outOfBoundsKill = true;
      halfTwo = game.add.sprite(sprite.body.x + sprite.width / 2, sprite.body.y + sprite.height / 2, env.key + '-2');
      halfTwo.anchor.setTo(0.5, 0.5);
      halfTwo.scale.set(1.5);
      halfTwo.rotation = deg + 45;
      game.physics.enable(halfTwo, Phaser.Physics.ARCADE);
      halfTwo.body.velocity.x = -100 + sprite.body.velocity.x;
      halfTwo.body.velocity.y = sprite.body.velocity.y;
      halfTwo.body.gravity.y = 2000;
      halfTwo.checkWorldBounds = true;
      halfTwo.outOfBoundsKill = true;
      sprite.kill();
      if (shouldEmit) {
        this.cutani();
      }
    };
    var cutani = function () {
      var goal = game.add.image(sprite.body.x + sprite.width / 2, sprite.body.y + sprite.height / 2, 'fruitcut');
      var goalImg = game.cache.getImage(sprite.key);
      goal.alpha = 0;
      goal.anchor.set(0.5, 0.5);
      goal.scale.set(mathTool.randomMinMax(1, 4) / 10);
      var showTween = game.add.tween(goal).to({ alpha: 1 }, 100, Phaser.Easing.Linear.None, true, 0, 0, false);
      showTween.onComplete.add(function () {
        var hideTween = game.add.tween(goal).to({ alpha: 0 }, 100, Phaser.Easing.Linear.None, true, 200, 0, false);
        hideTween.onComplete.add(function () {
          goal.kill();
        });
      });
    };
    init();
    this.sprite = function () {
      return sprite;
    };
    this.half = half;
    this.cutani = cutani;
  };
  var Blade = function (envConfig) {
    var env = {};
    var game = null;
    var points = [];
    var blade = null;
    var graphics = null;
    var POINTLIFETIME = 200;
    var allowBlade = false;
    var lastPoint = null;
    var init = function () {
      env = envConfig;
      game = env.game;
      blade = new Phaser.Polygon();
      graphics = game.add.graphics(0, 0);
      game.input.onUp.add(function () {
        allowBlade = false;
        graphics.clear();
      });
      game.input.onDown.add(function () {
        allowBlade = true;
      });
    };
    var update = function () {
      if (allowBlade && appcutfruit.gamestatus == 2) {
        graphics.clear();
        if (game.input.onDown) {
          var point = new Phaser.Point(game.input.x, game.input.y);
          if (!lastPoint) {
            lastPoint = point;
            point.time = new Date().getTime();
            points.push(point);
          } else {
            var dis = (lastPoint.x - point.x) * (lastPoint.x - point.x) +
              (lastPoint.y - point.y) * (lastPoint.y - point.y);
            if (dis > 300) {
              lastPoint = point;
              point.time = new Date().getTime();
              points.push(point);
            }
          }
        }
        if (points.length < 1) {
          return;
        }
        if (new Date().getTime() - points[0].time > POINTLIFETIME) {
          points.shift();
        }
        if (points.length < 1) {
          return;
        }
        blade.setTo(mathTool.generateBlade(points));
        graphics.beginFill(0xffffff);
        graphics.drawPolygon(blade.points);
        graphics.endFill();
      }
    };
    var checkCollide = function (sprite, onCollide) {
      if (allowBlade && game.input.onDown && points.length > 2) {
        for (var i = 0; i < points.length; i++) {
          if (Phaser.Rectangle.contains(sprite.body, points[i].x, points[i].y)) {
            onCollide();
            break;
          }
        }
      }
    };
    var collideDeg = function () {
      var deg;
      var len = points.length;
      if (points[0].x == points[len - 1].x) {
        deg = 90;
      } else {
        var val = (points[0].y - points[len - 1].y) / (points[0].x - points[len - 1].x);
        deg = Math.round(Math.atan(val) / Math.PI * 180);
      }
      if (deg < 0) {
        deg = deg + 180;
      }
      return deg;
    };
    init(envConfig);
    this.allowBlade = function () {
      allowBlade = true;
    };
    this.update = update;
    this.checkCollide = checkCollide;
    this.collideDeg = collideDeg;
  };
  var BootScene = {
    init: function () {
      game.scale.pagesAlignHorizontally = true;
      game.scale.pageAlignVertically = true;
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    },
    preload: function () {
      game.load.crossOrigin = 'anonymous';
      //game.load.image('gamebg',Gameconfig.gameImgs.gamebg);
    },
    create: function () {
      game.state.start('preload');
    }
  };
  var loadtext, progresstxt;
  var PreloadScene = {
    init: function () {
      loadtext = game.add.text(game.world.centerX, game.world.centerY, '游戏正在加载中..', { fill: '#fff', fontSize: '50px' });
      loadtext.anchor.set(0.5);
      loadtext.scale.set(0.8);
      progresstxt = game.add.text(game.world.centerX, game.world.centerY + 50, '0%', { fill: '#fff', fontSize: '30px' });
      progresstxt.anchor.set(0.5);
    },
    preload: function () {
      game.load.image('apple', Gameconfig.gameImgs.apple);
      game.load.image('apple-1', Gameconfig.gameImgs.apple1);
      game.load.image('apple-2', Gameconfig.gameImgs.apple2);
      game.load.image('banana', Gameconfig.gameImgs.banana);
      game.load.image('banana-1', Gameconfig.gameImgs.banana1);
      game.load.image('banana-2', Gameconfig.gameImgs.banana2);
      game.load.image('basaha', Gameconfig.gameImgs.basaha);
      game.load.image('basaha-1', Gameconfig.gameImgs.basaha1);
      game.load.image('basaha-2', Gameconfig.gameImgs.basaha2);
      game.load.image('peach', Gameconfig.gameImgs.peach);
      game.load.image('peach-1', Gameconfig.gameImgs.peach1);
      game.load.image('peach-2', Gameconfig.gameImgs.peach2);
      game.load.image('sandia', Gameconfig.gameImgs.sandia);
      game.load.image('sandia-1', Gameconfig.gameImgs.sandia1);
      game.load.image('sandia-2', Gameconfig.gameImgs.sandia2);
      game.load.image('bomb', Gameconfig.gameImgs.bomb);
      game.load.image('gameover', Gameconfig.gameImgs.gameover);
      game.load.image('pmbtn', Gameconfig.gameImgs.pmbtn);
      game.load.image('titleimg', Gameconfig.gameImgs.titleimg);
      game.load.image('scorebox', Gameconfig.gameImgs.scorebox);
      game.load.image('timebox', Gameconfig.gameImgs.timebox);
      game.load.image('fruitcut', Gameconfig.gameImgs.fruitcut);
      game.load.spritesheet('boomcut', Gameconfig.gameImgs.boomcut, 140, 147);
      //game.load.audio('bgv', Gameconfig.gameImgs.bgv, true);
      game.load.audio('boomv', Gameconfig.gameImgs.boomv, true);
      game.load.audio('cutv', Gameconfig.gameImgs.cutv, true);
      game.load.audio('overv', Gameconfig.gameImgs.overv, true);
      if (Gameconfig.gameImgs.bgv) {
        game.load.audio('bgv', Gameconfig.gameImgs.bgv, true);
      }
      game.load.onFileComplete.add(function (progress) {
        progresstxt.text = progress + '%';
      });
      game.load.onLoadComplete.add(function () {
        var voices = ['boomv', 'cutv', 'overv'];
        game.sound.setDecodedCallback(voices, function () {
          loadtext.destroy();
          progresstxt.destroy();
          appcutfruit.closerule != '1' && $(".gamerule").removeClass('hidden');
          game.state.start('main');
          appcutfruit.initsocket();
        }, this);
      });
    },
  };
  var MainScene = {
    create: function () {
      /*
      this.bg = game.add.sprite(0, 0, 'gamebg');
      this.bg.width = Gameconfig.gameW;
      this.bg.height = Gameconfig.gameH;
      */
      this.titleimg = game.add.sprite(game.world.centerX, game.world.centerY - 200, 'titleimg');
      this.titleimg.anchor.set(0.5);
      this.titleimg.scale.set(0.96);
      this.gametxt = game.add.text(game.world.centerX, game.world.centerY + 180, '等待游戏开始', { fill: '#fff', fontSize: '32px' });
      this.gametxt.anchor.set(0.5);
      if (!game.musicPause && $("#bgm").length > 0) {
        wechatcore.playAudio($("#bgm")[0]);
        game.musicPause = true;
      }
    },
    update: function () {
      this.gametxt.text = appcutfruit.gametip;
    },
  };
  var PlayScene = {
    create: function () {
      game.physics.startSystem(Phaser.Physics.ARCADE);
      this.gravity = 1000;
      this.fruits = [];
      this.playing = true;
      this.bombExplode = false;
      this.blade = new Blade({
        game: game
      });
      this.blade.allowBlade();
      this.lostCount = 0;
      this.scoreAnim();
      this.scoreTextAnim();
      this.timeAnim();
      this.timeTextAnim();
      this.gameoverBox();
      this.boomv = game.add.audio('boomv', 0.2, false);
      this.cutv = game.add.audio('cutv', 0.2, false);
      this.overv = game.add.audio('overv', 0.2, false);
      if ($("#bgm").length > 0 && game.musicPause) {
        if (!$("#bgm")[0].paused) $("#bgm")[0].pause();
        game.musicPause = false;
      }
    },
    update: function () {
      if (!this.bombExplode) {
        for (var i = 0; i < this.fruits.length; i++) {
          var fruit = this.fruits[i];
          if (fruit.sprite().body.velocity.y > 0 && !fruit.sprite().inWorld) {
            if (fruit.isFruit) {
              this.onOut(fruit);
            }
            fruit.sprite().kill();
            fruit = null;
            this.fruits.splice(i, 1);
          }
        }
      }
      if (this.playing && this.fruits.length <= 1 && !this.bombExplode) {
        this.startFruit();
      }
      this.blade.update();
      if (!this.bombExplode) {
        for (var i = 0; i < this.fruits.length; i++) {
          var fruit = this.fruits[i];
          this.blade.checkCollide(fruit.sprite(), function () {
            this.onKill(fruit);
            this.fruits.splice(i, 1);

          }.bind(this));
        }
      }
      this.timeText.text = "" + appcutfruit.gametime;
      if (this.playing && appcutfruit.gamestatus == 3 && appcutfruit.gametime == 0) {
        this.gameOver();
      }
      appcutfruit.showpmbtn ? (this.pmbtn.visible = true) : (this.pmbtn.visible = false);
    },
    playAudio: function (audio) {
      wechatcore.playAudio(audio, '2');
    },
    scoreAnim: function () {
      this.scoreImage = game.add.image(8, 20, 'scorebox');
      this.scoreImage.scale.set(0.7);
      this.scoreImage.x = -this.scoreImage.width * 0.7;
      this.scoreImage.visible = Gameconfig.showscorebox == '1' ? true : false;
      game.add.tween(this.scoreImage).to({ x: 8 }, 300, Phaser.Easing.Sinusoidal.InOut, true);
    },
    scoreTextAnim: function () {
      this.scoreText = game.add.text(146, 34, appcutfruit.myscore + '', { font: 'fruitfont', fill: '#fff', fontSize: '50px', fontWeight: 'bold' });
      this.scoreText.x = -this.scoreText.width;
      this.scoreText.visible = Gameconfig.showscorebox == '1' ? true : false;
      game.add.tween(this.scoreText).to({ x: 146 }, 300, Phaser.Easing.Sinusoidal.InOut, true);
    },
    timeAnim: function () {
      this.timeImage = game.add.image(8, 20, 'timebox');
      this.timeImage.scale.set(0.7);
      this.timeImage.x = game.width + this.timeImage.width * 0.7;
      game.add.tween(this.timeImage).to({ x: game.width - this.timeImage.width - 8 }, 300, Phaser.Easing.Sinusoidal.InOut, true);
    },
    timeTextAnim: function () {
      var timeImg = game.cache.getImage('timebox');
      var timeTxtX = game.width - timeImg.width * 0.7 / 2 + 8;
      this.timeText = game.add.text(timeTxtX, 34, appcutfruit.gametime, { font: 'fruitfont', fill: '#fff', fontSize: '50px', fontWeight: 'bold' });
      this.timeText.x = game.width + this.timeText.width;
      game.add.tween(this.timeText).to({ x: timeTxtX }, 300, Phaser.Easing.Sinusoidal.InOut, true);
    },
    gameoverBox: function () {
      this.overPopup = game.add.group();
      this.overBox = game.add.image(game.world.centerX, game.world.centerY, 'gameover');
      this.overBox.scale.set(0.92);
      this.overBox.anchor.set(0.5, 0.5);
      this.overPopup.add(this.overBox);
      this.overnum = game.add.text(game.world.centerX, game.world.centerY + 40, '您的得分:0', { font: 'fruitfont', fill: '#fff', fontSize: '30px', fontWeight: 'bold' });
      this.overnum.anchor.set(0.5, 0.5);
      this.overPopup.add(this.overnum);
      this.pmbtn = game.add.button(game.world.centerX, game.world.centerY + 130, 'pmbtn', function () {
        wechatcore.ajaxSubmit('/wechat/common/getphbdata', { gametype: XCV3Config.gametype, rotateid: appcutfruit.rotateid, gamephb: appcutfruit.gamephb, teamid: appcutfruit.myteam }, '正在获取排行榜数据').then(function (data) {
          if (data.code == 0) {
            if (data.msg.list.length > 0) {
              $("body").append(wechatcore.tpl($("#phb-tpl"), { list: data.msg.list, myrank: data.msg.myrank }));
              $("body .rank-close").click(function () {
                $(this).parent().parent().remove();
              });
            } else {
              wechatcore.msg('暂无数据');
            }
          } else {
            wechatcore.msg(data.msg);
          }
        }, function () {
          wechatcore.msg('网络太差，请稍后重试');
        });
      }, this);
      this.pmbtn.scale.set(0.96);
      this.pmbtn.anchor.set(0.5, 0.5);
      this.pmbtn.visible = false;
      this.overPopup.add(this.pmbtn);
      this.overPopup.visible = false;
    },
    startFruit: function () {
      var number = mathTool.randomMinMax(1, 5);
      var hasBomb = Math.floor(Math.random() * 2);
      var bombIndex = -1;
      if (hasBomb) {
        bombIndex = Math.floor(Math.random() * number);
      }
      for (var i = 0; i < number; i++) {
        if (i == bombIndex) {
          this.fruits.push(this.randomFruit(false));
        } else {
          this.fruits.push(this.randomFruit(true));
        }
      }
    },
    randomFruit: function (isFruit) {
      var fruitArray = ["apple", "banana", "basaha", "peach", "sandia"];
      var index = Math.floor(Math.random() * fruitArray.length);
      var x = mathTool.randomPosX();
      var y = mathTool.randomPosY();
      var vx = mathTool.randomVelocityX(x);
      var vy = mathTool.randomVelocityY();
      var fruit;
      if (isFruit) {
        fruit = new Fruit({
          game: game,
          key: fruitArray[index],
          x: x,
          y: y
        });
      } else {
        fruit = new Bomb({
          game: game,
          x: x,
          y: y
        });
      }
      fruit.isFruit = isFruit;
      fruit.sprite().body.velocity.x = vx;
      fruit.sprite().body.velocity.y = vy;
      fruit.sprite().body.gravity.y = this.gravity;
      return fruit;
    },
    onOut: function (fruit) {
      this.lostCount++;
    },
    onKill: function (fruit) {
      if (appcutfruit.gamestatus != 2) return;
      this.showScoretxt(fruit);
      if (fruit.sprite().key == 'bomb') {
        fruit.explode();
        this.playAudio(this.boomv);
      } else {
        var deg = this.blade.collideDeg();
        fruit.half(deg, true);
        this.playAudio(this.cutv);
      }
    },
    randColor: function () {
      var e = .78,
        t = ["rgba(141,50,160," + e + ")", "rgba(225,99,15," + e + ")", "rgba(242,73,73," + e + ")", "rgba(18,155,240," + e + ")", "rgba(90,162,12," + e + ")", "rgba(20,185,148," + e + ")"],
        n = Math.floor(6 * Math.random());
      return t[n];
    },
    showScoretxt: function (obj) {
      var keyname = obj.sprite().key;
      if (keyname == "bomb") {
        appcutfruit.myscore -= parseInt(appcutfruit.boomcut);
        appcutfruit.myscore < 0 && (appcutfruit.myscore = 0);
        this.scoreText.text = appcutfruit.myscore + '';
        var txt = '-' + appcutfruit.boomcut;
      } else {
        var fruitscore = keyname == 'apple' ? appcutfruit.applecut : keyname == 'banana' ? appcutfruit.bananacut : keyname == 'basaha' ? appcutfruit.basahacut : keyname == 'peach' ? appcutfruit.peachcut : appcutfruit.sandiacut;
        appcutfruit.myscore += parseInt(fruitscore);
        this.scoreText.text = appcutfruit.myscore + '';
        var txt = '+' + fruitscore;
      }
      var goal = game.add.text(obj.sprite().body.x + obj.sprite().width / 2, obj.sprite().body.y + obj.sprite().height / 2, txt, {
        font: 'fruitfont',
        fill: this.randColor(),
        fontSize: '90px',
        fontWeight: 'bold'
      });
      appcutfruit.workerdata();
      goal.alpha = 0;
      goal.anchor.set(0.5);
      var showTween = game.add.tween(goal).to({
        alpha: 1,
        y: goal.y - 100
      }, 100, Phaser.Easing.Linear.None, true, 0, 0, false);
      showTween.onComplete.add(function () {
        var hideTween = game.add.tween(goal).to({
          alpha: 0,
          y: goal.y - 200
        }, 100, Phaser.Easing.Bounce.Out, true, 400, 0, false);
        hideTween.onComplete.add(function () {
          goal.kill();
        });
      });
    },
    gameOver: function () {
      var _this = this;
      _this.playing = false;
      _this.boomv.stop();
      _this.cutv.stop();
      _this.overnum.text = "您的得分:" + appcutfruit.myscore;
      setTimeout(function () {
        _this.overPopup.visible = true;
        _this.playAudio(_this.overv);
      }, 400);
    }
  };
  var appcutfruit = {
    rotateid: 0,
    gamephb: 10,
    gamestatus: 0,
    loadtxt: null,
    progresstxt: null,
    applecut: 1,
    bananacut: 1,
    basahacut: 1,
    peachcut: 1,
    sandiacut: 1,
    boomcut: 1,
    gametime: 0,
    myscore: 0,
    level: 0,
    showpmbtn: false,
    gametip: '',
    isteam: '2',
    myteam: '0',
    gameteams: [],
    statustip: ['游戏还未开始', '正在倒计时，马上开始', '游戏开始了', '游戏已结束'],
    init: function () {
      var self = this;
      wechatcore.gameInit(function () {
        self.initGame();
        self.closerule = window.localStorage.getItem("closecutfruitrule-" + XCV3Config.hdid);
        self.bindEvent();
      });
    },
    initsocket: function () {
      var self = this;
      var params = {};
      params.onmessage = function (data) {
        if (data.type == 'connected') {
          appsocket.isclose = false;
          wechatcore.connectsocket({ clientid: data.clientid });
        } else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
          wechatcore.closeall();
          $(".rankInfo").remove();
          $(".appstartdjs").addClass('hidden');
          self.showpmbtn = false;
          self.rotateid = data.rotateid;
          self.initAudio();
          self.gametime = data.gametime;
          self.applecut = data.applecut;
          self.bananacut = data.bananacut;
          self.basahacut = data.basahacut;
          self.peachcut = data.peachcut;
          self.sandiacut = data.sandiacut;
          self.boomcut = data.boomcut;
          if (data.type == 'gameiswait') {
            self.gamestatus = 1;
            self.myscore = 0;
            self.isteam = data.isteam;
            self.gameteams = data.teams;
            self.myteam = data.team;
            self.gametip = self.statustip[0];
            if (game.state.current != 'main') {
              setTimeout(function () {
                game.state.start('main');
              }, 200);
            }
          } else {
            self.gamestatus = 2;
            self.myscore = data.myscore;
            if (game.state.current == 'main') {
              setTimeout(function () {
                game.state.start('play');
              }, 200);
            }
            self.gametip = self.statustip[2];
          }
          self.showteambox(data.teaminfo, data.jointype);
        } else if (data.type == 'gameiscountdown') {
          if ($("#bgm").length > 0 && game.musicPause) {
            if (!$("#bgm")[0].paused) $("#bgm")[0].pause();
            game.musicPause = false;
          }
          self.gamestatus = 1;
          self.myscore = 0;
          self.hidemyteambox();
          var b = $(".appstartdjs"), e = b.find(".appstartdjsBox"), s = b.find(".startdjsani");
          s.text(data.djs > 0 ? data.djs : 'GO');
          b.removeClass('hidden');
          self.gametip = self.statustip[1];
          wechatcore.playAudio(self.djsaudio);
          if (data.djs == 0) {
            self.gametip = self.statustip[2];
            setTimeout(function () {
              game.state.start('play');
            }, 3e2);
          }
        } else if (data.type == 'gameisdjs') {
          self.gamestatus = 2;
          self.hidemyteambox();
          if (self.gamestatus != 3 && game.state.current == 'main') {
            setTimeout(function () {
              game.state.start('play');
            }, 200);
          }
          $(".appstartdjs").addClass('hidden');
          self.gametime = data.djs;
          data.djs == 0 && self.endshake();
        } else if (data.type == 'gamecutfruitrefresh' || data.type == 'gameappcutfruitrefresh') {
          appsocket.closeClient();
        } else if (data.type == 'gameshowphbbtn') {
          self.gamestatus == 3 && self.showphbbtn(data.rotateid, data.gamephb);
        } else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
          self.gamestatus = 0;
          self.gametip = (data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt);
          self.myteam = '0';
          self.hideteamboxs();
        } else if (data.type == 'gamestartnojoin') {
          self.gamestatus = 0;
          self.gametip = '本轮游戏已经开始，无法加入';
          self.myteam = '0';
          self.hideteamboxs();
        } else if (data.type == 'gameneedpay') {
          self.gametip = '请先购买参与游戏资格';
          self.myteam = '0';
          self.hideteamboxs();
          wechatcore.gamePayrotate(data.rotateid, data.fee, function () {
            appsocket.closeClient();
          });
        } else if (data.type == "gamecutfruitrotatehadpay") {
          if (data.userid == XCV3Config.userid) {
            window.location.reload();
          }
        } else if (data.type == 'gameiserror') {
          self.myteam = '0';
          self.hideteamboxs();
          appsocket.closeClient();
        } else if (data.type == 'addblack') {
          data.userid == XCV3Config.userid && WeixinJSBridge.call('closeWindow');
        } else if (data.type == 'goto') {
          wechatcore.goto(data);
        } else if (data.type == 'luckeruserids') {
          wechatcore.layerAsklucker(data);
        } else if (data.type == 'gamejointeam') {
          if (data.userid == XCV3Config.userid && data.gametype == XCV3Config.gametype) {
            self.jointeam(data.team);
          }
        } else if (data.type == 'gameoutteam') {
          if (data.userid == XCV3Config.userid && data.gametype == XCV3Config.gametype) {
            self.outteam();
          }
        } else if (data.type == 'gameteamcannotjoin') {
          self.gametip = data.message;
          self.myteam = '0';
          self.hideteamboxs();
        }
      };
      appsocket.init(params);
    },
    initAudio: function () {
      var self = this;
      self.djsaudio = $("#djsaudio")[0];
    },
    bindEvent: function () {
      var self = this;
      $(".gamerule a").on('click', function () {
        $('.gamerule').addClass('hidden');
        window.localStorage.setItem("closecutfruitrule-" + XCV3Config.hdid, '1');
      });
    },
    teamEvent: function () {
      var self = this;
      $(".game-selteambox").off('click').on('click', '.game-team', function () {
        var $this = $(this);
        if ($this.hasClass('issel')) {
          $this.removeClass('issel');
          $this.find('.checkbox').addClass('hidden');
        } else {
          $this.addClass('issel').siblings().removeClass('issel');
          $(".game-selteambox .checkbox").addClass('hidden')
          $this.find('.checkbox').removeClass('hidden');
        }
      });
      $(".game-team-join .btn").off('click').on('click', function () {
        var selteamobj = $(".game-selteambox .game-team.issel");
        if (selteamobj.length == 0) {
          return wechatcore.msg('请选择一个团队');
        }
        wechatcore.ajaxSubmit('/wechat/common/gamejointeam', { gametype: XCV3Config.gametype, team: selteamobj.attr('data-team') }, '正在加入..').then(function (json) {
          if (json.code != 0) {
            wechatcore.msg(json.msg);
          }
        });
      });
      $(".game-myteam-tuichu .btn").off('click').on('click', function () {
        wechatcore.ajaxSubmit('/wechat/common/gameoutteam', { gametype: XCV3Config.gametype }, '正在退出..').then(function (json) {
          if (json.code != 0) {
            wechatcore.msg(json.msg);
          }
        });
      });
    },
    initteams: function () {
      var self = this, teamhtml = '';
      if (self.gameteams.length > 0) {
        $.each(self.gameteams, function (i, v) {
          teamhtml += wechatcore.tpl($("#team-tpl"), v);
        });
      }
      $(".game-selteambox .game-teams").html(teamhtml == '' ? '<p>本轮暂无团队，请先添加团队</p>' : teamhtml);
      self.teamEvent();
    },
    showteambox: function (teaminfo, jointype) {
      var self = this, teaminfo = teaminfo || '';
      if (self.isteam == '2') {
        $(".game-selteambox,.game-myteambox").addClass('hidden');
        return;
      }
      if (jointype == '3') {
        $(".game-myteambox .game-myteam-tuichu").addClass('hidden');
      } else {
        $(".game-myteambox .game-myteam-tuichu").removeClass('hidden');
      }
      self.initteams();
      if (self.myteam != '' && self.myteam != '0' && teaminfo != '') {
        $(".game-selteambox").addClass('hidden');
        var myteambox = $('.game-myteambox');
        myteambox.find('.game-myteam-logo img').attr('src', teaminfo.teamlogo || '');
        myteambox.find('.game-myteam-name').text(teaminfo.teamname || '');
        if (self.gamestatus == 1) {
          myteambox.removeClass('hidden');
        } else {
          myteambox.addClass('hidden');
        }
      } else {
        $('.game-myteambox').addClass('hidden');
        $(".game-selteambox").removeClass('hidden');
      }
    },
    jointeam: function (jointeam) {
      var self = this, selteambox = $('.game-selteambox');
      selteambox.find('.game-team').removeClass('issel');
      selteambox.find('.checkbox').addClass('hidden');
      selteambox.addClass('hidden');
      var myteambox = $('.game-myteambox');
      myteambox.find('.game-myteam-logo img').attr('src', jointeam.teamlogo);
      myteambox.find('.game-myteam-name').text(jointeam.teamname);
      if (self.gamestatus == 1) {
        myteambox.removeClass('hidden');
      } else {
        myteambox.addClass('hidden');
      }
      self.myteam = jointeam.id;
    },
    outteam: function () {
      var self = this, myteambox = $('.game-myteambox');
      myteambox.find('.game-myteam-logo img').attr('src', '');
      myteambox.find('.game-myteam-name').text('');
      myteambox.addClass('hidden');
      var selteambox = $('.game-selteambox');
      selteambox.find('.game-team').removeClass('issel');
      selteambox.find('.checkbox').addClass('hidden');
      selteambox.removeClass('hidden');
      self.myteam = '0';
    },
    hideteamboxs: function () {
      $(".game-selteambox,.game-myteambox").addClass('hidden');
    },
    hidemyteambox: function () {
      $(".game-myteambox").addClass('hidden');
    },
    endshake: function () {
      var self = this;
      self.gamestatus = 3;
      self.gametip = self.statustip[3];
      self.hideteamboxs();
    },
    workerdata: function () {
      var self = this;
      if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
      if (sendscore == '1') {
        appsocket.sendgamedata({
          myscore: self.myscore,
          myteam: self.myteam,
          rotateid: self.rotateid,
        });
      }
    },
    showphbbtn: function (rotateid, gamephb) {
      var self = this;
      self.showpmbtn = true;
      self.rotateid = rotateid;
      self.gamephb = gamephb;
    },
    initGame: function () {
      var self = this;
      game = new Phaser.Game(Gameconfig.gameW, Gameconfig.gameH, Phaser.CANVAS, 'zam-app-mainbox', null, true);
      game.musicPause = false;
      game.States = {};
      game.States.boot = function () {
        this.init = BootScene.init;
        this.preload = BootScene.preload;
        this.create = BootScene.create;
      }
      game.States.preload = function () {
        this.init = PreloadScene.init;
        this.preload = PreloadScene.preload;
      }
      game.States.main = function () {
        this.create = MainScene.create.bind(MainScene);
        this.update = MainScene.update.bind(MainScene);
      };

      game.States.play = function () {
        this.create = PlayScene.create.bind(PlayScene);
        this.update = PlayScene.update.bind(PlayScene);
      };
      game.state.add('boot', game.States.boot);
      game.state.add('preload', game.States.preload);
      game.state.add('main', game.States.main);
      game.state.add('play', game.States.play);
      game.state.start('boot');
    },
  };
  return appcutfruit;
});
