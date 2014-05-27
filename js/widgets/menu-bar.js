/**
 * 菜单栏
 */
(function(_win, undefined){

	// imports
	var menuHosts = _win.menuHosts;
	var menuGroup = _win.menuGroup;
	var menuDNS = _win.menuDNS;
	var menuTool = _win.menuTool;
	var menuPreference = _win.menuPreference;
	var menuHelp = _win.menuHelp;

	var menuBar = {
		'menu' : new air.NativeMenu()
	};

	menuBar['init'] = function(){

		getItems().forEach(function(item){

			menuBar['menu'].addSubmenu(item['menu'], item['name'])
		});

		// Windows
		if (air.NativeWindow.supportsMenu) {
			nativeWindow.menu = menuBar['menu'];
		}
		// Mac
		if (NativeApplication.supportsMenu) {
			NativeApplication.nativeApplication.menu = menuBar['menu'];
		}
	};

	function getItems(){
		var items = [];

		// 方案
		items.push(menuHosts);
		// 分组
		items.push(menuGroup);

		// DNS切换暂不支持Linux
		if(!isLinux){
			// DNS
			items.push(menuDNS);
		}

		// 工具
		items.push(menuTool);
		// 设置
		items.push(menuPreference);
		// 帮助
		items.push(menuHelp);

		return items;
	};

	menuBar.init();

	_win.menuBar = menuBar;

})(window);