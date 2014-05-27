/**
 * hosts编辑器
 */
(function(_win, undefined) {

	// imports
	var settings = _win.settings;
	var settings = _win.settings;

	var editor = {};

	/**
	 * 编辑器
	 */
	var codeMirror = new CodeMirror(document.body, {
		// 内容
		'value'                     : settings.getCurrentHosts()['content'],
		// 主题
		'theme'                     : settings.getCurrentTheme(),
		// 扩展快捷键
		'extraKeys'                 : {
			// 切换选中区域行是否启用
			'Ctrl-Q'       : function() {
				toogleLines(true);
			},
			// 切换选中区域行是否注释
			'Ctrl-/'       : function() {
				toogleLines();
			},
			// 添加新分组
			'Ctrl-G'       : function() {
				newGroup();
			},
			// 保存
			'Ctrl-S'       : function() {

				if(editor.isUnsaved()){

					editor.save();
				}
			},
			// 查找
			'F3'           : 'findNext',
			'Shift-F3'     : 'findPrev',
			// 替换
			'Ctrl-H'       : 'replace',
			'Ctrl-Shift-H' : 'replaceAll'
		},
		// 行号
		'lineNumbers'               : true,
		// 高亮
		'highlightSelectionMatches' : true,
		'fixedGutter'               : true
	});

	editor['init'] = function() {

		// 编辑器获取焦点
		codeMirror.focus();

		// 方案变更引起的修改
		var changing = false;

		// 监听编辑器 change 事件
		codeMirror.on('change', function() {

			// 非方案变更引起的修改
			if (false === changing) {

				// 触发 editor 的 change 事件
				$(editor).trigger('change');
			}
		});

		// 监听编辑器 keydown 事件
		$(codeMirror.getInputField()).on('keydown', function(event){

			// 使用了Ctrl键
			if(event.ctrlKey){

				// 获取按键名，如：A/B/C/D/……
				var keyName = String.fromCharCode(event.which);

				// 屏蔽无效控制键
				if(keyName){
					// 非 Q Y A S G Z C X V W N /
					if(/^[^qyasgzcxvwn\/]$/i.test(keyName)){
						// 非 Tab
						if(event.which !== 9){
							return false;
						}
					}
				}
			}
		});

		// 监听配置项变化
		settings.on('hosts', function(){

			var currentHosts = settings.getCurrentHosts()['content'];

			// 当前 hosts 发生变化，重新加载hosts到编辑器中
			if(codeMirror.getValue() !== currentHosts){

				changing = true;

				codeMirror.setValue(settings.getCurrentHosts()['content']);

				// 清空历史操作
				codeMirror.clearHistory();

				// 编辑器获取焦点
				codeMirror.focus();

				changing = false;

				$(editor).trigger('change');
			}

		}).on('preference', function(){

			var currentTheme = settings.getCurrentTheme();

			// 当前主题发生变化
			if(currentTheme !== codeMirror.getOption('theme')){
				// 修改主题
				codeMirror.setOption("theme", currentTheme);
			}
		});
	};

	/**
	 * 检查未保存内容
	 */
	editor['checkUnsaved'] = function(callback) {

		// 不存在未保存内容，直接callback
		if(false === editor.isUnsaved()){
			callback();
			return;
		}

		// 显示窗口
		app.show();

		// 弹窗-提示未保存
		jDialog.confirm({
			'content'    : '您的编辑结果还没保存，需要为您保存吗？',
			'showCancel' : true,
			'choose'     : function(type){

				// 保存编辑结果
				if ('yes' == type) {

					editor.save();
				}

				callback();
			}
		});
	};

	/**
	 * 是否未保存
	 */
	editor['isUnsaved'] = function(){
		return codeMirror.historySize().undo > 0;
	};

	/**
	 * 保存编辑结果
	 */
	editor['save'] = function() {

		// 清空历史操作
		codeMirror.clearHistory();

		// 保存 hosts
		settings.setCurrentHosts(codeMirror.getValue());
	};

	/**
	 * 切换光标到指定行
	 */
	editor['gotoLine'] = function(line){

		// 设置焦点
		codeMirror.setCursor({
			'line' : line,
			'ch' : 0
		});

		// 获取 line 滚动条位置
		var position = codeMirror.charCoords({
			'line' : line,
			'ch' : 0
		}, 'local');

		// 滚动条滚动至 line
		codeMirror.scrollTo(position.left, position.top);
	};

	/**
	 * 切换选中区域内行的状态
	 * @param isEnabled true：切换是否启用；false：切换是否注释
	 */
	function toogleLines(isEnabled){
		// 选中区域开始位置
		var beginCursor = codeMirror.getCursor('begin');
		// 选中区域结束位置
		var endCursor = codeMirror.getCursor('end');

		// 选中区域开始位置的行号
		var beginLineNO = beginCursor.line;
		// 选中区域结束位置的行号
		var endLineNO = endCursor.line;

		// 选中区域是否从行首开始
		var isBeginOfLine = beginCursor.ch === 0;

		// 遍历选中区域所有行
		for (var index = beginLineNO; index <= endLineNO; index++) {

			// index所在行内容
			var line = codeMirror.getLine(index);

			// 忽略行首空白字符，匹配前2个字符
			var match = line.match(/^\s*(.)(.)/);

			if(match){

				if (match[1] === '#') {
					// 以 # 开始，当前为 注释（#）/关闭（#!） 状态，切换为非 注释（#）/关闭（#!） 状态

					// 跳过分组信息行
					if(/^\s*#\s*=+[^=]+=+/.test(line)){
						continue;
					}

					// !isEnabled 切换是否注释
					// 或者
					// isEnabled && match[2] === '!' 切换是否启用 且 第二个字符为'!'
					if(!isEnabled || (isEnabled && match[2] === '!')){

						// 删除行首的 空白字符（^\s*） + # + !? + 空白字符（\s*）
						line = line.replace(/^\s*#!?\s*/, function(all){

							// 当前行变更字符数
							var changeLength = all.length;

							// 选中区域不是从行首开始，且当前行为第一行
							if(!isBeginOfLine && index === beginLineNO){

								// 调整选中区域开始位置
								beginCursor.ch -= changeLength;
							}

							// 当前为最后一行
							if(index === endLineNO){

								// 调整选中区域结束位置
								endCursor.ch -= changeLength;
							}

							return '';
						});

						// 修改行内容
						codeMirror.setLine(index, line);
					}

				} else {
					// 非 注释（#）/关闭（#!） 状态，根据 isEnabled 将当前行切换为 注释/关闭 状态

					// 将行首的空白字符替换为 #!/#
					line = line.replace(/^\s*/, function(all){

						// 默认切换注释状态
						var commentTag = '#';

						// isEnabled true：切换启用状态（#!）
						if(true === isEnabled){
							commentTag += '!';
						}

						// 空格
						commentTag += ' ';

						// 当前行变更字符数 = 新增字符数（commentTag.length） - 删除字符数（all.length）
						var changeLength = commentTag.length - all.length;

						// 选中区域不是从行首开始，且当前行为第一行
						if(!isBeginOfLine && index === beginLineNO){

							// 调整选中区域开始位置
							beginCursor.ch += changeLength;
						}

						// 当前为最后一行
						if(index === endLineNO){

							// 调整选中区域结束位置
							endCursor.ch += changeLength;
						}

						return commentTag;
					});

					// 修改行内容
					codeMirror.setLine(index, line);
				}
			}
		}

		codeMirror.setSelection(beginCursor, endCursor);
	};

	/**
	 * 当前位置新建分组
	 */
	function newGroup(){

		var prefix = '# ==================== ';
		var groupName = 'group';
		var suffix = ' ====================';

		// 当前光标所在行的行号
		var currentLineNO = codeMirror.getCursor(true).line;

		// 设置当前行为（换行 + 新分组行 + 换行 + 换行 + 原来的行内容）
		codeMirror.setLine(currentLineNO, '\r\n' + prefix + groupName + suffix + '\r\n\r\n' + codeMirror.getLine(currentLineNO));

		// 选中 groupName
		codeMirror.setSelection({
			'line' : currentLineNO + 1,
			'ch' : prefix.length
		}, {
			'line' : currentLineNO + 1,
			'ch' : prefix.length + groupName.length
		});
	};

	/**
	 * 监听编辑器变化
	 */
	editor['on'] = function(type, callback){
		$(editor).bind(type, callback);
		return this;
	};

	editor.init();

	_win.editor = editor;

})(window);