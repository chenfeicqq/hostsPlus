/**
 * hosts编辑器
 */
(function(_win, undefined) {

	// imports
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
		'extraKeys'                 : isMac ? {
			// 切换选中区域行是否启用
			'Cmd-E'       : function() {
				toogleLines(true);
			},
			// 切换选中区域行是否注释
			'Cmd-/'       : function() {
				toogleLines();
			},
			// 格式化
			'Shift-Cmd-F' : function() {
				editor.format();
			},
			// 添加新分组
			'Cmd-G'       : function() {
				editor.createGroup();
			},
			// 保存
			'Cmd-S'       : function() {

				if(editor.isUnsaved()){

					editor.save();
				}
			}
		} : {
			// 切换选中区域行是否启用
			'Ctrl-E'       : function() {
				toogleLines(true);
			},
			// 切换选中区域行是否注释
			'Ctrl-/'       : function() {
				toogleLines();
			},
			// 格式化
			'Shift-Ctrl-F' : function() {
				editor.format();
			},
			// 添加新分组
			'Ctrl-G'       : function() {
				editor.createGroup();
			},
			// 保存
			'Ctrl-S'       : function() {

				if(editor.isUnsaved()){

					editor.save();
				}
			}
		},
		// 行号
		'lineNumbers'               : true,
		// 高亮
		'highlightSelectionMatches' : true,
		// 自动获取焦点
		'autofocus'                 : true,
		'fixedGutter'               : true
	});

	editor['init'] = function() {

		// 设置字体
		refreshFont();

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

					// 非 S E G A Y Z X C V W N /
					if(/^[^segayzxcvwn\/]$/i.test(keyName)){

						// 非 Tab
						if(event.which !== 9){

							// 非 Shift || 非 F 结束
							if(!event.shiftKey || /^[^f]$/i.test(keyName)){
								return false;
							}
						}

					} else {

						// Shift 结束
						if(event.shiftKey){
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

			// 重设字体
			refreshFont();
		});
	};

	/**
	 * 设置编辑器字体
	 */
	function refreshFont(){
		$('.CodeMirror').css('fontSize', settings.get('preference')['editor']['font']['size']);
	}

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
		return codeMirror.getValue() != settings.getCurrentHosts()['content'];
	};

	/**
	 * 保存编辑结果
	 */
	editor['save'] = function() {

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
	editor['createGroup'] = function(){

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
	 * 格式化当前Hosts
	 */
	editor['format'] = function(){

		codeMirror.eachLine(function(lineHandle){

			var lineNumber = codeMirror.getLineNumber(lineHandle);

			// 127.0.0.1 localhost -> ["127.0.0.1 localhost", "127.0.0.1", "localhost"]
			// 127.0.0.1 localhost alibaba.com -> ["127.0.0.1 localhost", "127.0.0.1", "localhost alibaba.com"]
			var match = lineHandle.text.match(/(\S+)\s+(.+)/);

			if(match && match.length === 3){

				if(isIP(match[1])){

					// 默认 IP 与 域名 间隔 4 个空格
					var _blank = '    ';

					// 默认为 IPv4 长度
					var maxLength = '255.255.255.255'.length;

					// IPv6
					if(match[1].indexOf(':') > 0){
						maxLength = 39;
					}

					// 保持整洁，补齐 IP长度 与 最长IP/v6长度39 差
					for(var index = 0, length = maxLength - match[1].length; index < length; index++){
						_blank += ' ';
					}

					codeMirror.setLine(lineNumber, match[1] + _blank + $.trim(match[2]));
				}
			}
		});

		/*
		$('.CodeMirror-lines > div > div > div > pre').find('span[class$="-ip"]').each(function(index, item){

			var _parent = $(item).parent();

			// <span class="cm-ip">127.0.0.1</span> localhost
			// ["<span class="cm-ip">127.0.0.1</span> localhost", "<span class="cm-ip">", "127.0.0.1", "</span>", "localhost"]
			var match = _parent.html().match(/(<span.*">)(.*)(<\/span>)\s+(.+)/);

			if(match && match.length === 5){

				// 默认 IP 与 域名 间隔 4 个空格
				var _blank = '    ';

				// 保持整洁，补齐 IP 与 最长 IP 长度差
				for(var index = 0, length = '255.255.255.255'.length - match[2].length; index < length; index++){
					_blank += ' ';
				}

				_parent.html(match[1] + match[2] + match[3] + _blank  + match[4]);
			}
		});
		*/
	}

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