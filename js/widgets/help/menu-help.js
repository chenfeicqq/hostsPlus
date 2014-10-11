/**
 * 菜单-帮助
 */
(function(_win, undefined){

	// imports
	var windowAbout = _win.windowAbout;
	var windowShortcut = _win.windowShortcut;

	var menuHelp = {
		'name' : '帮助',
		'menu' : new air.NativeMenu()
	};

	menuHelp['init'] = function(){

		this['menu'].addItem(new air.NativeMenuItem('使用指南')).addEventListener(air.Event.SELECT, function(){
			menuHelp.manual();
		});

		this['menu'].addItem(new air.NativeMenuItem('快捷键')).addEventListener(air.Event.SELECT, function(){
			windowShortcut.show();
		});

		this['menu'].addItem(new air.NativeMenuItem('关于')).addEventListener(air.Event.SELECT, function(){
			windowAbout.show();
		});
	};

	/**
	 * 显示帮助文档
	 */
	menuHelp['manual'] = function(){

		air.navigateToURL(new air.URLRequest('https://github.com/yaniswang/hostsPlus/wiki/manual'));
	};

	menuHelp.init();

	_win.menuHelp = menuHelp;

})(window);