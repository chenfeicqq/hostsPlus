/**
 * 弹窗-当前主机名
 */
(function(_win, undefined){

	var html = '<div class="hostname">\
					<input id="J-window-host" readonly="true" type="text" value="" />\
				</div>';

	var windowHost = {
		'title' : '当前主机名',
		'content' : $(html)
	};

	windowHost['show'] = function(){

		hostname(function(host){

			jDialog.prompt(windowHost);

			$('#J-window-host').val(host).select();
		});
	};

	_win.windowHost = windowHost;

})(window);