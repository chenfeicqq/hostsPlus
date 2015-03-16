/**
 * 弹窗-关于
 */
(function(_win, undefined){

	var html = '<div class="shortcut">\
					<table>\
						<tbody>\
							<tr>\
								<td colspan="2" class="group">应用</td>\
							</tr>\
							<tr>\
								<td class="key">F1</td><td class="function">打开使用指南</td>\
							</tr>\
							<tr>\
								<td class="key">F11</td><td class="function">切换最大化</td>\
							</tr>\
							<tr' + (!isMac ? '' : ' style="display:none;"') + '>\
								<td class="key">ESC</td><td class="function">隐藏到系统栏</td>\
							</tr>\
							<tr' + (isMac ? '' : ' style="display:none;"') + '>\
								<td class="key">Command + Q</td><td class="function">退出程序</td>\
							</tr>\
							<tr>\
								<td colspan="2" class="group">方案</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + Tab</td><td class="function">顺序切换方案</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + Shift + Tab</td><td class="function">逆序切换方案</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + N</td><td class="function">添加新方案</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + W</td><td class="function">删除当前方案</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + F</td><td class="function">格式化当前方案</td>\
							</tr>\
							<tr>\
								<td colspan="2" class="group">组</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + G</td><td class="function">新建分组</td>\
							</tr>\
							<tr>\
								<td colspan="2" class="group">行</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + D</td><td class="function">删除当前行</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + E</td><td class="function">切换行启用状态</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + /</td><td class="function">切换行注释状态</td>\
							</tr>\
							<tr>\
								<td colspan="2" class="group">编辑</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + A</td><td class="function">全选</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + C</td><td class="function">复制</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + X</td><td class="function">剪切</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + V</td><td class="function">粘贴</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + Z</td><td class="function">撤销</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + Y</td><td class="function">恢复</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + S</td><td class="function">保存编辑结果</td>\
							</tr>\
							<tr>\
								<td colspan="2" class="group">搜索</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + F</td><td class="function">搜索</td>\
							</tr>\
							<tr>\
								<td class="key">F3</td><td class="function">搜索下一个</td>\
							</tr>\
							<tr>\
								<td class="key">Shift + F3</td><td class="function">搜索上一个</td>\
							</tr>\
							<tr>\
								<td colspan="2" class="group">替换</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + H</td><td class="function">替换</td>\
							</tr>\
							<tr>\
								<td class="key">' + (isMac ? 'Command' : 'Ctrl') + ' + Shift + H</td><td class="function">全部替换</td>\
							</tr>\
						</tbody>\
					</table>\
				</div>';

	var windowShortcut = {
		'title' : '快捷键',
		'content' : $(html)
	};

	windowShortcut['show'] = function(){
		jDialog.prompt(windowShortcut);
	};

	_win.windowShortcut = windowShortcut;

})(window);