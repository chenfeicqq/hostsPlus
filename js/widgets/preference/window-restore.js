/**
 * 弹窗-恢复
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var file = new air.File();

	var windowRestore = {};

	var warning = {
		'content' : '本操作将覆盖当前所有设置，是否继续？'
	};

	windowRestore['init'] = function(){

		file.addEventListener(air.Event.SELECT, function(event){

			jDialog.confirm($.extend({
				'choose' : function(type){
					if('yes' == type){
						// 恢复
						settings.restore(event.target);
					}
				}
			}, warning));
		});
	};

	windowRestore['show'] = function(general){

		file.browseForOpen("打开");
	};

	windowRestore.init();

	_win.windowRestore = windowRestore;

})(window);