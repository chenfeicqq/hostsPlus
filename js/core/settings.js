/**
 * hostsPlus设置
 */
(function(_win, undefined){

	var settings = {
		'file' : 'settings.json'
	};

	/**
	 * 配置项
	 */
	var json = {
		// 方案
		'hosts' : {
			'list' : [],
			// current 从 0 开始
			// current = -1 时，表示第一次启动
			'current' : -1,
			// 定时刷新（主机或域名重定向功能） hosts 间隔，单位：秒
			'updateInterval' : 3
		},
		// DNS
		'dns' : {
			'default' : {
				'name' : '本地DNS',
				'ip' : ''
			},
			'list' : [
				{
					'name' : '美国DNS',
					'ip' : '8.8.8.8'
				}
			],
			// current 从 0 开始
			// current = 0 时，表示为 default
			// current > 0 时，表示为 list[index - 1]
			'current' : 0
		},
		// 工具
		'tool' : {
			'current' : []
		},
		// 设置
		'preference' : {
			// 首选项
			'general' : {
				// 开机自动启动
				'autorun' : false,
				// 开启后自动隐藏
				'startHide' : false
			},
			// 编辑器
			'editor' : {
				'font' : {
					// 字体大小
					'size' : '16px'
				},
				// 主题
				'theme' : {
					// 主题列表
					'list' : [
						'Bespin',
						'Dawn'
					],
					// 当前主题
					'current' : 0
				}
			}
		}
	};

	settings['init'] = function(){

		// 读取配置
		load(settings['file']);
	};

	/**
	 * bakcupFile恢复配置项
	 */
	settings['restore'] = function(bakcupFile){

		load(bakcupFile);

		for(field in json){

			// 触发配置项变化
			$(settings).trigger(field);
		}

		// 持久化
		save(settings['file']);
	};

	/**
	 * 备份配置至bakcupFile
	 */
	settings['backup'] = function(bakcupFile){
		save(bakcupFile);
	};

	/**
	 * 获取配置项
	 */
	settings['get'] = function(field){
		return json[field];
	};

	/**
	 * 获取所有DNS
	 */
	settings['getDNSList'] = function(field){

		var dns = json['dns'];

		return [].concat(dns['default'], dns['list']);
	};

	/**
	 * 获取当前hosts
	 */
	settings['getCurrentHosts'] = function(){

		var hosts = json['hosts'];

		return hosts['list'][hosts['current']];
	};

	/**
	 * 获取当前DNS
	 */
	settings['getCurrentDNS'] = function(){

		var dnsList = settings.getDNSList();

		var current = json['dns']['current'];

		return current < dnsList.length ? dnsList[current] : null;
	};

	/**
	 * 获取当前theme
	 */
	settings['getCurrentTheme'] = function(){

		var theme = json['preference']['editor']['theme'];

		return theme['list'][theme['current']];
	};

	/**
	 * 保存配置项
	 * 
	 * @param deep 是否递归合并
	 */
	settings['set'] = function(field, value, deep){

		if (true === deep) {
			$.extend(true, json[field], value);
		} else {
			$.extend(json[field], value);
		}

		// 触发配置项变化
		$(settings).trigger(field);

		// 持久化
		save(settings['file']);
	};

	/**
	 * 设置当前 hosts 的content
	 */
	settings['setCurrentHosts'] = function(content){

		settings.getCurrentHosts()['content'] = content;

		// 触发配置项变化
		$(settings).trigger('hosts');

		// 持久化
		save(settings['file']);
	};

	/**
	 * 设置当前 theme
	 */
	settings['setCurrentTheme'] = function(current){

		json['preference']['editor']['theme']['current'] = current;

		// 触发配置项变化
		$(settings).trigger('preference');

		// 持久化
		save(settings['file']);
	};

	/**
	 * 添加一个Hosts
	 */
	settings['createHosts'] = function(name, content){

		name = name.trim();

		// 名称为空，则结束
		if('' === name){
			return;
		}

		var hosts = json['hosts'];

		hosts['list'].push({
			'name' : name,
			'content' : content
		});

		hosts['current'] = hosts['list'].length - 1;

		// 触发配置项变化
		$(settings).trigger('hosts');

		// 持久化
		save(settings['file']);
	};

	/**
	 * 删除当前Hosts
	 */
	settings['deleteHosts'] = function(){

		var hosts = json['hosts'];

		var current = hosts['current'];

		hosts['list'].splice(current, 1);

		hosts['current'] = current - 1;

		// 触发配置项变化
		$(settings).trigger('hosts');

		// 持久化
		save(settings['file']);
	};

	/**
	 * 持久化配置至文件
	 */
	function save(settingsFile){

		writeFile(settingsFile, JSON.stringify(json));
	};

	/**
	 * 从文件读取配置
	 */
	function load(settingsFile){

		try{
			var savedJSON = JSON.parse(readFile(settingsFile, true));

			try{
				// 忽略savedJSON的theme-list配置
				savedJSON['preference']['editor']['theme']['list'] = [];

				// dns-list完全使用savedJSON中配置
				json['dns']['list'] = savedJSON['dns']['list'];
			}catch(e){}

			$.extend(true, json, savedJSON);

		}catch(e){}

		// 记录的当前hosts的index超出list，则默认为第一个
		validateCurrent(json['hosts']);

		// 记录的当前主题的index超出list，则默认为第一个
		validateCurrent(json['preference']['editor']['theme']);
	};

	/**
	 * 校验current是否超出list，超出则将current值置为0
	 */
	function validateCurrent(item){

		if(item['current'] >= item['list'].length){
			item['current'] = 0;
		}
	};

	/**
	 * 监听配置项变化
	 */
	settings['on'] = function(type, callback){
		$(settings).bind(type, callback);
		return this;
	};

	settings.init();

	_win.settings = settings;

})(window);