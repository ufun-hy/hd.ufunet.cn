define('webtable',['jquery','laytpl','bootstrap-table-pagejump','tableExport'],function($,laytpl){
var webtable = {
    columnoperate:true,
    para:{},
    init:function (para) {
        var self = this;
        self.para = para;
    	self.ele = para.tableId;
    	self.initdata();
    	self.tableInit();
    	self.bindevent();
    },
    bindevent:function(){
        var self = this;
        //搜索框
        $(".zam-inline-searchbar .btn-search").on('click',function() {
        	webtable.refresh();
        });
        //toolbar下的按钮
        $(".zam-toolbar a").click(function(){
            var ajaxurl = $(this).attr("data-ajaxurl") || '',btnclass = $(this).attr('class').split(' '),func = btnclass[3]||'';
            if(func.indexOf('btn-')==0){
                func = func.replace('btn-','');
                self.para.toolbar[func] && self.para.toolbar[func](ajaxurl);
            }
        });
    },
    initdata:function(){
        this.defaultOperate();
    },
    tableInit:function(){
        var self = this;
        $(self.ele).bootstrapTable({
            //showExport:true,
            //exportDataType: 'all',
            //exportTypes: ['csv', 'excel'],
    		classes:'table table-bordered zam-Table',
    		url: self.para.url,
    		method: 'post',
    		toolbar: self.para.toolbarname?self.para.toolbarname:'#toolbar',
    		striped: true,
    		cache: false,
    		pagination: true,
            paginationShowPageGo: true,
            showPaginationSwitch:self.para.showpageswitch||false,
            showFullscreen:true,
            loadingFontSize: '20px',
            loadingTemplate:function (loadingMessage) {
              return '<span class="loading-wrap"><span><i class="mdi mdi-loading mdi-spin fa-fw fa-2x m-r-5"></i></span><span class="loading-text">' +loadingMessage +'</span></span>'
            },
    		sortStable: false,
    		//sortOrder: "desc",
            sortReset:true,
            rememberOrder:false,
    		queryParamsType:'',
    		queryParams: function (params) {
    			//var self = this;
    			var basic = {
    				page:params.pageNumber,
    				psize:params.pageSize,
    			};
    			var bindPara = self.para.searchParamas||{};
    			$.each(bindPara, function(i, val) {  
    				if(val.type=='1'){//input
    					basic[val.id] = $("#"+val.id).val();//对应的值必须是动态获取
    				}else if(val.type=='3'){//固定值
    					if(val.items){
    						$.each(val.items,function(i,v){
    							if(v.isstable){
    								basic[v.field] = v.val;	
    							}else{
    								if(v.isdata){
    									basic[v.field] = $(v.dom).attr(v.datasx)||'';	
    								}else{
    									basic[v.field] = $(v.dom).val()||'';
    								}
    							}
    						});
    					}
    				}else{//select
    					basic[val.id] = $("#"+val.id+" option:selected").val();
    				}
    			}); 
    			return basic;
    		},
    		sidePagination: "server",
            serverSort: false,
    		pageNumber: 1,
    		pageSize: self.para.psize||10,
    		pageList: self.para.psize?[self.para.psize]:[10, 25, 50, 100, 200, 300, 400, 500,1000],
    		paginationPreText: '上一页',
    		paginationNextText: '下一页',
    		search: false,
    		contentType: "application/x-www-form-urlencoded",
    		strictSearch: true,
    		showColumns: true,
    		showRefresh: true,
    		minimumCountColumns: 1,
    		clickToSelect: false,
    		uniqueId: "id",
    		showToggle: false,
    		cardView: false,
    		detailView: false,
            iconsPrefix:'mdi',
    		icons:{
                paginationSwitchDown: 'mdi-arrow-down-box',
                paginationSwitchUp: 'mdi-arrow-up-box',
                refresh: 'mdi-refresh',
                toggleOff: 'mdi-toggle-switch-off',
                toggleOn: 'mdi-toggle-switch',
                columns: 'mdi-table-column-remove',
                fullscreen: 'mdi-fullscreen',
                detailOpen: 'mdi-plus',
                detailClose: 'mdi-close'
            },

    		//此方法在Bootstarp Table 行数据渲染后触发 每加载一条数据触发一次
    		onPostBody: function(data){
                self.para.onload&&self.para.onload(data);
            },
            //此方法在Bootstarp Table数据成功加载返回后触发
    		onLoadSuccess:function(data){
    		    $("[data-toggle='tooltip']").tooltip({
    		        trigger : 'hover',
        			"container" : 'body',
        		});
    			self.para.onloadsuccess&&self.para.onloadsuccess(data);
    		},
            onPageChange:function(data){
                self.para.onpagechange&&self.para.onpagechange();
            },
    		columns:self.para.columns||[],
    	});
    },
    getSelections: function (){
    	return $.map($(this.ele).bootstrapTable('getSelections'), function(row) {
    	   return row.id;
    	});
    },
    refresh:function (){
        var pagenum = ($(".pagination .page-item.active a").length > 0 ? parseInt($(".pagination .page-item.active a").text()):1);
        var pagesize = ($(".page-list ul li.active a").length > 0 ?parseInt($(".page-list ul li.active a").text()):10);
    	$(this.ele).bootstrapTable('refresh',{pageNumber:pagenum,pageSize:pagesize});
    },
    defaultOperate:function(){
      var paras = this.para.columnoperate||false;
      if(paras) {
          this.para.columns.push({
            field: 'operate',
            title: '操作',
            align: 'center',
            width: paras.width||"10",
            formatter: function(value, row, index){
                return paras.html?paras.html:laytpl($("#table-operate-tpl").html()).render({data:row,btns:paras.btns});  // 自定义方法
            },
            events: {
                'click .btn-edit-one': function (event, value, row, index) {
                    paras.func.edit && paras.func.edit(value, row, index);
                },
                'click .btn-del-one': function (event, value, row, index) {
                    paras.func.del &&  paras.func.del(value, row, index);
                },
                'click .btn-data-one': function (event, value, row, index) {
                     paras.func.data && paras.func.data(value, row, index);
                },
                'click .btn-shenhe-one': function (event, value, row, index) {
                     paras.func.shenhe && paras.func.shenhe(value, row, index);
                },
                'click .btn-reset-one': function (event, value, row, index) {
                     paras.func.reset && paras.func.reset(value, row, index);
                },
                'click .btn-refund-one': function (event, value, row, index) {
                     paras.func.refund && paras.func.refund(value, row, index);
                },
                'click .btn-import-one': function (event, value, row, index) {
                     paras.func.import && paras.func.import(value, row, index);
                },
                'click .btn-export-one': function (event, value, row, index) {
                     paras.func.export && paras.func.export(value, row, index);
                }
            }
          })
      }
    },
};
return webtable;
});