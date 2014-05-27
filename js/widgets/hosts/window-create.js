/**
 * 弹窗-添加新方案
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var html = '<div class="create-hosts">\
					<input id="J-window-hosts-create-name" type="text" size="30" value=""/>\
				</div>';

	var windowCreate = {
		'title' : '添加新方案',
		'content' : html
	};

	windowCreate['show'] = function(){

		jDialog.popup($.extend({

			'afterShow' : function(){
				var _self = this;

				$('#J-window-hosts-create-name').focus().keypress(function(event){
					// 回车
					if(event.which == 13){

						settings.createHosts($(this).val(), '');

						// 关闭窗口
						_self.hide();
					}
				});
			},
			'getData' : function(){

				return $('#J-window-hosts-create-name').val();
			},
			'choose' : function(hostsName){

				settings.createHosts(hostsName, '');
			}
		}, windowCreate));
	};

	_win.windowCreate = windowCreate;

})(window);