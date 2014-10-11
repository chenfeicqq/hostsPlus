/**
 * 弹窗-编辑器
 */
(function(_win, undefined){

	// imports
	var settings = _win.settings;

	var html = '<table class="editor">\
					<tbody>\
						<tr>\
							<td>\
								<label for="J-editor-theme">主题：</label>\
							</td>\
							<td>\
								<select id="J-editor-theme"></select>\
							</td>\
						</tr>\
						<tr>\
							<td>\
								<label for="J-editor-font-size">字体大小：</label>\
							</td>\
							<td>\
								<input id="J-editor-font-size" type="text" />\
							</td>\
						</tr>\
					</tbody>\
				</table>';

	var windowEditor = {
		'title' : '编辑器',
		'content' : html
	};

	windowEditor['show'] = function(){

		jDialog.popup($.extend({
			'afterShow' : function(){

				refreshThemeSelectOptions();

				$('#J-editor-font-size').val(settings.get('preference')['editor']['font']['size']);
			},
			'getData' : function(){

				return {
					'font' : {
						'size' : $('#J-editor-font-size').val()
					},
					'theme' : {
						'current' : $('#J-editor-theme').val() * 1
					}
				};
			},
			'choose' : function(editor){

				settings.set('preference', {
					'editor' : editor
				}, true);
			}
		}, windowEditor));
	};

	function refreshThemeSelectOptions(){

		var editorTheme = $('#J-editor-theme');

		var current = settings.get('preference')['editor']['theme']['current'];

		settings.get('preference')['editor']['theme']['list'].forEach(function(theme, index){
			if(index === current){
				editorTheme.append('<option value="' + index + '" selected="selected">' + theme + '</option>');
			} else {
				editorTheme.append('<option value="' + index + '">' + theme + '</option>');
			}
		});
	}

	_win.windowEditor = windowEditor;

})(window);