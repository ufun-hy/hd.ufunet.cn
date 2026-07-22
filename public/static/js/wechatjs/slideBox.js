define('slideBox', ['jquery'], function ($) {
	var slideBox = {
		data: null,
		popBoxinit: function (data) {
			this.popBoxupdateconfig(data);
			this.popBoxcreate();
			this.popBoxbindEvent();
		},
		popBoxgetId: function () {
			return ('zam-app-popup-' + Math.random() + new Date().getTime()).replace('.', '');
		},
		popBoxupdateconfig: function (e) {
			var t = this;
			e.title = e.title == null ? '' : e.title;
			e.classname = e.classname || '';
			e.hasFoot = e.hasFoot == null ? true : e.hasFoot;
			e.hasCover = e.hasCover == null ? true : e.hasCover;
			e.btnText = e.btnText == null ? '确定' : e.btnText;
			e.btnType = typeof e.btnType == 'undefined' ? 'btn-default' : e.btnType;
			e.html = e.html == null ? '' : e.html;
			e.close = e.close || false;
			t.data = e;
		},
		popBoxcreate: function () {
			var t = this, e = t.data;
			this.popBoxid = this.popBoxgetId();
			var html = `<div class="zam-app-bpopupBox ${e.classname}" id="${this.popBoxid}" >`;
			if (e.hasCover) {
				html += '<div class="zam-app-bpopupCover"></div>';
			}
			html += '<div class="zam-app-bpopupMain">';
			if (e.title.length) {
				html += `<div class="zam-app-bpopupTitle">
				${e.title}
				<a class="zam-app-bpopupCloseBox zam-app-flex-ajCenter2"><i class="zam-app-bpopupClose mxc-close"></i></a>
				</div>`;
			}
			html += `<div class="zam-app-bpopupBody">${e.html}</div>`;
			if (e.hasFoot) {
				html += '<div class="zam-app-bpopupFoot">';
				if ($.isArray(e.btnText)) {
					var flatbtn = e.isFlatBtn || false;
					if (flatbtn) {
						html += `<div class="zam-app-flex zam-app-justifyspacebetween zam-app-bpopupFoot-flatbtns">`
					}
					$.each(e.btnText, function (i, v) {
						if (flatbtn) {
							html += `<div data-btntype="${v.type || '1'}" class="btn ${v.class}">${v.txt}</div>`;
						} else {
							html += `<button type="button" data-btntype="${v.type || '1'}" class="btn btn-block ${v.class}" ${(i == 0 ? 'style="margin-bottom:0.2rem"' : '')}>${v.txt}</button>`;
						}
					});
					if (flatbtn) {
						html += `</div>`
					}
				} else {
					html += `<button type="button" class="btn btn-block ${e.btnType}">${e.btnText}</button>`;
				}
				html += '</div>';
			}
			html += '</div>';
			$(html).appendTo($('body'));
			if (e.style) {
				$('#' + this.popBoxid).find('.zam-app-bpopupMain').css(e.style);
			}
			var t = this;
			if (e.ready) {//定义了ready方法
				e.ready.call(this);
			}
			setTimeout(function () {
				t.popBoxfind('.zam-app-bpopupMain').addClass('show');
				setTimeout(function () {
					if (e.onload) {//定义了onload方法
						e.onload.call(t);
					}
				}, 150);
			}, 50);
		},
		popBoxfind: function (ele) {
			if (!ele) {
				return $('#' + this.popBoxid);
			} else {
				return $('#' + this.popBoxid).find(ele);
			}
		},
		popBoxbindEvent: function () {
			var t = this, e = t.data;
			this.popBoxfind('.zam-app-bpopupCloseBox,.zam-app-bpopupClose').bind('click', function () {
				t.popBoxclose();
			});
			this.popBoxfind('.zam-app-bpopupCover').bind('click', function () {
				t.popBoxclose();
			});
			this.popBoxfind('.zam-app-bpopupFoot .btn').bind('click', function () {
				if (e.click) {
					e.click.call(t, $(this).data('btntype') || '1');
				}
			});
		},
		popBoxclose: function () {
			var t = this, e = t.data;
			if (e.close) {
				e.close.call(t);
			}
			t.popBoxfind('.zam-app-bpopupMain').removeClass('show');
			setTimeout(function () {
				t.popBoxfind().remove();
			}, 1e2);
		}
	};
	return slideBox;
});