/**
 * 菜单-方案
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var menuGroup = {
		'name' : '分组',
		'menu' : new air.NativeMenu()
	};

	menuGroup['init'] = function(){

		initMenu();

		settings.on('hosts', function(){
			refreshGroups();
		});
	};

	function initMenu(){

		// 初始化默认菜单项
		menuGroup['menu'].addItem(initDefault());

		// 分隔符
		menuGroup['menu'].addItem(new air.NativeMenuItem('', true));

		// 初始化自定义group菜单项
		initCustom().forEach(function(menuItem){
			menuGroup['menu'].addItem(menuItem);
		});
	};

	/**
	 * 获取所有group菜单项
	 */
	menuGroup['getGroups'] = function(){
		return [].concat(initDefault(), initCustom());
	};

	/**
	 * 初始化默认菜单项
	 */
	function initDefault(){
		var menuItem = new air.NativeMenuItem('关闭所有分组');

		menuItem.addEventListener(air.Event.SELECT, function(){

			editor.checkUnsaved(function(){

				changeGroup('', false);
			});
		});

		return menuItem;
	}

	/**
	 * 初始化自定义group菜单项
	 */
	function initCustom(){

		var menuItems = [];

		// Group菜单项，Group下hosts行数，Group下开启的hosts行数
		var menuItem = null, groupLines = 0, groupONLines = 0;

		settings.getCurrentHosts()['content'].split(/\r?\n/g).forEach(function(line){

			var match = line.match(/^\s*#\s*=+\s*([^=]+?)\s*((?:\([^\(\)=]+\))*)\s*=+/i);

			// 分组描述行
			if(null !== match){

				// 添加上一次匹配到的Group
				if(null !== menuItem){

					if(0 < groupLines && groupLines === groupONLines){
						menuItem['checked'] = true;
					}

					menuItems.push(menuItem);
				}

				// 重置分组行信息
				groupLines = groupONLines = 0;

				// 分组名称，关联信息（互斥/依赖/组合）
				var groupName = match[1], associativeInfo = match[2];

				if(associativeInfo){
					associativeInfo = associativeInfo.replace(/\)\s*\(/g,',').replace(/\s*[()]\s*/g,'');
				}

				// 分组信息
				menuItem = new air.NativeMenuItem(groupName);

				menuItem['data'] = associativeInfo;

				menuItem.addEventListener(air.Event.SELECT, function(event){
					// 事件源（分组菜单项）
					var menuItem = event.currentTarget;

					// 分组名称
					var name = menuItem['label'];

					// 分组选中
					var selected = !menuItem['checked'];

					// 分组关联信息
					var data = menuItem['data'];

					editor.checkUnsaved(function(){

						changeGroup(name, selected, data);
					});
				});

			}else{

				// 分组下的hosts
				if(false === /^\s*(#[^!]|$)/.test(line)){
					groupLines++;
					if(false === /^\s*#!/.test(line)){
						groupONLines++;
					}
				}
			}
		});

		// 最后一个分组
		if(null !== menuItem){

			if(groupLines === groupONLines){
				menuItem['checked'] = true;
			}

			menuItems.push(menuItem);
		}

		return menuItems;
	};

	function changeGroup(groupName, enable, data){

		// 互斥分组的ID，依赖分组信息（key：分组名；value：true）
		var mutexID = null, dependenceInfo = {};

		// 开启分组操作，检测关联性
		if(enable && data){

			data.split(',').forEach(function(associative){

				associative = associative.toLowerCase();

				if('?' === associative.substr(0, 1)){
					// 以?开始为依赖分组
					dependenceInfo[associative.substr(1)] = true;
				}else{
					// 互斥分组
					mutexID = associative;
				}
			});
		}

		// 当前hosts行
		var currentHostsLines = settings.getCurrentHosts()['content'].split(/\r?\n/g);

		// 是否开启分组，groupName对应分组的行号
		var groupON = null, targetGroupLineNO;

		currentHostsLines.forEach(function(line, index){

			var match = line.match(/^\s*#\s*=+\s*([^=]+?)\s*((?:\([^\(\)=]+\))*)\s*=+/i);

			if(null !== match){
				groupON = null;

				var tempGroupName = match[1];
				var associativeInfo = match[2];

				// '' === groupName 表示 关闭所有分组
				if('' === groupName || tempGroupName === groupName){

					groupON = enable;
					targetGroupLineNO = index;

				} else if(dependenceInfo[tempGroupName.toLowerCase()]){

					// 依赖分组
					groupON = true;

				} else if(null !== mutexID && associativeInfo){

					// 互斥分组
					match = associativeInfo.match(/\(\s*([^\?].*?)\s*\)/);

					if(match){
						var tempMutexID = match[1];

						if(tempMutexID && mutexID === tempMutexID.toLowerCase()){
							groupON = false;
						}
					}
				}

			}else{

				if(null !== groupON){
					if(true === groupON){
						// 开启
						line = line.replace(/^\s*#!\s*/, '');
					}else{
						// 关闭
						line = line.replace(/^\s*([^#])/, '#! $1');
					}
				}

				currentHostsLines[index] = line;
			}
		});

		settings.setCurrentHosts(currentHostsLines.join('\r\n'));

		// '' === groupName 表示 关闭所有分组
		if('' === groupName){
			targetGroupLineNO = 0;
		}

		if(targetGroupLineNO){
			editor.gotoLine(targetGroupLineNO);
		}
	};

	/**
	 * 刷新菜单项
	 */
	function refreshGroups(){
		menuGroup['menu'].removeAllItems();

		initMenu();
	};

	menuGroup.init();

	_win.menuGroup = menuGroup;

})(window);