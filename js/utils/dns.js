/**
 * DNS操作
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var dns = {
		'current' : null
	};

	/**
	 * 初始化
	 */
	dns['init'] = function(){

		initDNS();

		settings.on('dns', function(){

			initDNS();
		});
	};

	/**
	 * 设置系统DNS
	 */
	function initDNS(){

		var currentDNS = settings.getCurrentDNS();

		if(dns['current'] !== currentDNS){

			setSysDNS(currentDNS['ip']);

			dns['current'] = currentDNS['ip'];
		}
	};

	dns.init();

	_win.dns = dns;

})(window);