define('webtree',['jquery','laytpl','bootstrap-table','bootstrap-table-treegrid'],function($,laytpl){
// tree-grid使用
var webtree = {
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
        $("#toolbar .btn-add").on('click',function(){
	       self.para.toolbar.add &&self.para.toolbar.add();
	    });
	    $("#toolbar .btn-del").on('click',function(){
	       self.para.toolbar.del && self.para.toolbar.del();
	    });
	    $("#toolbar .btn-reset").on('click',function(){
	       self.para.toolbar.reset && self.para.toolbar.reset();
	    });
	    $("#toolbar .btn-import").on('click',function(){
	       self.para.toolbar.import && self.para.toolbar.import();
	    });
	    $("#toolbar .btn-other").on('click',function(){
	       self.para.toolbar.other && self.para.toolbar.other();
	    });
    },
    initdata:function(){
        this.defaultOperate();
    },
    tableInit:function(){
        var self = this;
        $(self.ele).bootstrapTable({
    		url: self.para.url,
    		method: 'post',
            idField: 'id',
            uniqueId: 'id',
            dataType: 'json',
            toolbar: '#toolbar',
            loadingFontSize: '20px',
            loadingTemplate:function (loadingMessage) {
              return '<span class="loading-wrap"><span class="m-r-10"><i class="mdi mdi-loading mdi-spin fa-fw fa-2x"></i></span><span class="loading-text">' +loadingMessage +'</span></span>'
            },
            columns:self.para.columns||[],
            //指定父id列
            parentIdField: self.para.pid||'pid',
            //在哪一列展开树形
            treeShowField: self.para.treecolumn||'name',
            onPostBody: function() {
                var columns = $(self.ele).bootstrapTable('getOptions').columns;
                if (columns && columns[0][1].visible) {
                  $(self.ele).treegrid({
                    initialState: 'collapsed',
                    treeColumn: 1,
                    onChange: function() {
                      $(self.ele).bootstrapTable('resetView')
                    }
                  })
                }
            },
            
    	});
    },
    getSelections: function (){
    	return $.map($(this.ele).bootstrapTable('getSelections'), function(row) {
    	   return row.id;
    	});
    },
    defaultOperate:function(){
      var paras = this.para.columnoperate||false;
      if(paras) {
          this.para.columns.push({
            field: 'operate',
            title: '操作',
            align: 'center',
            formatter: paras.html?paras.html:laytpl($("#table-operate-tpl").html()).render({btns:paras.btns}),  // 自定义方法
            events: {
                'click .btn-edit-one': function (event, value, row, index) {
                    paras.func.edit && paras.func.edit(value, row, index);
                },
                'click .btn-del-one': function (event, value, row, index) {
                    paras.func.del &&  paras.func.del(value, row, index);
                },
                'click .btn-data-one': function (event, value, row, index) {
                     paras.func.data && paras.func.data(value, row, index);
                }
            }
          })
      }
    },
};
return webtree;
});