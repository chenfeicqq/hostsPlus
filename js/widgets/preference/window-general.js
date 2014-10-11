/**
 * 弹窗-首选项
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var html = '<table class="preference">\
					<tbody>\
						<tr' + (NativeApplication.supportsStartAtLogin ? '' : ' style="display:none;"') + '>\
							<td>\
								<label for="J-general-autorun">开机启动：</label>\
							</td>\
							<td>\
								<input id="J-general-autorun" type="checkbox" />\
							</td>\
						</tr>\
						<tr>\
							<td>\
								<label for="J-general-start-hide">启动后隐藏：</label>\
							</td>\
							<td>\
								<input id="J-general-start-hide" type="checkbox" />\
							</td>\
						</tr>\
					</tbody>\
				</table>';

	var windowGeneral = {
		'title' : '首选项',
		'content' : html
	};

	windowGeneral['show'] = function(){

		jDialog.popup($.extend({
			'afterShow' : function(){

				var general = settings.get('preference')['general'];

				if(general['autorun']){
					$('#J-general-autorun').prop('checked', true);
				}

				if(general['startHide']){
					$('#J-general-start-hide').prop('checked', true);
				}
			},
			'getData' : function(){

				return {
					'autorun' : $('#J-general-autorun').prop('checked'),
					'startHide' : $('#J-general-start-hide').prop('checked')
				};
			},
			'choose' : function(general){

				settings.set('preference', {
					'general' : general
				});
			}
		}, windowGeneral));
	};

	_win.windowGeneral = windowGeneral;

})(window);