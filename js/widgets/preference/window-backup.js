/**
 * 弹窗-备份
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var file = new air.File();

	var windowBackup = {};

	var success = {
		'title' : '提示',
		'content' : '备份成功'
	};

	windowBackup['init'] = function(general){

		file.addEventListener(air.Event.SELECT, function(event){
			// 备份
			settings.backup(event.target);

			jDialog.alert(success);
		});
	};

	windowBackup['show'] = function(general){

		file.browseForSave("备份为");
	};

	windowBackup.init();

	_win.windowBackup = windowBackup;

})(window);