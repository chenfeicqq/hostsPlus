/**
 * CodeMirror 高亮逻辑
 */
CodeMirror.defineMode('hosts', function() {
	return {
		/**
		 * @param stream 文档流
		 * @param state 状态对象
		 */
		token: function(stream, state) {
			// peek() 读取下一个字符，不移动读取进度（记录当前读取进度），行尾返回null
			var ch = stream.peek(), match;

			// sol() 当前位置是否为行首，返回true
			if(stream.sol()){
				state.tokenID = -1;
			}

			// 字符为#，则当前为 group / disabled / comment 模式
			if (ch === '#') {
				stream.skipToEnd();
				var string = stream.string;
				return /^\s*#\s*=+[^=]+=+/.test(string)?'group': (/^\s*#!/.test(string)?'disabled':'comment');
			}
			// 空白字符，直接return null
			else if(stream.eatSpace()){
				return null;
			}
			else{
				state.tokenID++;
				if(match = stream.match(/[^\s#]+/)){
					if(state.tokenID === 0){
						return isIP(match[0])?'ip':'name';
					}
					return null;
				}
			}

			// next() 读取下一个字符，并移动读取进度至next后的位置，读取结束返回null
			stream.next();
			return null;
		},
		/**
		 * 初始 状态对象
		 * 
		 * @return 状态对象
		 */
		startState:function(){
			return {tokenID:0};
		}
	};
});

CodeMirror.defineMIME('text/x-hosts', 'hosts')