/**
 * 弹窗-删除当前方案
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var warning = {
		'content' : '默认方案不允许删除'
	};

	var windowDelete = {};

	windowDelete['show'] = function(){

		var current = settings.get('hosts')['current'];

		// 默认方案不允许删除
		if(0 === current){

			jDialog.alert(warning);

			return;
		}

		var hostsName = settings.get('hosts')['list'][current]['name'];

		jDialog.confirm({
			'content' : '删除后无法恢复，确认要删除 [ ' + hostsName + ' ] 这个方案吗？',
			'choose' : function(type){

				if('yes' === type){

					settings.deleteHosts();
				}
			}
		});
	};

	_win.windowDelete = windowDelete;

})(window);