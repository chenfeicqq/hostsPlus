/**
 * 弹窗-本机IP列表
 */
(function(_win, undefined){

	var html = '<div class="localip">\
					<textarea id="J-window-ip" readonly="true"></textarea>\
				</div>';

	var windowIP = {
		'title' : '本机IP列表',
		'content' : $(html)
	};

	windowIP['show'] = function(){

		jDialog.prompt(windowIP);

		var localIPs = getLocalIP();

		$('#J-window-ip').val(localIPs.join('\r\n')).select();
	};

	_win.windowIP = windowIP;

})(window);