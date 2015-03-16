/**
 * 应用
 */
(function(_win, undefined) {

	// imports
	var settings = _win.settings;

	var app = {};

	app['init'] = function(){

		// 定时垃圾回收
		setInterval(function(){

			air.System.gc();

		}, 10000);

		// 关闭按钮
		if(isWin){
			nativeWindow.addEventListener(air.Event.CLOSING, function(event){
				event.preventDefault();
				app.hide();
			});
		}

		// 启动后隐藏
		if(true === settings.get('preference')['general']['startHide']){

			NativeApplication.nativeApplication.addEventListener('invoke', function(){
				app.hide();
			});
		}

		// 当前平台支持开机启动
		if(NativeApplication.supportsStartAtLogin){

			// 监听 autorun 变更后，刷新开机自动启动
			settings.on('preference', function(){

				var autorun = settings.get('preference')['general']['autorun'];

				try {

					// 设置开机自动启动
					NativeApplication.nativeApplication.startAtLogin = autorun;

				} catch (e) {

					air.trace("Cannot set autorun: " + e.message);
				}
			});
		}

		// 切换为全屏状态
		app.toggleFullScreen();
	};

	/**
	 * 切换全屏显示
	 */
	app['toggleFullScreen'] = function(){
		nativeWindow.displayState == 'maximized' ? nativeWindow.restore() : nativeWindow.maximize();
	};

	/**
	 * 显示窗口
	 */
	app['show'] = function(){

		nativeWindow.visible = true;

		// 激活窗口
		nativeWindow.activate();

		// 切换至顶
		nativeWindow.orderToFront();
	};

	/**
	 * 隐藏窗口
	 */
	app['hide'] = function(){
		if(isMac){
			nativeWindow.minimize();
		}else{
			nativeWindow.visible = false;
		}
	};

	/**
	 * 退出程序
	 */
	app['exit'] = function(){

		NativeApplication.nativeApplication.icon.bitmaps = [];

		NativeApplication.nativeApplication.exit();
	};

	/**
	 * 设置窗口置顶
	 * @param isAlwaysInFront true：置顶；false：不置顶
	 */
	/*
	function setAlwaysInFront (isAlwaysInFront) {
		nativeWindow.alwaysInFront = isAlwaysInFront;
	};
	*/

	/**
	 * 切换显示或隐藏
	 */
	app['toggleShow'] = function(){

		// 判断当前状态
		if(nativeWindow.visible){
			// 显示 -> 隐藏
			app.hide();
		}else{
			// 隐藏 -> 显示
			app.show();
		}
	};

	app.init();

	_win.app = app;

})(window);