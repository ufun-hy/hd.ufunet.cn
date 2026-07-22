define('apppuzzle',['appsocket','wechatcore','phaser'],function(appsocket,wechatcore){
    var apppuzzle = {
        rotateid:0,
        gamephb:10,
        gamestatus: 0,
        loadtxt:null,
        progresstxt:null,
        totaltime:30,
        gametime:0,
        myscore:0,
        mytime:0,
        mypassnum:0,
        currentLevelIndex:0,
        roundimages:[],
        pieceimgkey:'pieceimg',
        showpmbtn:false,
        gametip:'',
        isteam:'2',
        myteam:'0',
        gameteams:[],
        statustip:['游戏还未开始','正在倒计时，马上开始','游戏开始了','游戏已结束'],
        init: function() {
            var self = this;
            wechatcore.gameInit(function(){
                self.initGame();
                self.closerule = window.localStorage.getItem("closepuzzlerule-"+XCV3Config.hdid);
                self.bindEvent();
            });
        },
        initsocket:function(){
            var self = this;
            var params={};
            params.onmessage = function(data){
                if(data.type=='connected'){
                    appsocket.isclose = false;
                    wechatcore.connectsocket({clientid:data.clientid});
                }else if(data.type=='gameiswait' || data.type=='gameisrun'){
                    wechatcore.closeall();
                    $(".rankInfo").remove();
                    $(".appstartdjs").addClass('hidden');
                    self.showpmbtn = false;
                    self.initAudio();
                    self.gametime = data.gametime;
                    self.totaltime = data.gametime;
                    self.roundimages = data.roundimages||[];
                    if(data.type=='gameiswait'){
                        self.gamestatus = 1;
                        self.myscore = 0;
                        self.mytime = 0;
                        self.mypassnum = 0;
                        self.currentLevelIndex = 0;
                        self.isteam = data.isteam;
                        self.gameteams = data.teams;
                        self.myteam = data.team;
                        self.gametip = self.statustip[0];
                        /*
                        if(game.state.current == 'menu'){
                            if(self.rotateid != data.rotateid){
                                game.state.start('menu');
                            }else{
                                if(self.roundimages.length > 0 && game.cache.checkImageKey(self.pieceimgkey)){
                                    var imgurl = $(game.cache.getImage(self.pieceimgkey)).attr('src');
                                    if(imgurl != self.roundimages[0].pimg){
                                        game.state.start('menu');
                                    }
                                }
                            }
                        }else{
                            game.state.start('menu');
                        }*/
                        game.state.start('menu');
                    }else{
                        self.gamestatus = 2;
                        self.myscore = data.myscore;
                        self.mytime = data.mytime;
                        self.mypassnum = data.mypass || 0;
                        self.currentLevelIndex = data.mypass || 0;
                        if(self.currentLevelIndex >= self.roundimages.length){
                            self.currentLevelIndex -= 1;
                        }
                        self.gametip = self.statustip[2];
                        if(game.state.current != 'main'){
                            game.state.start('menu');
                        }
                    }
                    self.showteambox(data.teaminfo,data.jointype);
                    self.rotateid = data.rotateid;
                }else if(data.type=='gameiscountdown'){
                    if($("#bgm").length > 0 && game.musicPause){
                        if(!$("#bgm")[0].paused) $("#bgm")[0].pause();
                        game.musicPause = false;
                    }
                    self.gamestatus = 1;
                    self.myscore = 0;
                    self.mytime = 0;
                    self.mypassnum = 0;
                    self.currentLevelIndex = 0;
                    self.hidemyteambox();
                    var b = $(".appstartdjs"),e = b.find(".appstartdjsBox"),s = b.find(".startdjsani");
                    s.text(data.djs>0?data.djs:'GO');
                    b.removeClass('hidden');
                    self.gametip = self.statustip[1];
                    wechatcore.playAudio(self.djsaudio);
                    if(data.djs==0){
                        self.gametip = self.statustip[2];
                    }
                }else if(data.type=='gameisdjs'){
                    self.gamestatus = 2;
                    self.hidemyteambox();
                    $(".appstartdjs").addClass('hidden');
                    self.gametime = data.djs;
                    if(data.djs==0){
                        self.endshake();
                    }
                }else if(data.type=='gamepuzzlerefresh'||data.type=='gameapppuzzlerefresh'){
                    appsocket.closeClient();
                }else if(data.type=='gameshowphbbtn'){
                    self.gamestatus==3 && self.showphbbtn(data.rotateid,data.gamephb);
                }else if(data.type=='gamenoround'||data.type=='gameislucker'){
                    self.gamestatus = 0;
                    self.gametip = (data.type=='gamenoround'?'暂无正在进行的轮次':XCV3Config.isluckertxt);
                    self.myteam = '0';
                    self.hideteamboxs();
                    game.state.start('menu');
                }else if(data.type=='gamestartnojoin'){
                    self.gamestatus = 0;
                    self.gametip = '本轮游戏已经开始，无法加入';
                    self.myteam = '0';
                    self.hideteamboxs();
                    game.state.start('menu');
                }else if(data.type=='gameneedpay'){
                    self.gametip = '请先购买参与游戏资格';
                    self.myteam = '0';
                    self.hideteamboxs();
                    wechatcore.gamePayrotate(data.rotateid,data.fee,function(){
                        appsocket.closeClient();
                    });
                    game.state.start('menu');
                }else if(data.type=="gamejumpracerotatehadpay"){
                  if(data.userid==XCV3Config.userid){
                    window.location.reload();
                  }
                }else if(data.type=='gameiserror'){
                    self.myteam = '0';
                    self.hideteamboxs();
                    appsocket.closeClient();
                }else if(data.type=='addblack'){
                    data.userid==XCV3Config.userid&&WeixinJSBridge.call('closeWindow');
                }else if(data.type=='goto'){
                    wechatcore.goto(data);
                }else if(data.type=='luckeruserids'){
                    wechatcore.layerAsklucker(data);
                }else if(data.type=='gamejointeam'){
                    if(data.userid==XCV3Config.userid && data.gametype==XCV3Config.gametype){
                        self.jointeam(data.team);
                    }
                }else if(data.type=='gameoutteam'){
                    if(data.userid==XCV3Config.userid && data.gametype==XCV3Config.gametype){
                        self.outteam();
                    }
                }else if(data.type=='gameteamcannotjoin'){
                    self.gametip = data.message;
                    self.myteam = '0';
                    self.hideteamboxs();
                }
            };
            appsocket.init(params);
        },
        initAudio: function(){
            var self = this;
            self.djsaudio = $("#djsaudio")[0];
        },
        bindEvent: function() {
            var self = this;
            $(".gamerule a").on('click',function(){
                $('.gamerule').addClass('hidden');
                window.localStorage.setItem("closepuzzlerule-"+XCV3Config.hdid,'1');
            });
        },
        teamEvent:function(){
          var self = this;
          $(".game-selteambox").off('click').on('click','.game-team',function(){
            var $this = $(this);
            if($this.hasClass('issel')) {
              $this.removeClass('issel');
              $this.find('.checkbox').addClass('hidden');
            }else{
              $this.addClass('issel').siblings().removeClass('issel');
              $(".game-selteambox .checkbox").addClass('hidden')
              $this.find('.checkbox').removeClass('hidden');
            }
          });
          $(".game-team-join .btn").off('click').on('click',function(){
            var selteamobj = $(".game-selteambox .game-team.issel");
            if(selteamobj.length==0){
              return wechatcore.msg('请选择一个团队');
            }
            wechatcore.ajaxSubmit('/wechat/common/gamejointeam',{gametype:XCV3Config.gametype,team:selteamobj.attr('data-team')}, '正在加入..').then(function(json){
              if(json.code!=0){
                wechatcore.msg(json.msg);
              }
            });
          });
          $(".game-myteam-tuichu .btn").off('click').on('click',function(){
            wechatcore.ajaxSubmit('/wechat/common/gameoutteam',{gametype:XCV3Config.gametype}, '正在退出..').then(function(json){
              if(json.code!=0){
                wechatcore.msg(json.msg);
              }
            });
          });
        },
        initteams:function(){
          var self = this,teamhtml = '';
          if(self.gameteams.length > 0){
            $.each(self.gameteams,function(i,v){
              teamhtml += wechatcore.tpl($("#team-tpl"),v);
            });
          }
          $(".game-selteambox .game-teams").html(teamhtml==''?'<p>本轮暂无团队，请先添加团队</p>':teamhtml);
          self.teamEvent();
        },
        showteambox:function(teaminfo,jointype){
          var self = this,teaminfo = teaminfo||'';
          if(self.isteam=='2'){
            $(".game-selteambox,.game-myteambox").addClass('hidden');
            return;
          }
          if(jointype=='3'){
            $(".game-myteambox .game-myteam-tuichu").addClass('hidden');
          }else{
            $(".game-myteambox .game-myteam-tuichu").removeClass('hidden');
          }
          self.initteams();
          if(self.myteam!='' && self.myteam!='0' && teaminfo!=''){
            $(".game-selteambox").addClass('hidden');
            var myteambox = $('.game-myteambox');
            myteambox.find('.game-myteam-logo img').attr('src',teaminfo.teamlogo||'');
            myteambox.find('.game-myteam-name').text(teaminfo.teamname||'');
            if(self.gamestatus==1){         
              myteambox.removeClass('hidden');
            }else{
              myteambox.addClass('hidden');
            }
          }else{
            $('.game-myteambox').addClass('hidden');
            $(".game-selteambox").removeClass('hidden');
          }
        },
        jointeam:function(jointeam){
          var self = this,selteambox = $('.game-selteambox');
          selteambox.find('.game-team').removeClass('issel');
          selteambox.find('.checkbox').addClass('hidden');
          selteambox.addClass('hidden');
          var myteambox = $('.game-myteambox');
          myteambox.find('.game-myteam-logo img').attr('src',jointeam.teamlogo);
          myteambox.find('.game-myteam-name').text(jointeam.teamname);
          if(self.gamestatus==1){
            myteambox.removeClass('hidden');
          }else{
            myteambox.addClass('hidden');
          }
          self.myteam = jointeam.id;
        },
        outteam:function(){
          var self = this,myteambox = $('.game-myteambox');
          myteambox.find('.game-myteam-logo img').attr('src','');
          myteambox.find('.game-myteam-name').text('');
          myteambox.addClass('hidden');
          var selteambox = $('.game-selteambox');
          selteambox.find('.game-team').removeClass('issel');
          selteambox.find('.checkbox').addClass('hidden');
          selteambox.removeClass('hidden');
          self.myteam = '0';
        },
        hideteamboxs:function(){
          $(".game-selteambox,.game-myteambox").addClass('hidden');
        },
        hidemyteambox:function(){
          $(".game-myteambox").addClass('hidden');
        },
        endshake:function(){
            var self = this;
            self.gamestatus = 3;
            self.gametip = self.statustip[3];
            self.hideteamboxs();
        },
        workerdata:function(){
            var self =this;
            if(self.gamestatus!=2 || (self.isteam=='1' && (self.myteam == '0' || self.myteam==''))) return;
            if(sendscore=='1') {
                wechatcore.ajaxSubmit('/wechat/common/sendgamedata',{
                    gametype:XCV3Config.gametype,
                    ddnum:self.myscore,
                    ys:self.mytime,
                    passnum:self.currentLevelIndex + 1,
                    myteam:self.myteam,
                }).then(function(json){
                    if(json.code==0){
                        
                    }else{
                        wechatcore.msg(json.msg);
                    }
                });
            }
        },
        showphbbtn:function(rotateid,gamephb){
            var self = this;
            self.showpmbtn = true;
            self.rotateid = rotateid;
            self.gamephb = gamephb;
        },
        initGame:function(){
            var self = this;
            var loaderState = function(game){
                var loadtxt,progresstxt,voices = ['scorebgm', 'overbgm', 'passbgm'];
                this.init = function(){
                    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                    this.scale.pageAlignHorizontally = true;
                    this.scale.pageAlignVertically = true;
                    this.scale.forcePortrait = true;
                    this.scale.refresh();
                }
                this.preload = function(){
                    loadtxt = this.game.add.text(game.world.centerX,game.world.centerY,'游戏正在加载中...',{fill:'#fff',fontSize:'42px'});
                    loadtxt.anchor.set(0.5);
                    loadtxt.scale.set(0.8);
                    progresstxt = this.game.add.text(game.world.centerX,game.world.centerY+100,'0%',{fill:'#fff',fontSize:'48px'});
                    progresstxt.anchor.set(0.5);
                    this.load.crossOrigin = 'anonymous';
                    this.load.image('title', Gameconfig.gameImgs.title);
                    this.load.image('topbg', Gameconfig.gameImgs.topbg);
                    this.load.image('rulebtn', Gameconfig.gameImgs.rulebtn);
                    this.load.image('voibtn', Gameconfig.gameImgs.voibtn);
                    this.load.image('overbox', Gameconfig.gameImgs.overbox);
                    this.load.image('pmbtn', Gameconfig.gameImgs.pmbtn);
                    this.load.image('progressbar', Gameconfig.gameImgs.progressbar);
                    this.load.image('progress', Gameconfig.gameImgs.progress);
                    this.load.audio('scorebgm', Gameconfig.gameImgs.scorebgm,true);
                    this.load.audio('overbgm', Gameconfig.gameImgs.overbgm,true);
                    this.load.audio('passbgm', Gameconfig.gameImgs.passbgm,true);
                    this.load.onFileComplete.add(function(progress){
                      progresstxt.text = progress + '%';
                    });
                    this.load.onLoadComplete.add(this.onLoadComplete,this);
                };
                this.onLoadComplete = function(){
                      if(voices.length > 0){
                        this.sound.setDecodedCallback(voices, function () {
                            this.startmenu();
                        }, this);
                      }else{
                        this.startmenu();
                      }
                }
                this.startmenu = function(){
                      loadtxt.destroy();
                      progresstxt.destroy();
                      self.initsocket();
                      self.closerule!='1' && $(".gamerule").removeClass('hidden');
                }
                this.shutdown = function() {
                     this.load.onLoadComplete.remove(this.onLoadComplete, this);
                }
            };
            var menuState = function(game){
                this.joinmain = false;
                this.init = function(){
                    if($("#appbgmusic").length > 0 ){
                        wechatcore.playAudio($("#appbgmusic")[0]);
                    }
                };
                this.preload = function(){
                    if(self.roundimages[self.currentLevelIndex] && self.roundimages[self.currentLevelIndex].pimg){
                        this.load.image(self.pieceimgkey, self.roundimages[self.currentLevelIndex].pimg);
                        this.load.onLoadComplete.add(this.onLoadComplete,this);
                    }
                }
                this.onLoadComplete = function(){
                    this.joinmain = true;
                }
                this.create = function(){
                    this.title = this.game.add.sprite(this.world.centerX, 0, "title");
                    this.title.y = - 200;
                    this.title.anchor.set(0.5);
                    this.game.add.tween(this.title).to({y:this.world.centerY - 140},500,Phaser.Easing.Bounce.In,true).onComplete.add(function(obj){
                        this.tiptxt = this.game.add.text(this.world.centerX,this.world.centerY + 100, "游戏未开始", {fontSize:"36px", fill:"#fff"});
                        this.tiptxt.anchor.set(0.5);
                        this.tiptxt.alpha = 0;
                        this.game.add.tween(this.tiptxt).to({alpha:1},100,'Linear',true,500);
                        this.btnrule = this.game.add.sprite(game.world.centerX, game.world.centerY + 300, 'rulebtn');
                        this.btnrule.anchor.set(0.5);
                        this.btnrule.inputEnabled = true;
                        this.btnrule.visible = openrulebtn=='1' ? true : false;
                        this.btnrule.events.onInputDown.add(function(){
                            $(".popup-in-modal").show();
                        },this);
                    },this);
                }
                this.update = function(){
                    if(this.tiptxt) this.tiptxt.text = self.gametip;
                    if(this.joinmain && self.gamestatus == 2){
                        game.state.start('main');
                    }
                }
                this.shutdown = function() {
                    this.joinmain = false;
                    this.load.onLoadComplete.remove(this.onLoadComplete, this);
                }
            };
            var mainState = function(game){
                this.preload = function(){
                    this.load.onLoadComplete.add(this.onLoadComplete, this);
                }
                this.onLoadComplete = function(){
                    this.makePieces();
                    if(this.scorebgm.isPlaying) this.scorebgm.stop();
                }
                this.shutdown = function() {
                    puzzleGroup.destroy(true);
                    this.load.onLoadComplete.remove(this.onLoadComplete, this);
                }
                this.create = function() {
                    var t = this;
                    if($("#appbgmusic").length > 0 ){
                        $("#appbgmusic")[0].pause();
                    }
                    this.roundnum = self.currentLevelIndex + 1;
                    this.gameisover = false;
                    this.allowDragStart = true;
                    this.allowDragStop = false;
                    this.startPosition = {};
                    this.scale = 1;
                    this.rows = 2;
                    this.topBg = game.add.sprite(0,0,'topbg');
                    this.rulebtn = game.add.text(100, 30, "游戏规则", {font: 'comicbook',fill:'#fff',fontSize:'24px',fontWeight:'bold'});
                    this.rulebtn.inputEnabled = true;
                    this.rulebtn.visible = openrulebtn=='1' ? true : false;
                    this.rulebtn.events.onInputDown.add(function(){
                        $(".popup-in-modal").show();
                    },this);
                    this.topBg.addChild(this.rulebtn);
                    this.scoretxt = game.add.text(this.topBg.width - 160, 30, "分数：0", {font: 'comicbook',fill:'#fff',fontSize:'24px',fontWeight:'bold'});
                    this.scoretxt.visible = Gameconfig.showscorebox=='1'?true:false;
                    this.topBg.addChild(this.scoretxt);
                    this.roundtxt = game.add.text(this.topBg.width / 2, 60, "第 1 关", { font: "bold 42px comicbook", fill: "#FFF"});
                    this.roundtxt.anchor.set(0.5);
                    this.topBg.addChild(this.roundtxt);
                    
                    this.jinduBg = game.add.sprite(0,200,'progressbar');
                    this.jindu = game.add.sprite(70,2,'progress');
                    this.jindu.width = 390;
                    this.jinduBg.addChild(this.jindu);
                    
                    this.jinduWord = game.add.text(this.jinduBg.width + 18, 4, "0 秒", {font: 'comicbook',fill:'#fff',fontSize:'32px',fontWeight:'bold'});
                    this.jinduBg.addChild(this.jinduWord);
                    this.jinduBg.x = game.world.centerX - (this.jinduWord.x + this.jinduWord.width) / 2;
                
                    this.voibtn = game.add.sprite(game.world.centerX, game.world.centerY, 'voibtn');
                    this.voibtn.anchor.set(0.5);
                    this.voibtn.visible = Gameconfig.showvoibtn == '1' ? true : false;
                    this.voibtn.inputEnabled = true;
                    this.popmask = game.add.graphics();
                    this.popmask.beginFill(0x000000, 0.6);
                    this.popmask.drawRect(0, 0, game.width, game.height);
                    this.popmask.visible = false;
                    
                    this.voibtn.events.onInputDown.add(this.createboximg,this);
                    this.voibtn.events.onInputUp.add(this.destroyboximg,this);
                    
                    this.puzzleGrouptip = game.add.text(game.world.centerX, game.world.centerY, "正在创建下一关卡...", {fill:'#ff9900',fontSize:'32px',fontWeight:'bold'});
                    this.puzzleGrouptip.anchor.set(0.5);
                    this.makePieces();
                    this.scoretip = game.add.text(game.world.centerX, game.world.centerY + 50, "0", {font: 'comicbook',fill:Gameconfig.scoretipcolor,fontSize:Gameconfig.scoretipsize+'px',fontWeight:'bold'});
                    this.scoretip.anchor.set(0.5);
                    this.scoretip.alpha = 0;
                    
                    this.scorebgm = this.game.add.audio('scorebgm', 1, false);
                    this.passbgm = this.game.add.audio('passbgm', 1, false);
                    this.overbgm = this.game.add.audio('overbgm', 1, false);
                    
                    this.passtip = game.add.text(game.world.centerX, game.world.centerY + 50, "恭喜，您已通过全部关卡", {font: 'comicbook',fill:'#fff',fontSize:'42px',fontWeight:'bold'});
                    this.passtip.anchor.set(0.5);
                    this.passtip.visible = false;
                };
                this.update = function(){
                    this.scoretxt.text = "分数：" + self.myscore;
                    this.roundtxt.text = "第 "+this.roundnum+" 关";
                    this.jindu.width = 390 * (self.gametime / self.totaltime); 
                    this.jinduWord.text = self.gametime +" 秒";
                    if(!this.gameisover && self.gamestatus==3 && self.gametime==0){
                        this.gameover();
                    }
                    if(self.mypassnum == self.roundimages.length) {
                        this.passtip.visible = true;
                    }
                    if(this.pmbtn){
                        self.showpmbtn ? (this.pmbtn.visible = true) : (this.pmbtn.visible = false);
                    }
                }
                this.createboximg = function(){
                    if(this.gameisover) return false;
                    this.boximg = game.add.sprite(puzzleGroup.x, puzzleGroup.y, self.pieceimgkey);
                    this.boximg.crop(new Phaser.Rectangle(0,0, this.puzzleWidth * this.rows, this.puzzleHeight * this.rows));
                    this.boximg.width = puzzleGroup.width - Gameconfig.kuanggap - Gameconfig.kuangshadowwith;
                    this.boximg.height = puzzleGroup.height - Gameconfig.kuanggap - Gameconfig.kuangshadowwith;
                    this.popmask.visible = true;
                }
                this.destroyboximg = function(){
                    if(this.boximg) this.boximg.destroy();
                    this.popmask.visible = false;
                }
               
                this.makePieces = function(){
                    this.rows = self.roundimages[self.currentLevelIndex].prows || 2;
                    var puzzleImage = game.cache.getImage(self.pieceimgkey);
                    this.puzzleWidth = Math.floor(puzzleImage.width / this.rows) - Gameconfig.piecegap;
                    this.puzzleHeight = Math.floor(puzzleImage.height / this.rows) - Gameconfig.piecegap;
                    var puzzleMaxWidth = Math.floor(650 / this.rows) - Gameconfig.piecegap;
                    var puzzleGroupMaxheight = window.innerHeight < 700 ? 700 : 900; 
                    var puzzleMaxHeight = Math.floor( puzzleGroupMaxheight / this.rows) - Gameconfig.piecegap;
                    this.scale = this.puzzleWidth >= puzzleMaxWidth ? puzzleMaxWidth / this.puzzleWidth : 1;
                    if(this.puzzleHeight * this.scale > puzzleMaxHeight ) this.puzzleHeight = puzzleMaxHeight;
                    puzzleGroup = game.add.group();
                    var pieces = [],len = this.rows * this.rows, sorts = this.getnorepeatNum(len);
                    for (var i = 0; i < len; i++) {
                        var xPos = (i % this.rows) * (this.puzzleWidth + Gameconfig.piecegap), yPos = Math.floor(i / this.rows) * (this.puzzleHeight + Gameconfig.piecegap),piece = game.add.sprite(xPos, yPos, self.pieceimgkey);
                        piece.crop(new Phaser.Rectangle(xPos, yPos, this.puzzleWidth, this.puzzleHeight));
                        piece.scale.set(this.scale);
                        piece.sort = i;
                        piece.nowSort = (self.mypassnum == self.roundimages.length ? i : sorts[i]);
                        piece.inputEnabled = true;
                        piece.input.bringToTop = true;
                        piece.input.enableDrag();
                        piece.input.enableSnap(this.puzzleWidth * this.scale, this.puzzleHeight * this.scale, false, true,Gameconfig.piecegap,Gameconfig.piecegap);
                        piece.events.onDragStart.add(this.dragStart, this);
                        piece.events.onDragStop.add(this.dragStop, this);
                        var lineColor = this.initColor(Gameconfig.warninglineColor), graphics = game.add.graphics(),spriteBounds = piece.getBounds();
                        graphics.lineStyle(Gameconfig.warninglineColor == '' ? 0 : Gameconfig.warninglineWidth, lineColor.hex || 0, lineColor.alpha || 1);
                        graphics.drawRect(spriteBounds.x, spriteBounds.y, spriteBounds.width, spriteBounds.height);
                        piece.b = piece.addChild(graphics);
                        piece.b.alpha = 0;
                        piece.b.key = 'pieceb';
                        pieces.push(piece);
                        puzzleGroup.addChild(piece);
                        
                    }
                    for (var i = 0; i < len; i++) {
                        var sort = pieces[i].nowSort, xPos = (sort % this.rows) * (this.puzzleWidth + Gameconfig.piecegap) * this.scale, yPos = Math.floor(sort / this.rows) * (this.puzzleHeight + Gameconfig.piecegap)  * this.scale;
                        pieces[i].x = xPos;
                        pieces[i].y = yPos;
                    }
                    puzzleGroup.x = game.world.centerX - puzzleGroup.width / 2;
                    puzzleGroup.y = game.world.centerY - puzzleGroup.height / 2 + 50;
                    this.jinduBg.y = puzzleGroup.y - (window.innerHeight < 700 ? 140 : 140);
                    this.voibtn.y = puzzleGroup.y + puzzleGroup.height  + (window.innerHeight < 700 ? 140 : 140);
                    this.makeGrouprectShadow();
                    this.puzzleGrouptip.visible = false;
                    this.roundstartTime = new Date();
                }
                this.makeGrouprectShadow = function(){
                    var spriteBounds = puzzleGroup.getBounds(), kuanglinecolor = this.initColor(Gameconfig.kuangcolor), kuang = game.add.graphics(0, 0),kuangshadowLinecolor = this.initColor(Gameconfig.kuangshadowcolor),shadow = game.add.graphics(0, 0);
                    if(kuanglinecolor == ''){
                        Gameconfig.kuangwidth = 0;
                    }
                    kuang.lineStyle(Gameconfig.kuangwidth, kuanglinecolor.hex || 0, kuanglinecolor.alpha || 1);
                    kuang.drawRoundedRect(spriteBounds.x - Gameconfig.kuanggap / 2, spriteBounds.y - Gameconfig.kuanggap / 2, spriteBounds.width + Gameconfig.kuanggap, spriteBounds.height + Gameconfig.kuanggap, Gameconfig.kuanggap);
                    puzzleGroup.add(kuang);
                    if(kuangshadowLinecolor == ''){
                        Gameconfig.kuangshadowwith = 0;
                    }
                    shadow.lineStyle(Gameconfig.kuangshadowwith, kuangshadowLinecolor.hex || 0, kuangshadowLinecolor.alpha || 1);
                    shadow.drawRoundedRect(spriteBounds.x - Gameconfig.kuanggap / 2, spriteBounds.y - Gameconfig.kuanggap / 2, spriteBounds.width + Gameconfig.kuanggap, spriteBounds.height + Gameconfig.kuanggap, Gameconfig.kuanggap);
                    puzzleGroup.add(shadow);
                }
                this.getnorepeatNum = function(max){
                    var arr = [...new Array(max).keys()];
                    let len = arr.length, index;
                    for (let i = len - 1; i >= 0; i--) {
                        index = Math.floor(Math.random() * i);
                        arr[index] = [arr[i], arr[i] = arr[index]][0];
                    }
                    return arr;
                }
                this.dragStart = function(sprite, pointer){
                    if(this.gameisover || (self.mypassnum > 0 && self.mypassnum == self.roundimages.length)) {
                        sprite.input.disableDrag();
                        return false;
                    }
                    if(Gameconfig.sortcorrectemove == '2' && sprite.sort === sprite.nowSort){
                        this.stopAlltween();
                        sprite.input.disableDrag();
                        game.add.tween(sprite.b).to({ alpha: 1 }, 100, null, true, 0, 2,true).onComplete.add(function(){
                            sprite.input.enableDrag();
                            sprite.b.alpha = 0;
                        })
                        return false;
                    }
                    if(this.allowDragStart){
                        this.stopAlltween();
                        sprite.input.bringToTop = true;
                        this.allowDragStart = false;
                        this.allowDragStop = true;
                        this.startPosition.x = sprite.x;
                        this.startPosition.y = sprite.y;
                    }else{
                        sprite.input.disableDrag();
                    }
                }
                this.dragStop = function(sprite, pointer){
                    var t = this,sw = sprite.width,sh = sprite.height;
                    if(this.gameisover || (self.mypassnum > 0 && self.mypassnum == self.roundimages.length)) {
                        sprite.x = this.startPosition.x;
                        sprite.y = this.startPosition.y;
                        return false;
                    }
                    if(this.allowDragStop){
                        this.allowDragStop = false;
                        if(this.startPosition.x === sprite.x && this.startPosition.y === sprite.y){
                            this.allowDragStart = true;
                            this.allowDragStop = false;
                            this.setGroupPiecesDraggable();
                        }else{
                            var temX = (sprite.x - Gameconfig.piecegap) / sw;
                            var temY = (sprite.y - Gameconfig.piecegap) / sh;
                            var outcount = this.rows - 1;
                            if(temX < 0 || temX > outcount || temY < 0 || temY > outcount){
                                game.add.tween(sprite).to( { x: this.startPosition.x, y: this.startPosition.y }, 300, Phaser.Easing.Quartic.Out, true).onComplete.add(function(){
                                    this.allowDragStart = true;
                                    this.allowDragStop = false;
                                    this.setGroupPiecesDraggable();
                                },this)
                                return;
                            }
                            var newSort = Math.floor((sprite.x - Gameconfig.piecegap) / sw + (sprite.y - Gameconfig.piecegap) / sh * this.rows);
                            var ifMoveEnd = true;
                            puzzleGroup.forEach(function(item){
                                if(item.nowSort === newSort && ifMoveEnd === true){
                                    ifMoveEnd = false;
                                    item.bringToTop();
                                    game.add.tween(sprite).to( { x: item.x, y: item.y }, 300, Phaser.Easing.Quartic.Out, true);
                                    game.add.tween(item).to( { x: t.startPosition.x, y: t.startPosition.y }, 300, Phaser.Easing.Quartic.Out, true).onComplete.add(function(){
                                        item.nowSort = sprite.nowSort
                                        sprite.nowSort = newSort;
                                        ifMoveEnd = true;
                                        t.allowDragStart = true;
                                        t.allowDragStop = false;
                                        if(t.checkSort()){
                                            t.roundovertTime = new Date();
                                            t.setGroupPiecesDraggable('2');
                                            game.playAudio(t.scorebgm);
                                            var getscore = self.roundimages[self.currentLevelIndex].pscore || 1;
                                            if(!t.gameisover){
                                                self.myscore += parseInt(getscore);
                                                self.mytime += (t.roundovertTime - t.roundstartTime);
                                                self.workerdata();
                                                t.scoretip.bringToTop();
                                                t.scoretip.text = '+ ' + getscore;
                                                t.scoretip.alpha = 1;
                                                var pos = t.scoretip.y;
                                                game.add.tween(t.scoretip).to({y:pos - 100,alpha:0},500,"Linear",true).onComplete.add(function(){
                                                    t.scoretip.alpha = 0;
                                                    t.scoretip.y = pos;
                                                    if(!t.gameisover){
                                                        self.currentLevelIndex++;
                                                        if(self.currentLevelIndex < self.roundimages.length){
                                                            t.roundnum = self.currentLevelIndex + 1;
                                                            t.puzzleGrouptip.visible = true;
                                                            puzzleGroup.destroy(true);
                                                            t.destroyboximg();
                                                            setTimeout(function(){
                                                                t.load.image(self.pieceimgkey, self.roundimages[self.currentLevelIndex].pimg);
                                                                t.load.start();
                                                            },10);
                                                        }else{
                                                            t.passtip.bringToTop();
                                                            t.passtip.visible = true;
                                                            self.currentLevelIndex = 0;
                                                            if(t.scorebgm.isPlaying) t.scorebgm.stop();
                                                            game.playAudio(t.passbgm);
                                                        }
                                                    }
                                                },this);
                                            } 
                                        }else{
                                            t.setGroupPiecesDraggable();
                                        }
                                    },this);
                                }
                            })
                        }
                    }
                }
                this.gameover = function(){
                    this.gameisover = true;
                    game.playAudio(this.overbgm);
                    this.load.onLoadComplete.remove(this.onLoadComplete, this);
                    this.destroyboximg();
                    this.overpopmask = game.add.graphics();
                    this.overpopmask.beginFill(0x000000, 0.72);
                    this.overpopmask.drawRect(0, 0, game.width, game.height);
                    this.overPopup = game.add.group();
                    this.overBox = game.add.image(game.world.centerX,game.world.centerY, 'overbox');
                    this.overBox.anchor.set(0.5);
                    this.overPopup.add(this.overBox);
                    this.overscoretip = this.game.add.text(game.world.centerX, game.world.centerY - 50, '您的得分', {fontSize:"32px", fill:"#e8a516"});
                    this.overscoretip.anchor.set(0.5);
                    this.overPopup.add(this.overscoretip);
                    this.overnum = this.game.add.text(game.world.centerX, game.world.centerY + 40, self.myscore, {fontSize:"64px", fill:"#e8a516"});
                    this.overnum.anchor.set(0.5);
                    this.overPopup.add(this.overnum);
                    this.overtime = this.game.add.text(game.world.centerX, game.world.centerY + 98, "耗时:"+(self.mytime / 1000)+"秒", {fontSize:"24px", fill:"#e8a516"});
                    this.overtime.anchor.set(0.5);
                    this.overPopup.add(this.overtime);
                    this.pmbtn = game.add.sprite(game.world.centerX,game.world.centerY + 168,'pmbtn');
                    this.pmbtn.anchor.set(0.5);
                    this.pmbtn.inputEnabled = true;
                    this.pmbtn.visible = true;
                    this.pmbtn.events.onInputDown.add(function(){ 
                        wechatcore.ajaxSubmit('/wechat/common/getphbdata',{gametype:XCV3Config.gametype,rotateid:self.rotateid,gamephb:self.gamephb,teamid:self.myteam},'正在获取排行榜数据').then(function(data){
                                if(data.code==0){
                                    if(data.msg.list.length>0){
                                        $("body").append(wechatcore.tpl($("#phb-tpl"),{list:data.msg.list,myrank:data.msg.myrank}));
                                        $("body .rank-close").click(function(){
                                            $(this).parent().parent().remove();
                                        });
                                    }else{
                                        wechatcore.msg('暂无数据');
                                    }
                                }else{
                                wechatcore.msg(data.msg);
                                }
                        }, function(){
                                wechatcore.msg('网络太差，请稍后重试');
                        });
                    },this);
                    this.overPopup.add(this.pmbtn);
                    this.game.add.tween(this.overPopup).from({y:-500,alpha:0},500,Phaser.Easing.Bounce.Out,true);
                }
                this.setGroupPiecesDraggable = function(flag){
                    flag = flag || '1';
                    puzzleGroup.forEach(function(item){
                        if(item.key == self.pieceimgkey){
                            if(flag === '1'){
                                if(!item.input.draggable) item.input.draggable = true;
                            }else{
                                if(item.input.draggable) item.input.draggable = false;
                            }
                        }
                    })
                }
                this.stopAlltween = function(){
                    var tweenobjs = game.tweens.getAll();
                    for (var i = 0; i < tweenobjs.length; i++) {
                        var tweenobj = tweenobjs[i];
                        if (tweenobj.target instanceof Phaser.Graphics && tweenobj.target.key === 'pieceb' && tweenobj.isRunning) tweenobj.stop(true);
                    }
                }
                this.checkSort = function(){
                    var sortall = true;
                    puzzleGroup.forEach(function(item){
                        if(item.sort !== item.nowSort){
                            sortall = false;
                        }
                    })
                    return sortall;
                }
                this.initColor = function(color){
                    color = color || '';
                    var colorvalue = '';
                    if(color != '' && color != 'transparent'){
                        var colors = Phaser.Color.valueToColor(color);
                        colorvalue = {
                            hex:Phaser.Color.getColor(colors.r, colors.g, colors.b),
                            alpha:colors.a
                        };
                    }
                    return colorvalue;
                }
            };
            game = new Phaser.Game(Gameconfig.gameW, Gameconfig.gameH, Phaser.CANVAS, 'zam-app-mainbox',null,true);
            game.playAudio = function(audio){
                wechatcore.playAudio(audio,'2');
            };
            game.state.add('loader',loaderState);
            game.state.add("menu",menuState);
            game.state.add("main",mainState);
            game.state.start('loader');
        },
    };
    return apppuzzle;
});
    