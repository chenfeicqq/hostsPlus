/**
 * 标题
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;
	var editor = _win.editor;

	var title = {};

	title['init'] = function(){

		initTitle();

		editor.on('change', function(){
			initTitle();
		});

		settings.on('hosts dns', function(){
			initTitle();
		});
	};

	/**
	 * 初始化标题
	 */
	function initTitle(){
		var title = getTitle();

		// 标题内容发生变化，修改标题
		if(document.title !== title){

			document.title = title;
		}
	};

	/**
	 * 拼接标题
	 */
	function getTitle(){
		var title = '';

		// 未保存
		if(editor.isUnsaved()){
			title += '*'
		}

		// 当前 hosts 名称
		title += settings.getCurrentHosts()['name'];

		var currentDNS = settings.getCurrentDNS();

		if(null !== currentDNS){

			title += ' - ';

			// 当前 DNS 名称
			title += currentDNS['name'];
		}

		title += ' - hostsPlus';

		return title;
	};

	title.init();

	_win.title = title;

})(window);