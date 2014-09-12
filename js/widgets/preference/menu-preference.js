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

		initMenu();

		settings.on('preference', function(){
			refreshThemes();
		});
	};

	function initMenu(){

		menuPreference['menu'].addItem(new air.NativeMenuItem('首选项')).addEventListener(air.Event.SELECT, function(){

			windowGeneral.show();
		});

		menuPreference['menu'].addItem(new air.NativeMenuItem('编辑器')).addEventListener(air.Event.SELECT, function(){

			windowEditor.show();
		});

		menuPreference['menu'].addSubmenu(menuTheme, '主题');

		// 初始化主题菜单项
		initThemes();

		// 分隔符
		menuPreference['menu'].addItem(new air.NativeMenuItem('', true));

		menuPreference['menu'].addItem(new air.NativeMenuItem('备份')).addEventListener(air.Event.SELECT, function(){

			windowBackup.show();
		});

		menuPreference['menu'].addItem(new air.NativeMenuItem('恢复')).addEventListener(air.Event.SELECT, function(){

			windowRestore.show();
		});

	};

	/**
	 * 初始化主题菜单项
	 */
	function initThemes(){

		var current = settings.get('preference')['theme']['current'];

		settings.get('preference')['theme']['list'].forEach(function(theme, index){

			var menuItem = new air.NativeMenuItem(theme);

			if(index === current){
				menuItem['checked'] = true;
			}

			menuItem['data'] = index;

			menuItem.addEventListener(air.Event.SELECT, function(event){

				var menuItem = event.currentTarget;

				settings.setCurrentTheme(menuItem['data']);
			});

			menuTheme.addItem(menuItem);
		});
	};

	/**
	 * 刷新主题菜单项
	 */
	function refreshThemes(){
		menuTheme.removeAllItems();

		initThemes();
	};

	menuPreference.init();

	_win.menuPreference = menuPreference;

})(window);