/**
 * 菜单-DNS
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;
	var windowDNS = _win.windowDNS;

	var menuDNS = {
		'name' : 'DNS',
		'menu' : new air.NativeMenu()
	};

	menuDNS['init'] = function(){
		initMenu();

		settings.on('dns', function(){
			refreshDNSs();
		});
	};

	function initMenu(){

		menuDNS['menu'].addItem(new air.NativeMenuItem('设置DNS')).addEventListener(air.Event.SELECT, function(){
			windowDNS.show();
		});

		// 分隔符
		menuDNS['menu'].addItem(new air.NativeMenuItem('', true));

		// 初始化DNS菜单项
		menuDNS.getDNSs().forEach(function(menuItem){
			menuDNS['menu'].addItem(menuItem);
		});
	};

	/**
	 * 获取所有DNS菜单项
	 */
	menuDNS['getDNSs'] = function(){

		var menuItems = [];

		// 获取当前 DNS 的 index
		var current = settings.get('dns')['current'];

		settings.getDNSList().forEach(function(dns, index){

			var menuItem = new air.NativeMenuItem(dns['name']);

			// 选中当前DNS
			if(current === index){

				menuItem['checked'] = true;
			}

			menuItem['data'] = index;

			menuItem.addEventListener(air.Event.SELECT, function(event){

				var menuItem = event.currentTarget;

				settings.set('dns', {
					'current' : menuItem['data']
				});
			});

			menuItems.push(menuItem);
		});

		return menuItems;
	};

	/**
	 * 刷新DNS菜单
	 */
	function refreshDNSs(){
		menuDNS['menu'].removeAllItems();

		initMenu();
	};

	menuDNS.init();

	_win.menuDNS = menuDNS;

})(window);