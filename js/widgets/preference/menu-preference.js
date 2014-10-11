/**
 * 菜单-设置
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;
	var windowGeneral = _win.windowGeneral;
	var windowEditor = _win.windowEditor;
	var windowBackup = _win.windowBackup;
	var windowRestore = _win.windowRestore;

	var menuPreference = {
		'name' : '设置',
		'menu' : new air.NativeMenu()
	};

	/**
	 * 主题菜单项
	 */
	var menuTheme = new air.NativeMenu();

	menuPreference['init'] = function(){

		menuPreference['menu'].addItem(new air.NativeMenuItem('首选项')).addEventListener(air.Event.SELECT, function(){

			windowGeneral.show();
		});

		menuPreference['menu'].addItem(new air.NativeMenuItem('编辑器')).addEventListener(air.Event.SELECT, function(){

			windowEditor.show();
		});

		// 分隔符
		menuPreference['menu'].addItem(new air.NativeMenuItem('', true));

		menuPreference['menu'].addItem(new air.NativeMenuItem('备份')).addEventListener(air.Event.SELECT, function(){

			windowBackup.show();
		});

		menuPreference['menu'].addItem(new air.NativeMenuItem('恢复')).addEventListener(air.Event.SELECT, function(){

			windowRestore.show();
		});

	};

	menuPreference.init();

	_win.menuPreference = menuPreference;

})(window);