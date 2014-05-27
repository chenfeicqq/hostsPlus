/**
 * 弹窗-关于
 */
(function(_win, undefined){

	var html = '<div class="about">\
					<h1>hostsPlus</h1>\
					<p id="J-window-about-version" class="ver"></p>\
					<p></p>\
					<p>hostsPlus是一个hosts增强编辑软件，主要实现以下功能增强：</p>\
					<ol>\
						<li>hosts方案管理</li>\
						<li>hosts分组管理</li>\
						<li>重定向到主机名或域名</li>\
						<li>DNS切换</li>\
					</ol>\
					<p>联系作者：<a href="mailto:yanis.wang@gmail.com">yanis.wang@gmail.com</a></p>\
				</div>';

	var windowAbout = {
		'title' : '关于hostsPlus',
		'content' : $(html)
	};

	windowAbout['show'] = function(){

		jDialog.prompt(windowAbout);

		var version = getVersion();

		$('#J-window-about-version').text(version);
	};

	/**
	 * 获取程序版本
	 */
	function getVersion(){
		// NativeApplication.nativeApplication.applicationDescriptor 为 app.xml
		var applicationDescriptor = '' + NativeApplication.nativeApplication.applicationDescriptor;

		return $(applicationDescriptor).find('versionLabel').text();
	}

	_win.windowAbout = windowAbout;

})(window);