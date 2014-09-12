/**
 * 菜单-工具
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;
	var windowHost = _win.windowHost;
	var windowIP = _win.windowIP;
	var windowHosts = _win.windowHosts;

	var menuTool = {
		'name' : '工具',
		'menu' : new air.NativeMenu()
	};

	menuTool['init'] = function(){

		initMenu();

		settings.on('tool', function(){
			initSelect();
		});
	};

	function initMenu(){

		menuTool['menu'].addItem(new air.NativeMenuItem('本机IP列表')).addEventListener(air.Event.SELECT, function(){
			windowIP.show();
		});

		menuTool['menu'].addItem(new air.NativeMenuItem('当前主机名')).addEventListener(air.Event.SELECT, function(){
			windowHost.show();
		});

		menuTool['menu'].addItem(new air.NativeMenuItem('当前使用hosts')).addEventListener(air.Event.SELECT, function(){
			windowHosts.show();
		});

		if(isWin){

			// 分隔符
			menuTool['menu'].addItem(new air.NativeMenuItem('', true));

			menuTool['menu'].addItem(new air.NativeMenuItem('关闭IE DNS缓存')).addEventListener(air.Event.SELECT, function(event){

				// 事件源（菜单项）
				var menuItem = event.currentTarget;

				var checked = menuItem['checked'];

				// 当前状态为选中则需要切换为未选中状态，即取消“关闭IE DNS缓存”
				// enable：启用IE DNS缓存；disable：关闭IE DNS缓存
				setIeDns(checked ? 'enable' : 'disable');

				saveCurrent(menuItem['label'], !checked)
			});
		}

		// 初始化选中状态
		initSelect();
	};

	function saveCurrent(tool, enable){
		var current = [];

		settings.get('tool')['current'].forEach(function(tempTool){
			if(tempTool !== tool){
				current.push(tempTool);
			} 
		});

		if(enable){
			current.push(tool);
		}

		settings.set('tool', {
			'current' : current
		});
	};

	function initSelect(){

		var current = settings.get('tool')['current'];

		menuTool['menu']['items'].forEach(function(menuItem){

			// 修改选中状态
			menuItem['checked'] = -1 !== $.inArray(menuItem['label'], current);
		});
	};

	menuTool.init();

	_win.menuTool = menuTool;

})(window);