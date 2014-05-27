/**
 * hosts文件操作
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var hosts = {
		// hosts 文件路径
		'path' : isWin ? 'C:/Windows/System32/drivers/etc/hosts' : isLinux ? '/etc/hosts' : isMac ? '/etc/hosts' : '',
	};

	/**
	 * 初始化
	 */
	hosts['init'] = function(){

		// 检测 hosts 文件编码
		hosts['charset'] = isUTF8Bytes(readFile(hosts['path'])) ? 'utf-8' : 'ansi';

		// 检测是否第一次启动
		if(-1 === settings.get('hosts')['current']){

			// 初始化默认hosts配置
			settings.createHosts('默认', load());
		}

		// Win 下开启 主机/域名 解析
		if(isWin){
			// 更新状态
			hosts['updating'] = false;

			// 更新定时任务
			setInterval(function(){

				// 正在更新，则结束
				if(hosts['updating']){
					return;
				}

				// 开始更新
				hosts.update();

			}, settings.get('hosts')['updateInterval'] * 1000);
		}

		// 监听hosts变化，重新保存hosts
		settings.on('hosts', function(){

			save(settings.getCurrentHosts()['content']);
		});
	};

	/**
	 * 更新hosts，只在需要转换 主机/域名 时有效
	 */
	hosts['update'] = function(){

		// 标记更新开始
		hosts['updating'] = true;

		// 当前hosts的所有行
		var currentHostsLines = settings.getCurrentHosts()['content'].split(/\r?\n/g);

		// key : domain
		// value : ip
		var domainIPMap = {};

		// key : ping
		// value : true
		// 保存为 {} 是为了 key 去重
		var needPingDomains = {};

		currentHostsLines.forEach(function(line){

			var match = line.match(/^\s*([^\s]+)\s+([^#]+)/);

			if(match){
				var ip = match[1];

				// IP
				if(isIP(ip)){

					match[2].trim().split(/\s+/).forEach(function(domain){

						domainIPMap[domain.toLowerCase()] = ip;
					});

					// 结束当前循环
					return;
				}
			}

			if(false === /^\s*#/.test(line)){

				match = line.match(/^\s*([^\s]+)\s+.+/);

				if(null !== match){

					// 需要 ping 的 主机/域名
					needPingDomains[match[1].toLowerCase()] = true;
				}
			}
		});

		// 需要 ping 的 主机/域名 总数
		var total = Object.keys(needPingDomains).length;

		// 如果没有需要 ping 的 主机/域名，则结束
		if(0 === total){

			// 标记更新结束
			hosts['updating'] = false;
		}

		var success = 0;

		for(domain in needPingDomains){
			// 主机/域名 在 domainIPMap 中，直接使用 domainIPMap 中的 IP
			if(domainIPMap[domain]){

				success++;

				// 所有需要 ping 的 domain 全部结束
				if(success === total){
					replaceDomain2IP();
				}
			} else {

				ping(domain, function(ip){

					domainIPMap[domain] = ip;

					success++;

					// 所有需要 ping 的 domain 全部结束
					if(success === total){
						replaceDomain2IP();
					}
				});
			}
		}

		function replaceDomain2IP(){

			// ping 执行完，检测期间 hosts 是否被改动过，hosts 已被修改，则丢弃当前任务结果
			if(settings.getCurrentHosts()['content'] !== currentHostsLines.join('\r\n')){

				// 标记更新结束
				hosts['updating'] = false;

				return;
			}

			currentHostsLines.forEach(function(line, index){

				if(false === /^\s*#/.test(line) && false === /^\s*(\d+\.){3}\d+\s+.+/.test(line)){

					line = line.replace(/^(\s*)([^\s]+)(\s+.+)/, function(all, left, domain, right){

						var ip = domainIPMap[domain.toLowerCase()];

						if(ip){
							domain = ip;
						}

						return left + domain + right;
					});

					currentHostsLines[index] = line;
				}
			});

			// 保存转换 主机/域名 后的hosts
			save(currentHostsLines.join('\r\n'));

			// 标记更新结束
			hosts['updating'] = false;
		}
	};

	/**
	 * 读取系统hosts文件
	 */
	function load(){

		return readFile(hosts['path'], true, hosts['charset']);
	};

	/**
	 * 保存内容到hosts文件
	 */
	function save(content){

		// 与系统hosts有差异才保存
		if(load() !== content){

			try {
				writeFile(hosts['path'], content, hosts['charset']);

			} catch (e) {

				jDialog.alert({
					'title' : '警告',
					'content' : 'hosts写入失败，请检查您系统的hosts文件是否有写入权限？\n' + hosts['path']
				});
			}

			// 清除系统 DNS 缓存
			clearSysDNS();
		}
	};

	hosts.init();

	_win.hosts = hosts;

})(window);