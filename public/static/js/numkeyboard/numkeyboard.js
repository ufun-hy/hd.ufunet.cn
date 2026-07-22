/*
* @Author: 赞木
* @Date:   2023-04-26 21:24:48
* @Last Modified by:   赞木
* @Last Modified time: 2023-08-24 17:09:43
*/
define('numkeyboard',['wechatcore'],function(wechatcore){
	var numkeyboard = {
	    keydatas: [],
	    numval:'',
	    config:null,
	    init: function (params,func) {
	    	var self = this;
	    	self.config = params;
	    	if(self.config.inputval > 0) self.numval = self.config.inputval;
	    	if(self.config.inttype == '1'){
	    		self.keydatas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0,'',"del","reset","cancel","confirm"];
	    	}else{
	    		self.keydatas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0,".","del","reset","cancel","confirm"];
	    	}
	        self.template();
	        $(".numbox_box .numbox_btn").on('click',function(e){
	        		e.stopPropagation();
	        		var item = $(this).attr('data-item');
	                if (item == "" || (item == "." && self.config.inttype == '1')) {
	                    return false;
	                }
	                if (item == "del") {
	                    if (self.numval != "") {
	                    	self.numval = self.numval.substring(0, self.numval.length - 1);
	                    }
	                }else if (item == "reset") {
	                    self.numval = '';
	                }else if (item == "cancel") {
	                    self.close()
	                }else if (item == "confirm") {
	                	if(self.numval==''){
	                		return wechatcore.msg('请先打分');
	                	}
	                	var inputval = self.config.inttype=='1' ? parseInt(self.numval) : (self.config.inttype=='2'?parseFloat(self.numval).toFixed(2):parseFloat(self.numval).toFixed(1));
	                	var inputmin = parseInt(self.config.min);
						var inputmax = parseInt(self.config.max);
						if(inputval <= 0){
							return wechatcore.msg('输入的分数需大于0，请重新输入'); 
						}
						if(inputval*100 < inputmin*100){
							return wechatcore.msg('输入的分数小于'+inputmin+'，请重新输入');
						}
						if(inputval*100 > inputmax*100){
							return wechatcore.msg('输入的分数大于'+inputmax+'，请重新输入');
						}
						if(self.numval.indexOf('.') != -1){
							if(self.config.inttype == '1'){
								return wechatcore.msg('只能输入整数，请重新输入');
							}else{
								var fixednum = self.numval.toString().split(".")[1].length || 0;
								if(self.config.inttype == '2'){
									if(fixednum > 2) return wechatcore.msg('只能输入2位小数，请重新输入');
								}
								if(self.config.inttype == '3'){
									if(fixednum > 1) return wechatcore.msg('只能输入1位小数，请重新输入');
								}
							}
						}
						self.close();
	                    func && func(inputval);
	                }else{
	                	if(item==='.' && self.numval.indexOf('.')!=-1){
	                		return wechatcore.msg('只能输入一个小数点');
	                	}
	                	if(item==='.' && self.numval==''){
	                		return wechatcore.msg('分数不能以小数点开头');
	                	}
	                	if(self.config.inttype=='1' && item==='0' && self.numval==''){
	                		return wechatcore.msg('分数不能0开头');
	                	}
	                	if(self.config.inttype=='2' && item==='0' && self.numval=='0'){
	                		return wechatcore.msg('分数不能以连续输入2个0开头');
	                	}
	                	if(self.config.inttype=='3' && item==='0' && self.numval=='0'){
	                		return wechatcore.msg('分数不能以连续输入2个0开头');
	                	}
	                	//有小数点则后面只能有2位
		                if(self.numval.indexOf('.') != -1){
		                	if(self.config.inttype == '1'){
								return wechatcore.msg('只能输入整数');
							}else{
			                	var fixednum = self.numval.split('.')[1].length || 0;
			                	if(self.config.inttype == '2' && fixednum >= 2){
			                		return wechatcore.msg('只能输入2位小数');
			                	}
			                	if(self.config.inttype == '3' && fixednum >= 1){
			                		return wechatcore.msg('只能输入1位小数');
			                	}
			                }
		                }
	                	self.numval += item;
	                }
	                $(".numbox_input div").text(self.numval);
	        });
	        $(".numbox_box").on('click',function(e){
	        	e.stopPropagation();
	        	return false;
	        })
	        $(".numbox_fixed").on('click',function(){
	        	self.close();
	        });
	    },
	    template: function () {
	        var self = this,btnhtml = "",title = self.config.pftype=='1'?`给${self.config.pfname}打分`:`给${self.config.pfname}的${self.config.sname}项打分`;
	        $.each(self.keydatas,function(i,v){
	        	let classname = "numbox_btn zam-app-flex-ajCenter2";
	        	let vname = v;
	        	if($.inArray(v,['del','reset','cancel','confirm'])!=-1){
	        		if(v==='del'){
	        			vname = "删除";
	        		}else if(v==='reset'){
	        			vname = "清空";
	        		}else if(v==='cancel'){
	        			vname = "退出";
	        		}else if(v==='confirm'){
	        			vname = "确定";
	        		}
	        		vname = `<span class="zam-app-flex-ajCenter2">${ vname }</span>`;
	        		classname += " numbox_btn2 " + v;
	        	}else if(v===""){
	        		classname += " numbox_disabled";
	        	}
	            btnhtml += `<span class="${classname}" data-item="${ v }">${ vname }</span>`;
	        });
	        var html = `<div class="numbox_fixed">
	        		<div class="numbox_box">
	            		<div class="numbox_title">${title}</div>
	            		<div class="numbox_input">
	            			<div class="zam-app-flex-ajCenter2">${self.numval}</div>
	            		</div>
	            		<div class="numbox_num zam-app-flex zam-app-flex-wrap">${ btnhtml }</div>
	            	</div>
	        </div>
	        `;
	        $("body").append(html);
	        setTimeout(function () {
	            $(".numbox_box").addClass("on")
	        }, 100)
	    },
	    open: function (params,func) {
	        this.init(params,func);
	    },
	    close: function (callback) {
	    	this.numval = '';
	        $(".numbox_box").removeClass("on");
	        setTimeout(function () {
	            $(".numbox_fixed").remove()
	        }, 300)
	    },
	};
	return numkeyboard;
})