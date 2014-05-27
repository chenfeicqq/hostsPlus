/**
 * 托盘图标
 * 
 * 依赖menuDNS、menuGroup
 * 
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;
	var app = _win.app;
	var menuDNS = _win.menuDNS;
	var menuHosts = _win.menuHosts;
	var menuGroup = _win.menuGroup;

	var trayIcon = {
		'menu' : new air.NativeMenu()
	};

	trayIcon['init'] = function(){

		initMenu();

		settings.on('hosts dns', function(){
			refresh();
		});

		// Windows
		if (NativeApplication.supportsSystemTrayIcon) {

			// 图标
			loadResource(isLinux ? 'icons/icon_linux.png' : 'icons/icon16.png', function(event) {
				NativeApplication.nativeApplication.icon.bitmaps = [event.target.content.bitmapData];
			});

			// 提示
			NativeApplication.nativeApplication.icon.tooltip = "hostsPlus";

			// 菜单
			NativeApplication.nativeApplication.icon.menu = trayIcon['menu'];

			// 点击切换窗口显示/隐藏
			air.NativeApplication.nativeApplication.icon.addEventListener(air.MouseEvent.CLICK, function(){
				app.toggleShow();
			});
		}

		// Mac
		if (NativeApplication.supportsDockIcon) {

			// 图标
			loadResource('icons/icon128.png', function(event) {
				NativeApplication.nativeApplication.icon.bitmaps = [event.target.content.bitmapData];
			});

			// 菜单
			NativeApplication.nativeApplication.icon.menu = trayIcon['menu'];

			// 屏蔽首次INVOKE事件
			var isDockInit = false;
			NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, function(){

				// 首次触发事件，isDockInit 为 false
				if(isDockInit){
					app.toggleShow();
					return;
				}

				// 首次触发事件，修改 isDockInit 为 true
				isInit = true;
			});
		}
	};

	/**
	 * 初始化托盘图标的菜单项
	 */
	function initMenu(){

		// DNS 菜单项
		if(!isLinux){
			// 非Linux系统
			// 只有一个 DNS 时，不添加 DNS 菜单项
			initMenuGroup(menuDNS.getDNSs());
		}

		// hosts 菜单项
		// 只有一个“默认”时，不添加 hosts 菜单项
		initMenuGroup(menuHosts.getHosts());

		// 分组 菜单项
		// 只有一个“关闭所有分组”时，不添加 分组 菜单项
		initMenuGroup(menuGroup.getGroups());

		// Mac系统右键自带'显示/隐藏'功能
		if(!isMac){
			trayIcon['menu'].addItem(new air.NativeMenuItem('显示/隐藏')).addEventListener(air.Event.SELECT, function(){
				app.toggleShow();
			});
		}

		if(isWin){
			trayIcon['menu'].addItem(new air.NativeMenuItem('重新启动')).addEventListener(air.Event.SELECT, function(){
				editor.checkUnsaved(function(){
					restart(function(){
						app.exit();
					})
				});
			});
		}

		if(!isMac){
			trayIcon['menu'].addItem(new air.NativeMenuItem('退出')).addEventListener(air.Event.SELECT, function(){
				editor.checkUnsaved(function(){
					app.exit();
				});
			});
		}
	};

	/**
	 * 添加菜单分组
	 * 菜单项只有一个时，不添加
	 */
	function initMenuGroup(menuItems){

		// 分组下只有一个菜单项时，不添加
		if(1 < menuItems.length){

			menuItems.forEach(function(menuItem){
				trayIcon['menu'].addItem(menuItem);
			});

			// 分隔符
			trayIcon['menu'].addItem(new air.NativeMenuItem('', true));
		}
	};

	/**
	 * 刷新菜单项
	 */
	function refresh(){

		trayIcon['menu'].removeAllItems();

		initMenu();
	};

	trayIcon.init();

	_win.trayIcon = trayIcon;

})(window);