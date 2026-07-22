define('uploader',['jquery','wechatcore','plupload'],function($,wechatcore,plupload){
	var uploader = {
		selectfile:null,
		filecontainer:null,
		uploadUrl:'',
		filedir:'',
		filehost:'',
		maxsize:'100mb',
		init:function(params){
			var self = this;
			self.selectfile = params.selectfile||"selectfiles";
			if(params.uploadmaxsize){
				self.maxsize = params.uploadmaxsize;
			}
			var loadIndex = 0;
			var uploadObj = new plupload.Uploader({
				runtimes : 'html5',
				browse_button :self.selectfile, 
				multi_selection: false,
				filters: {
					mime_types : [{ title : "video files", extensions : "video/mp4,video/avi,video/webm,video/mov,video/ogg,video/3gp" }],
					max_file_size : self.maxsize,
					prevent_duplicates : false
				},
				init: {
					FilesAdded: function(upload, files) {
						$(".zam-app-bpopupBox").find('.typeItemCover').trigger('click');
						plupload.each(files, function(file) {
							wechatcore.ajaxSubmit('wechat.baping.osspolicy',{},false).then(function(data){
								 if(data.errno==0){
									var ossInfo = data.message;
									self.filedir = ossInfo.dir + self.randomName(10) + self.get_suffix(file.name);
									self.filehost = ossInfo.host;
									upload.setOption({
										'url': self.filehost,
										'multipart_params': {
											'key' : self.filedir,
											'policy': ossInfo.policy,
											'OSSAccessKeyId': ossInfo.accessid, 
											'success_action_status' : '200',
											'signature': ossInfo.signature,
											//'callback' : callbackbody,
										}
									});
									upload.start();
								 }else{
									wechatcore.msg(data.message);
								 }
							}, function(){
								  wechatcore.msg('网络太差，请稍后重试.');
							});
						});
					},
					BeforeUpload: function(upload, file) {
						loadIndex = wechatcore.loading('上传视频中');
					},
					UploadProgress: function(upload, file) {
						var fileper = '视频已上传'+file.percent + "%";
						$(".layui-m-layer .layui-m-layercont p").text(fileper);
					},
					FileUploaded: function(upload, file, info) {
						if (info.status == 200){
							wechatcore.ajaxSubmit('wechat.baping.savevideopic',{videpDir:self.filedir},false).then(function(data){
								 wechatcore.close(loadIndex);
								 if(data.errno==0){
									params.func&&params.func({'video':data.message.video,'pic':data.message.pic});
								 }else{
									wechatcore.msg(data.message);
								 }
							}, function(){
								  wechatcore.close(loadIndex);
								  wechatcore.msg('网络太差，请稍后重试.');
							});
						}else if (info.status == 203){
							wechatcore.close(loadIndex);
							wechatcore.msg('上传到OSS成功，但是oss访问用户设置的上传回调服务器失败，失败原因是:' + info.response);
						}else{
							wechatcore.close(loadIndex);
							wechatcore.msg(info.response);
						} 
					},
					Error: function(up, err) {
						if (err.code == -600) {
						   alert("选择的视频文件太大了");
						}else if (err.code == -601) {
							wechatcore.msg("选择的文件类型异常");
						}else if (err.code == -602) {
							wechatcore.msg("这个文件已经上传过一遍了");
						}else {
							wechatcore.msg(err.response);
						}
					}
				}
			});
			uploadObj.init();
		},
		get_suffix:function (filename) {
			pos = filename.lastIndexOf('.')
			suffix = ''
			if (pos != -1) {
				suffix = filename.substring(pos).toLowerCase();
			}
			return suffix;
		},
		randomName:function (len) {
			len = len || 32;
			var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
			var maxPos = chars.length;
			var pwd = '';
			for (i = 0; i < len; i++) {
				pwd += chars.charAt(Math.floor(Math.random() * maxPos));
			}
			return pwd;
		},
	};
	return uploader;
});
