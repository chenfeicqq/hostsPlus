/**
 * 弹窗-当前使用hosts
 */
(function(_win, undefined){

	var windowHosts = {
		'title' : '当前使用hosts'
	};

	/**
	 * 弹窗textarea默认宽度370px
	 */
	var dynamicWidth = 370;

	/**
	 * 临时记录当前使用的hosts
	 */
	var useHosts = [];

	windowHosts['show'] = function(){

		// 分析出：当前使用的hosts及弹窗的动态宽度
		analyze();

		var html = '<div class="use-hosts">\
						<textarea id="J-window-hosts" readonly="true" style="width:' + dynamicWidth + 'px;"></textarea>\
					</div>';

		jDialog.prompt($.extend({
			'content' : $(html)
		}, windowHosts));

		$('#J-window-hosts').val(useHosts.join('\r\n')).select();
	};

	/**
	 * 获取当前使用hosts
	 */
	function analyze(){

		// 清空
		useHosts = [];

		// 记录行的最大字符数
		var lineMaxLength = 0;

		// 遍历当前hosts的每行
		settings.getCurrentHosts()['content'].split(/\r?\n/g).forEach(function(line){

			if(/^\s*([^#])/.test(line)){

				useHosts.push(line);

				if(line.length > lineMaxLength){
					lineMaxLength = line.length;
				}
			}
		});

		// 如果行的最大字符个数大于 50 ，则动态设置宽度
		if(lineMaxLength > 50){

			// 动态设置宽度为 字符个数 × 7 + padding-left + padding-right
			dynamicWidth = lineMaxLength * 7 + 10 + 10

			// 设置最大值
			if(dynamicWidth > 800){
				dynamicWidth = 800;
			}
		}
	};

	_win.windowHosts = windowHosts;

})(window);