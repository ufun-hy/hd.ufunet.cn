/*
* @Author: 赞木
* @Date:   2023-03-05 13:17:44
* @Last Modified by:   赞木
* @Last Modified time: 2023-03-06 14:14:53
*/
define('pxPreload',['pxloader','pxLoaderImage','pxLoaderVideo','pxLoaderAudio'],function(){
	var pxPreload = {
		start:function(params){
			var self = this,fileLists = params.filelists||[];//1图片文件 2视频文件
			if(fileLists.length==0){
				return '';
			}
			/*var loader = new PxLoader({
		        // 我们轮询资源以了解进展的频率
		        statusInterval: 5000, // 默认情况下每5秒 
		        //自上次进度更改以来记录前的延迟
		        loggingDelay: 20 * 1000, // 20秒后记录掉队者
		        // 如果移动时间窗口中没有任何进展，请停止等待
		        noProgressTimeout: Infinity // 默认情况下不停止等待
		    });
		    */
		    var loader = new PxLoader();
			for (var i = 0; i < fileLists.length; i++) {
				var type = fileLists[i].type || '1',path = fileLists[i].path || '',key = fileLists[i].key || '';
		        if(type=='1'){
			        loader.addImage(path,key + '_' + type);
		        }else if(type=='2'){
		        	loader.addVideo(path,key + '_' + type);
		        }else if(type=='3'){
		        	loader.addAudio(path,key + '_' + type);
		        }
		        
		    }
		    loader.addProgressListener(function(e) {
		    	var tag = e.resource.tags.first,type = tag.substr(-1),data = {
		        	load:e.completedCount,
		        	total:e.totalCount,
		        	status:'1',
		        	type:type,
		        	key:tag.slice(0,tag.length-2),
		        	src:e.resource.getName(),
		        	w:0,
		        	h:0,
		        	dir:0,
		        	duration:0,
		        };
		    	if(type=='1'){
		    		data.w = e.resource.img.width;
		    		data.h = e.resource.img.height;
		    		if(data.w == 0){
		    			data.status = '2';
		    		}else{
		    			data.dir = data.w/data.h;
		    		}
		    	}else if(type=='2'){
		    		data.w = e.resource.video.videoWidth;
		    		data.h = e.resource.video.videoHeight;
		    		if(data.w == 0){
		    			data.status = '2';
		    		}else{
		    			data.duration = e.resource.video.duration;
		    			data.dir = data.w/data.h;
		    		}
		    	}else if(type=='3'){
		    		var duration = e.resource.audio.duration;
			        if(isNaN(duration)){
			            data.status = '2';
			        }
			        data.duration = duration;
		    	}
		        params.progress && params.progress(data);
		    });
			// 加载完成
		    loader.addCompletionListener(function (e) {
		        params.complete && params.complete(e);
		    });
		    
		    loader.start();
		},
	};
	return pxPreload;
})