define('videocontrol',['jquery'],function($){
var videocontrol = {
    init:function(){
        var val = document.createElement('video').canPlayType('video/mp4');
        if(val.length==0)
            this.useFlashPlayer = true;
    },
    defaultData:{
        dir:1280/720,width:1280,height:720,time:5
    },
    useFlashPlayer:false,
    getId:function(){
        return ('Video'+Math.random()+new Date().getTime()).replace('.','');
    },
    preload:function(data){
        var that = this;
        data.onError = data.onError||function(){}
        data.noSupport = data.noSupport||function(){}
        data.onFail = data.onFail||function(){}
        data.onLoad = data.onLoad||function(){}
        data.onComplete = data.onComplete||function(){}
        var videoList = data.src||[];
        var hasVideo = !!(document.createElement('video').canPlayType);
        if(!hasVideo){
            //return data.noSupport();
        }
        if(videoList.length==0){
            return data.onComplete([],[]);
		}
        var newId = that.getId();
        var newVideoId = newId+'video';
        var html = '<div id="'+newId+'" style="visibility:hidden; position:absolute; width:0; height:0; overflow:hidden;"><video muted preload="auto" id="'+newVideoId+'"></video></div>';
        $(html).appendTo($('body'));
        var x = 0,result = [],canplayList = [];
        (function(){
            var failCall = function(){
                canplayList.push(null);
                result.push(null);
                data.onFail(x);
                x++;
                if(x>=videoList.length){
                    $('#'+newId).remove();
                    return data.onComplete(result,canplayList);
                }
                $('#'+newVideoId).attr({src:videoList[x]});
            }
            $('#'+newVideoId)[0].volume = 0;
            $('#'+newVideoId).bind('canplaythrough',function(){
                var dir = that.getData(this);
                dir.name = videoList[x];
                result.push(dir);
                canplayList.push(videoList[x]);
                data.onLoad(x,dir);
                x++;
                if(x >= videoList.length){
                    $('#'+newId).remove();
                    return data.onComplete(result,canplayList);
                }
                $('#'+newVideoId).attr({src:videoList[x]});
            });
            $('#'+newVideoId).bind('error',function(){
                if(this.error.code==4){
                    $('#'+newId).remove();
                    data.onError();
                    return;
                }
                failCall();
            });
            $('#'+newVideoId).bind('stalled',function(){
                failCall();
            });
            $('#'+newVideoId).attr({src:videoList[x]});
        })();
    },
    getData:function(video){
        video = video.length > 0 ? video[0] : video;
        var videoW = video.videoWidth;
        var videoH = video.videoHeight;
        var dir = videoW/videoH;
        var time = parseInt(video.duration);
        return {dir:dir,width:videoW,height:videoH,time:time}
    },
    fullScreen:function(video,data,father){
        if(data==null) return;
        father = father || window;
        var winW = $(father).width();
        var winH = $(father).height();
        var dir = winW/winH;
        video = video.length > 0 ? video[0] : video;
        if((data.width/data.height) <= dir){
            $(video).css({width:winW,height:'auto',left:0,top:'50%',marginLeft:0});
            var h = winW/data.dir;
            $(video).css({marginTop:h/-2});
        }else{
            $(video).css({height:winH,width:'auto',top:0,left:'50%',marginTop:0});
            var w = winH*data.dir;
            $(video).css({marginLeft:w/-2});
        }
    },
    loop:{
        able:false,
        timeout:null,
        isStop:false,
        close:function(){
            this.isStop = false;
            this.able = false;
            $(window).unbind('resize.videoControlLoop');
            $('#'+this.newId+' video').unbind('canplaythrough');
            clearTimeout(this.timeout);
        },
        stop:function(){
            if(!this.able || this.isStop) return;
            this.isStop = true;
            this.able = false;
            clearTimeout(this.timeout);
            if($('#'+this.newId+' video').length==1){
                $('#'+this.newId+' video')[0].pause();
            }else{
                var obj_play = $('#'+this.newId+' video[mode="play"]'), obj_wait = $('#'+this.newId+' video[mode="wait"]');
                if(obj_play.length == 0 && obj_wait.length == 0) return;
                try{
                    obj_play[0].pause();
                    obj_wait[0].pause();
                }catch(ex){}
            }
        },
        reset:function(){
            if(!this.isStop) return;
            this.isStop = false;
            this.able = true;
            if($('#'+this.newId+' video').length == 1){
                try{
                    $('#'+this.newId+' video')[0].play();
                }catch(ex){}
            }else{
                videocontrol.loop.oneEnd(this.newId,this.videoList,this.result);
            }
        },
        play:function(videoList,result,newId){
            var self = this,newlist = [],newresult = [];
            self.close();
            if(result==null || result.length==0) return;
            //删除加载失败的背景视频链接
            var resultListLoaded = new Promise((resolve, reject) => {
                result.forEach((v, i, array) => {
                    if(v != null){
                        newresult.push(v);
                        newlist.push(videoList[i]);
                    }
                    if (i === array.length -1) resolve();
                });
            });
            resultListLoaded.then(function(){
                if(newlist==null || newlist.length==0) return;
                self.able = true;
                if(newId == null){
                    newId = videocontrol.getId();
                    var html = '<div id="'+newId+'" class="videoPlayBox" style="width:100%; height:100%; position:absolute; left:0; top:0; overflow:hidden; z-index:-1"></div>';
                    $(html).appendTo($('body'));
                }
                self.videoList = newlist;
                self.result = newresult;
                self.newId = newId;
                $(window).bind('resize.videoControlLoop',function(){
                    var obj_play = $('#'+newId+' video[mode="play"]'), obj_wait = $('#'+newId+' video[mode="wait"]');
                    if(obj_play.length > 0){
                        var index = obj_play.attr('index');
                        videocontrol.fullScreen(obj_play[0],newresult[index]);
                    }
                    if(obj_wait.length > 0){
                        var index = obj_wait.attr('index');
                        videocontrol.fullScreen(obj_wait[0],newresult[index]);
                    }
                });
                if(newlist.length==1){
                    $('#'+newId).html('<video id="videoPlay1" index="0" mode="play" loop src="'+newlist[0]+'" muted style="position:absolute"></video>');
                    videocontrol.fullScreen($('#videoPlay1')[0],newresult[0]);
                    try{
                        $('#videoPlay1')[0].play();
                    }catch(ex){}
                }else if(newlist.length > 1){
                    var index1 = 0, index2 = index1 + 1 >= newlist.length ? 0 : index1 + 1;
                    var html = '<video muted id="videoPlay1" style="display:none;position:absolute" index="'+index1+'" mode="play"></video><video muted id="videoPlay2" style="display:none;position:absolute" index="'+index2+'" mode="wait"></video>';
                    $(html).appendTo($('#'+newId));
                    videocontrol.fullScreen($('#videoPlay1')[0],newresult[index1]);
                    $('#videoPlay1').show().attr({src:newlist[index1]});
                    $('#videoPlay2').attr({src:newlist[index2]});
                    try{
                        /*
                        $('#videoPlay1').bind('canplaythrough',function(){
                            $(this)[0].play();
                            $('#videoPlay1').unbind('canplaythrough');
                        });
                        */
                        $('#videoPlay1')[0].play();
                    }catch(ex){}
                    try{
                        videocontrol.loop.countTime(newresult[index1].time,newId,newlist,newresult);
                    }catch(ex){
                        console.log('t',ex);
                    }
                }
            })
            
            
        },
        countTime:function(time,newId,videoList,result){
            if(!this.able) return;
            var delay = time * 1000;
            this.timeout = setTimeout(function(){
                videocontrol.loop.oneEnd(newId,videoList,result);
            },delay - 100);
        },
        oneEnd:function(newId,videoList,result){
            var self = this;
            if(!self.able) return;
            var obj_play = $('#'+newId+' video[mode="play"]');
            var obj_wait = $('#'+newId+' video[mode="wait"]');
            if(obj_play.length == 0 && obj_wait.length == 0) return;
            var index = _index = obj_wait.attr('index');
            _index++;
            _index = _index >= videoList.length ? 0 : _index;
            if(!obj_play[0].paused) obj_play[0].pause();
            obj_play.hide().attr({mode:'wait', index:_index, src:videoList[_index]});
            videocontrol.fullScreen(obj_wait[0],result[index]);
            obj_wait.show().attr({mode:'play'});
            setTimeout(function(){
                obj_wait[0].play();
            },1e2);
            try{
                videocontrol.loop.countTime(result[index].time, newId, videoList,result);
            }catch(ex){
                console.log('counttime',ex);
            }
        }
    }
};
return videocontrol;
});