/*
* @Author: 赞木
* @Date:   2022-03-25 18:55:55
* @Last Modified by:   赞木
* @Last Modified time: 2022-11-14 17:06:14
*/
define('directupload',['wechatcore','directoss','directqiniu','directcos'],function(wechatcore,OSS,qiniu){
	var directupload = {
		uploadFileoss:function (file, callback,progress) {
			var self = this,loadindex = wechatcore.loading('视频文件上传中，请稍后...');
			wechatcore.ajaxSubmit('/common/sts/getsts',{type:'1'}).then(function(json){
				if(json.code==0){
					var client = new OSS(json.msg);
					async function putObject () {
						try {
							var result = await client.multipartUpload(
								file.filepath,
								file.fileobj,
								{
									progress: function(p, cpt, res){
							          progress&&progress(Math.round(p*100));
							        },
								},
							);
							wechatcore.ajaxSubmit('/wechat/baping/snapshot',{type:'1',filepath:file.filepath}).then(function(json){
								wechatcore.close(loadindex);
								if(json.code==0){
									callback(null,{videopic:json.msg});
								}else{
									callback(json.msg);
								}
							});
						} catch (e) {
							wechatcore.close(loadindex);
							callback('上传出现异常，请稍后重试');
						}
					}
					putObject();
				}else{
					wechatcore.close(loadindex);
					callback('获取签名出错');
				}
			}, function(){
				wechatcore.close(loadindex);
				callback('获取签名出错');
			});
		},
		uploadFilecos:function (file, callback,progress) {
				var self = this,loadindex = wechatcore.loading('视频文件上传中，请稍后...');
				wechatcore.ajaxSubmit('/common/sts/getsts',{type:'2'}).then(function(json){
					if(json.code==0){
						var credentials = json.msg;
						var url = 'https://' + credentials.bucket + '.cos.' + credentials.region + '.myqcloud.com/' + wechatcore.camSafeUrlEncode(file.filepath).replace(/%2F/g, '/');
						var xhr = new XMLHttpRequest();
						xhr.open('PUT', url, true);
						xhr.setRequestHeader('Authorization', window.CosAuth({
					          SecretId: credentials.key,
					          SecretKey: credentials.secret,
					          Method: 'PUT',
					          Pathname: '/' + file.filepath,
					    }));
						xhr.setRequestHeader('x-cos-security-token', credentials.token);
						xhr.upload.onprogress = function (e) {
							progress&&progress((Math.round(e.loaded / e.total * 10000) / 100));
						};
						xhr.onload = function () {
							if (/^2\d\d$/.test('' + xhr.status)) {
								wechatcore.ajaxSubmit('/wechat/baping/snapshot',{type:'2',filepath:file.filepath}).then(function(json){
									wechatcore.close(loadindex);
									if(json.code==0){
										callback(null,{videopic:json.msg});
									}else{
										callback(json.msg);
									}
								});
							} else {
								wechatcore.close(loadindex);
								callback('文件 ' + file.filepath + ' 上传失败，状态码：' + xhr.status);
							}
						};
						xhr.onerror = function () {
							wechatcore.close(loadindex);
							callback('文件 ' + file.filepath + ' 上传失败，请检查是否没配置 CORS 跨域规则');
						};
						xhr.send(file.fileobj);
					}else{
						wechatcore.close(loadindex);
	                  	callback('获取签名出错');
					}
				}, function(){
					wechatcore.close(loadindex);
	                callback('获取签名出错');
				});
	     },
	     uploadFileqiniu:function (file, callback,progress) {
	     		var self = this,loadindex = wechatcore.loading('视频文件上传中，请稍后...');
				wechatcore.ajaxSubmit('/common/sts/getsts',{type:'3'}).then(function(json){
					if(json.code==0){
						var observable = qiniu.upload(file.fileobj,file.filepath,json.msg, {
					      customVars: {"x:name":file.filepath.split('.')[0]}
					    }, {
							checkByServer: true,
							checkByMD5: true,
							forceDirect: false,
							disableStatisticsReport: false,
							retryCount: 6,
							debugLogLevel: 'INFO'
						});
						var subscription = observable.subscribe({
							next: function(response) {
								progress&&progress(Math.round(response.total.percent));
							},
							error: function(err) {
								subscription.unsubscribe();
								wechatcore.close(loadindex);
								callback('上传出错');
							},
							complete: function(res) {
								subscription.unsubscribe();
								wechatcore.ajaxSubmit('/wechat/baping/snapshot',{type:'3',filepath:file.filepath}).then(function(json){
									wechatcore.close(loadindex);
									if(json.code==0){
										callback(null,{videopic:json.msg});
									}else{
										callback(json.msg);
									}
								});
							}
						});
					}else{
						wechatcore.close(loadindex);
						callback('获取签名出错');
					}
				}, function(){
					wechatcore.close(loadindex);
					callback('获取签名出错');
				});
		 },
	};
	return directupload;
})
