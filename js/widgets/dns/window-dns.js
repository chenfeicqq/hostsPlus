/**
 * 弹窗-设置DNS
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var html = '<table class="dnssetup">\
					<tbody>\
						<tr>\
							<td colspan="2">\
								<div class="tip">中间以空格分隔，多行为多个DNS。（例：美国DNS 8.8.8.8）</div>\
							</td>\
						</tr>\
						<tr>\
							<td rowspan="2">\
								<label for="J-window-dns-list">DNS列表：</label>\
							</td>\
							<td>\
								<textarea id="J-window-dns-list"></textarea>\
							</td>\
						</tr>\
						<tr>\
							<td>\
								<div class="error" id="J-window-dns-error"></div>\
							</td>\
						</tr>\
					</tbody>\
				</table>';

	var windowDNS = {
		'title' : '设置DNS',
		'content' : html
	};

	windowDNS['show'] = function(){

		jDialog.popup($.extend({
			'afterShow' : function(){

				var dns = settings.get('dns');

				if(true === dns['wifi']){
					$('#J-window-dns-wifi').prop('checked', true);
				}

				var list = [];

				dns['list'].forEach(function(dns){
					list.push(dns['name'] + ' ' + dns['ip']);
				});

				$('#J-window-dns-list').val(list.join('\r\n')).focus();
			},
			'getData' : function(){

				var list = getList();

				if(null == list){
					$('#J-window-dns-error').text('格式错误，请重新修改。');
					$('#J-window-dns-list').focus();
					return null;
				}

				return {
					'wifi' : $('#J-window-dns-wifi').prop('checked'),
					'list' : list
				};
			},
			'choose' : function(dns){

				settings.set('dns', dns);
			}
		}, windowDNS));
	};

	/**
	 * 获取dns列表（解析用户输入，解析失败，返回null）
	 */
	function getList(){

		var list = [];

		var lineList = $('#J-window-dns-list').val().split(/\r?\n/);

		for(var index = 0, length = lineList.length; index < length; index++){
			var line = lineList[index];

			if(line){
				var lineInfo = line.split(/\s+/);

				if(2 !== lineInfo.length){
					return null;
				}

				var ip = lineInfo[1];
				if(!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)){
					return null;
				}

				list.push({
					'name' : lineInfo[0],
					'ip' : ip
				});
			}
		}

		return list;
	};

	_win.windowDNS = windowDNS;

})(window);