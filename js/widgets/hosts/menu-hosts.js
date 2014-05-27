/**
 * 菜单-方案
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;
	var windowCreate = _win.windowCreate;
	var windowDelete = _win.windowDelete;

	var menuHosts = {
		'name' : '方案',
		'menu' : new air.NativeMenu()
	};

	menuHosts['init'] = function(){

		initMenu();

		settings.on('hosts', function(){
			refreshHosts();
		});
	};

	function initMenu(){

		menuHosts['menu'].addItem(new air.NativeMenuItem('添加新方案')).addEventListener(air.Event.SELECT, function(){

			editor.checkUnsaved(function(){

				windowCreate.show();
			});
		});

		menuHosts['menu'].addItem(new air.NativeMenuItem('删除当前方案')).addEventListener(air.Event.SELECT, function(){

			windowDelete.show();
		});

		// 分隔符
		menuHosts['menu'].addItem(new air.NativeMenuItem('', true));

		// 初始化自定义hosts菜单项
		menuHosts.getHosts().forEach(function(menuItem){
			menuHosts['menu'].addItem(menuItem);
		});
	};

	/**
	 * 获取所有hosts菜单项
	 */
	menuHosts['getHosts'] = function(){

		var menuItems = [];

		var current = settings.get('hosts')['current'];

		settings.get('hosts')['list'].forEach(function(hosts, index){

			var menuItem = new air.NativeMenuItem(hosts['name']);

			menuItem['data'] = index;

			if(current === index){

				menuItem['checked'] = true;
			}

			menuItem.addEventListener(air.Event.SELECT, function(event){

				var menuItem = event.currentTarget;

				settings.set('hosts', {
					'current' : menuItem['data']
				});
			});

			menuItems.push(menuItem);
		});

		return menuItems;
	};

	/**
	 * 刷新菜单项
	 */
	function refreshHosts(){

		menuHosts['menu'].removeAllItems();

		initMenu();
	};

	menuHosts.init();

	_win.menuHosts = menuHosts;

})(window);