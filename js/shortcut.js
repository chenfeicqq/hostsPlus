/**
 * 全局快捷键
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;
	var app = _win.app;
	var editor = _win.editor;
	var menuHelp = _win.menuHelp;
	var windowCreate = _win.windowCreate;
	var windowDelete = _win.windowDelete;

	var shortcut = {};

	shortcut['init'] = function(){

		$(window).on('keydown',function(event){

			switch(event.which){
				// Tab
				case 9:
					if(event.ctrlKey){

						if (event.shiftKey) {
							// Ctrl + Shift + Tab
							toggleHosts(false);
						} else {
							// Ctrl + Tab
							toggleHosts(true);
						}

						return false;
					}
					break;
				// N
				case 78:
					// Command / Ctrl + N
					if(isMac ? event.metaKey : event.ctrlKey){

						// 添加新方案
						editor.checkUnsaved(function(){
							windowCreate.show();
						});

						return false;
					}
					break;
				// Q
				case 81:
					// Command + Q
					if(isMac && event.metaKey){

						// 退出程序
						editor.checkUnsaved(function(){
							app.exit();
						});

						return false;
					}
					break;
				// W
				case 87:
					// Command / Ctrl + W
					if(isMac ? event.metaKey : event.ctrlKey){

						// 删除当前方案
						windowDelete.show();

						return false;
					}

					break;
				// Esc
				case 27:
					// 非Mac系统
					if(!isMac){

						// 隐藏应用程序
						app.toggleShow();

						return false;
					}

					break
				// F1
				case 112:
					// 显示使用指南
					menuHelp.manual();

					break;
				// F11
				case 122:
					// 切换全屏
					app.toggleFullScreen();

					return false;
			}
		});
	};

	/**
	 * 切换Hosts
	 * @param model true : 顺序； false : 逆序；
	 */
	function toggleHosts(model){

		var hostsList = settings.get('hosts')['list'];

		if(1 === hostsList.length){
			return;
		}

		editor.checkUnsaved(function(){

			var current = settings.get('hosts')['current'];

			if(true === model){

				current += 1;

				// 超出 list.length 则设置为第一个
				if(current >= hostsList.length){
					current = 0;
				}
			} else {

				current -= 1;

				// 小于 0 则设置为最后一个
				if(current < 0){
					current = hostsList.length - 1;
				}
			}

			settings.set('hosts', {
				'current' : current
			});
		});
	};

	shortcut.init();

	_win.shortcut = shortcut;

})(window);