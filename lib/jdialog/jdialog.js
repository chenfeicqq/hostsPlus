/**
 * 弹窗组件
 */
(function(_win, _doc, undefined){

	/**
	 * 默认设置
	 */
	var defaults = {
		title:'提示',
		type:'text',
		theme:'win8',
		position:{'left':'center','top':'center'},
		focus:'mousedown',
		shadow:4,
		time:0,
		noTitle:false,
		noBorder:false,
		fixed:false,
		drag:false,
		modal:false,
		animate:300
	};

	var jDialog = function(){
		var _this=this;
		_this.init.apply(_this,arguments);
	};

	jDialog.version='1.0.0';
	jDialog.settings=defaults;

	//初始化jDialog
	var isIE=$.browser.msie,browVer=$.browser.version,isIE6=isIE&&browVer<7,isTouch=('ontouchend' in _doc);;
	var $win=$(_win),_docElem,_body;
	var $modalMask,$dragMask;
	var arrTopZindex=[99000,100000];//遮盖层上下的zIndex
	var arrModalDailog=[],modalCount=0;
	//遮盖控制
	function showModal(dialog){
		if(arrModalDailog.length==0)$modalMask.show();
		$modalMask.css('zIndex',dialog.zIndex);
		arrModalDailog.push(dialog);
		modalCount++;
	}
	function hideModal(){
		arrModalDailog.pop();
		modalCount--;
		modalCount==0?$modalMask.hide():$modalMask.css('zIndex',arrModalDailog[arrModalDailog.length-1].zIndex);
	}
	$(function(){
		_docElem=_doc.documentElement;
		_body=_doc.body;

		$modalMask=$('<div class="dd_mask" style="display:none"></div>').appendTo('body');//模式遮罩

		//Esc隐藏模式窗口
		$(_doc).keydown(function(e){
			if(e.which===27){
				if(modalCount>0){
					var dialog=arrModalDailog[modalCount-1];
					if(!dialog.settings.noClose)dialog.hide();
					return false;
				}
			}
		});
	});

	jDialog.prototype={
		//初始化对话框
		init:function(options,callback){
			var _this=this;
			_this.bShow=false;
			var settings=_this.settings=$.extend({},jDialog.settings,options);
			if(isIE&&browVer<9)settings.animate=false;//IE6,7,8强制关闭动画
			if(isTouch)settings.fixed=false;//触摸屏浏览器不支持fixed模式，强制改为绝对定位
			var $wrap = $('<div class="dd_' + settings.theme + '"></div>').appendTo('body');
			var $dialog = _this.$dialog = $(
					'<div style="display:none;' + (settings.noBorder ? 'border:none' : '') + '" class="jDialog">'
						+ (settings.noTitle ? '' : '<div class="dd_title">标题</div>')
						+ '<span title="关闭' + (_this.settings.modal ? ' (Esc)' : '') + '" class="dd_close"' + (settings.noClose ? ' style="display:none"' : '') + '>×</span>\
						<div class="dd_content"></div>\
					</div>').appendTo($wrap);
			var $title=_this.$title=$dialog.find('.dd_title');
			_this.$titletext=$dialog.find('.dd_title');
			var $content=_this.$content=$dialog.find('.dd_content');
			var $shadow=_this.$shadow=$('<div style="display:none;" class="dd_shadow"></div>').appendTo($wrap).css('opacity',0.15);
			_this.setTitle(settings.title).setContent(settings.content);
			//绑定事件
			var focus=settings.focus;
			if(focus)$dialog.bind(focus+' touchstart',function(){_this.setTopLayer();});//鼠标点击提升到最上层
			$dialog.find('.dd_close').bind('click touchend',function(){_this.hide();return false;});//关闭按钮
			var drag=settings.drag,shadow=settings.shadow;
			if(drag){
				(drag=='all'?$dialog:$title).addClass('dd_drag').bind({'mousedown touchstart':function(e){
					if(e.target.className=='dd_close')return;
					if(e.type.substr(0,5)=='touch')e=e.originalEvent.targetTouches[0];
					_this.bDrag=true;
					var offset=$dialog.offset();
					_this.lastDragOffset={x:e.pageX-offset.left,y:e.pageY-offset.top};
					$dragMask.show();
					if(e.preventDefault)e.preventDefault();
				},'selectstart':function(){return false;}});//开始拖动
				$(_doc).bind({'mousemove touchmove':function(e){
					if(_this.bDrag){
						if(e.type.substr(0,5)=='touch')e=e.originalEvent.targetTouches[0];
						var scrollLeft=_docElem.scrollLeft||_body.scrollLeft,scrollTop=_docElem.scrollTop||_body.scrollTop;
						var limitLeft=0,limitTop=0,limitRight=_docElem.clientWidth-$dialog.outerWidth(),limitBottom=_docElem.clientHeight-$dialog.outerHeight();

						var lastDragOffset=_this.lastDragOffset;
						var left=e.pageX-lastDragOffset.x,top=e.pageY-lastDragOffset.y;
						if(settings.fixed&&!isIE6){
							left-=scrollLeft;
							top-=scrollTop;
						}
						else{
							limitLeft=scrollLeft;
							limitTop=scrollTop;
							limitRight+=limitLeft;
							limitBottom+=limitTop;
						}
						left=left<limitLeft?limitLeft:(left>limitRight?limitRight:left);
						top=top<limitTop?limitTop:(top>limitBottom?limitBottom:top);

						if(!isIE6||!corner){
							$dialog.css('opacity',0.5);
							$shadow.hide();
						}
						$dialog.css({left:left,top:top});
						$shadow.css({left:left+shadow,top:top+shadow});
						if(isIE6)_this.changeFixed();
						return false;
					}
				},'mouseup touchend':function(){//结束拖动
					if(_this.bDrag){
						_this.bDrag=false;
						$dialog.css('opacity','');
						$shadow.show();
						$dragMask.hide();
					}
				}});
			}
			_this.changeFixed().setTopLayer().moveTo();
			var timer;
			if(!drag)$win.bind('resize',function(){
				if(timer)clearTimeout(timer);
				timer=setTimeout(function(){_this.moveTo();},100);//某些浏览器事件响应频率过高
			});
		},
		//设置标题
		setTitle:function(sHtml){
			var _this=this;
			_this.$titletext.html(sHtml);
			return _this;
		},
		//设置内容
		setContent:function(sHtml){
			if (typeof sHtml === 'undefined') {
				return;
			}

			var _this = this;
			_this.$content.html(sHtml);
			_this.updateSize();
			return _this;
		},
		//更新内容大小和阴影
		updateSize:function(){
			var _this=this,$dialog=_this.$dialog,$content=_this.$content,settings=_this.settings,width=settings.width,height=settings.height;
			//限制高宽
			$dialog.add($content).css({width:'',height:''});
			var dialogWidth=$dialog.width(),newWidth;
			if(width){
				if(isNaN(width)){
					var minWidth=width[0],maxWidth=width[1];
					if(minWidth&&dialogWidth<minWidth)newWidth=minWidth;
					if(maxWidth&&dialogWidth>maxWidth)newWidth=maxWidth;
				}
				else newWidth=width;
				if(newWidth){
					$dialog.css('width',newWidth);
					$content.css({'width':newWidth});
				}
			}
			var dialogHeight=$dialog.height(),newHeight;
			if(height){
				if(isNaN(height)){
					var minHeight=height[0],maxHeight=height[1];
					if(minHeight&&dialogHeight<minHeight)newHeight=minHeight;
					if(maxHeight&&dialogHeight>maxHeight)newHeight=maxHeight;
				}
				else newHeight=height;
				if(newHeight){
					$dialog.css('height',newHeight);
					$content.css('height',newHeight-_this.$title.outerHeight());
				}
			}
			//更新阴影高宽
			_this.$shadow.css({width:$dialog.outerWidth(),height:$dialog.outerHeight()});
			setTimeout(function(){
				if(_this.$dialog)_this.$shadow.css({width:$dialog.outerWidth(),height:$dialog.outerHeight()});
				if(isIE6)_this.moveTo();
			},300);
			return _this;
		},
		//显示对话框
		show:function(position,y){
			var _this=this;
			if(position)_this.moveTo(position,y);
			if(_this.$dialog&&!_this.bShow){
				var settings=_this.settings;
				if(settings.beforeShow&&settings.beforeShow.call(_this)===false)return _this;
				var $all=_this.$dialog.add(_this.$shadow);
				if(settings.modal)showModal(_this);
				var animate=settings.animate;
				animate?$all.fadeIn(animate):$all.show();
				_this.updateSize();//显示后修正内容和阴影大小
				_this.bShow=true;
				//延迟自动隐藏
				var time=settings.time;
				if(time>0)setTimeout(function(){_this.hide();},time);
				if(settings.afterShow)settings.afterShow.call(_this);
			}
			return _this;
		},
		//隐藏对话框
		hide:function(tempAnimate){
			var _this=this,settings=_this.settings;
			if(_this.bShow){
				if(settings.beforeHide&&settings.beforeHide.call(_this)===false)return _this;
				var $all=_this.$dialog.add(_this.$shadow);
				if(settings.modal)hideModal();
				var animate=settings.animate*0.5;
				if(tempAnimate!=undefined)animate=tempAnimate;
				animate?$all.fadeOut(animate):$all.hide();
				_this.bShow=false;
				if(settings.afterHide)settings.afterHide.call(_this);
			}
			return _this;
		},
		//移动对话框
		moveTo:function(position,y){
			var _this=this,settings=_this.settings,$dialog=_this.$dialog;
			if(y!==undefined)position={'left':position,'top':y};
			if(position!==undefined)settings.position=position;
			else position=settings.position;
			var left,top;
			var scrollLeft=_docElem.scrollLeft||_body.scrollLeft,scrollTop=_docElem.scrollTop||_body.scrollTop,clientWidth=_docElem.clientWidth,clientHeight=_docElem.clientHeight,dialogWidth=$dialog.outerWidth(),dialogHeight=$dialog.outerHeight();
			var right=position.right,bottom=position.bottom;
			left=position.left!=undefined?position.left:right!='center'?(clientWidth-dialogWidth-right):right;
			top=position.top!=undefined?position.top:bottom!='center'?(clientHeight-dialogHeight-bottom):bottom;
			if(left=='center')left=(clientWidth-dialogWidth)/2;
			if(top=='center')top=(clientHeight-dialogHeight)/2;
			//fixed模式下以屏幕左上角为起始坐标，其它模式以网页左上角为起始坐标
			if(settings.fixed&&isIE6){
				left+=scrollLeft;
				top+=scrollTop;
			}
			var offsetFix=_this.offsetFix;
			if(offsetFix){
				left+=offsetFix.x;
				top+=offsetFix.y;
			}
			var moveMode=settings.animate&&_this.bShow?'animate':'css',shadow=settings.shadow;
			_this.$dialog[moveMode]({'left':left,'top':top});
			_this.$shadow[moveMode]({'left':left+shadow,'top':top+shadow});
			if(isIE6)_this.changeFixed();
			return _this;
		},
		//最顶端显示
		setTopLayer:function(){
			var _this=this,i=_this.settings.modal?1:0;
			if(!_this.zIndex||_this.zIndex+3<arrTopZindex[i]){
				_this.zIndex=arrTopZindex[i]++;//最下面留给遮盖层
				_this.$shadow.css('zIndex',arrTopZindex[i]++);
				_this.$dialog.css('zIndex',arrTopZindex[i]++);
			}
			return _this;
		},
		//删除当前所有资源
		remove:function(){
			var _this=this,$dialog=_this.$dialog;
			if($dialog){
				_this.hide();
				$dialog.parent().html('').remove();
				_this.$dialog=_this.$shadow=null;
				_this.bShow=false;
			}
		},
		//切换固定显示模式
		changeFixed:function(bFixed){
			var _this=this,settings=_this.settings;
			if(bFixed!=undefined)settings.fixed=bFixed;
			else bFixed=settings.fixed;
			var style1=_this.$dialog[0].style,style2=_this.$shadow[0].style;
			if(bFixed){
				if(isIE6){
					var sDocElem='(document.documentElement||document.body)';
					var left = parseInt(style1.left) - _docElem.scrollLeft,top = parseInt(style1.top) - _docElem.scrollTop;
					style2.position=style1.position='absolute';
					style1.setExpression('left',sDocElem+".scrollLeft+"+left+"+'px'");
					style1.setExpression('top',sDocElem+".scrollTop+"+top+"+'px'");
					style2.setExpression('left',sDocElem+".scrollLeft+"+(left+settings.shadow)+"+'px'");
					style2.setExpression('top',sDocElem+".scrollTop+"+(top+settings.shadow)+"+'px'");
				}
				else style2.position=style1.position = 'fixed';
			}
			else{
				style2.position=style1.position='absolute';
				if(isIE6){
					style1.removeExpression('left');
					style1.removeExpression('top');
				}
			}
			return _this;
		}
	};

	_win.jDialog=jDialog;

	//---------------------------prompt/alert/confirm/popup模块---------------------------

	var okButton     = '<button class="dd_ok">确定</button>';
	var cancelButton = '<button class="dd_cancel">取消</button>';
	var yesButton    = '<button class="dd_yes">是</button>';
	var noButton     = '<button class="dd_no">否</button>';

	jDialog.prompt=function(option){
		option = $.extend({
			title      : '',
			content    : ''
		},option);

		showDialog(option);
	}

	jDialog.alert = function(option) {
		option = $.extend({
			title   : '警告',
			content : ''
		}, option);

		option.content=$('<div class="dd_info">' + option.content + '</div>');

		showDialog(option);
	}

	jDialog.confirm=function(option){
		option = $.extend({
			title      : '确认',
			content    : '',
			/**
			 * 是否显示‘取消’按钮
			 */
			showCancel : false,
			choose     : function(type){
				switch (type) {
					case 'yes':
						break;
					case 'no':
						break;
					default:
						break;
				}
			}
		},option);

		option.content=$('<div class="dd_info">' + option.content + '</div><div class="dd_button">' + yesButton + noButton + (option.showCancel ? cancelButton : '') + '</div>');

		showDialog(option);

		option.content.find('button').focus().click(function() {
			hideDialog();

			var type = this.className.substr(3);
			if ('cancel' !== type && $.isFunction(option.choose)) {
				option.choose(type);
			}
		});
	}

	jDialog.popup=function(option){
		option = $.extend({
			title     : '',
			content   : '',
			/**
			 * 如果您需要在弹出窗弹出后执行某些代码，覆盖该方法
			 */
			afterShow : function(){
			},
			/**
			 * 当用户点击‘确定’按钮关闭弹出窗时，会调用该方法
			 * 如果您需要获取弹出窗中的某些数据，覆盖该方法，该方法的返回值，会传给choose
			 * 如果该方法返回null，则会阻止弹出窗关闭
			 */
			getData   : function(){
			},
			/**
			 * 当用户点击‘确定’按钮关闭弹出窗后会调用该方法
			 */
			choose    : function(){
			}
		},option);

		option.content=$(option.content + '<div class="dd_button">' + okButton + cancelButton + '</div>');

		showDialog(option);

		option.content.find('button').click(function(){
			// 用户点击‘取消’按钮，直接关闭
			if('cancel' === this.className.substr(3)){
				hideDialog();
				return;
			}

			if ($.isFunction(option.choose) && $.isFunction(option.getData)) {

				var data = option.getData();

				// 如果返回数据为null，则阻止弹出窗关闭
				if(data === null){
					return;
				}

				hideDialog();

				option.choose(data);
			}
		});
	}

	function showDialog(option){
		// 将已经存在的Dialog隐藏
		hideDialog();

		option = $.extend({
			type       : 'html',
			modal      : true,
			drag       : true,
			fixed      : true,
			animate    : false,
			width      : [ 200, 850 ],
			beforeShow : function(){
			},
			afterShow  : function(){
			},
			beforeHide : function(){
				return true;
			},
			afterHide  : function() {
				this.remove();
			}
		}, option);

		jDialog.dialog = new jDialog(option).show();
	}

	function hideDialog(){
		if (null != jDialog.dialog) {
			jDialog.dialog.hide();
			jDialog.dialog = null;
		}
	}

})(window, document);