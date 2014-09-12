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

				$('#J-editor-font-size').val(settings.get('preference')['editor']['font']['size']);
			},
			'getData' : function(){

				return {
					'font' : {
						'size' : $('#J-editor-font-size').val()
					}
				};
			},
			'choose' : function(editor){

				settings.set('preference', {
					'editor' : editor
				});
			}
		}, windowEditor));
	};

	_win.windowEditor = windowEditor;

})(window);