String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
}

var applicationDirectory = air.File.applicationDirectory;
var applicationStorageDirectory = air.File.applicationStorageDirectory;
var NativeApplication = air.NativeApplication;

var osname = air.Capabilities.os.toLowerCase();
var isWin = osname.indexOf("win") > -1,
	isLinux = osname.indexOf("linux") > -1,
	isMac = osname.indexOf("mac") > -1;

// 加载资源
function loadResource(path, callback) {
	var iconLoad = new air.Loader();
	iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE, callback);
	iconLoad.load(new air.URLRequest(path));
}

// 测试是否UTF-8编码
function isUTF8Bytes(data) {
	// BOM
	if (data[0] === 0xEF && data[0] === 0xBB && data[0] === 0xBF) return true;

	var charByteCounter = 1;
	// 计算当前正分析的字符应还有的字节数
	var curByte; // 当前分析的字节.
	for (var i = 0, c = data.length; i < c; i++) {
		curByte = data[i];
		if (charByteCounter == 1) {
			if (curByte >= 0x80) {
				// 判断当前
				while (((curByte <<= 1) & 0x80) != 0) {
					charByteCounter++;
				}
				// 标记位首位若为非0 则至少以2个1开始 如:110XXXXX...........1111110X　
				if (charByteCounter == 1 || charByteCounter > 6) return false;
			}
		} else {
			// 若是UTF-8 此时第一位必须为1
			if ((curByte & 0xC0) != 0x80) return false;
			charByteCounter--;
		}
	}
	if (charByteCounter > 1) return false;
	return true;
}

// 校验是否IP(v4&v6)
function isIP(str){
	var match = str.match(/:/g), v6Len = match && match.length;
	if(match && v6Len>0 && v6Len<=7){
		return /^([\da-f]{0,4}(:|::|$)){1,7}$/i.test(str) && (/::/.test(str)?str.match(/::/g).length === 1:true);
	}
	else{
		return /^(\d{1,3}\.){3}\d{1,3}$/.test(str);
	}
}

// 读文件
function readFile(path, bText, charset) {
	var file = typeof path === 'string' ? applicationStorageDirectory.resolvePath(path) : path;
	if (file.exists === true) {
		var fileStream = new air.FileStream();
		fileStream.open(file, air.FileMode.READ);
		var fileData;
		if (bText === true) {
			fileData = fileStream.readMultiByte(fileStream.bytesAvailable, charset ? charset : 'utf-8');
		} else {
			fileData = new air.ByteArray();
			fileStream.readBytes(fileData);
		}
		fileStream.close();
		fileStream = null;
		return fileData;
	} else return false;
}

// 写文件
function writeFile(path, fileData, charset) {
	var file = typeof path === 'string' ? applicationStorageDirectory.resolvePath(path) : path;
	var fileStream = new air.FileStream();
	fileStream.open(file, air.FileMode.WRITE);
	if (typeof fileData === 'string') fileStream.writeMultiByte(fileData, charset ? charset : 'utf-8');
	else fileStream.writeBytes(fileData);
	fileStream.close();
	fileStream = null;
}

// 获取本地网卡的IP
function getLocalIP() {
	var arrInterfaces = air.NetworkInfo.networkInfo.findInterfaces(),
		interfaceObj, arrAddresses, address;
	var arrLocalIP = [];
	if (arrInterfaces !== null) {
		for (var i = 0, count1 = arrInterfaces.length; i < count1; i++) {
			interfaceObj = arrInterfaces[i];
			if (interfaceObj.active) {
				arrAddresses = interfaceObj.addresses;
				for (var j = 0, count2 = arrAddresses.length; j < count2; j++) {
					address = arrAddresses[j];
					if (address.ipVersion === 'IPv4' && !/^\s*127\.0\.0\.1\s*$/.test(address.address)) arrLocalIP.push(address.address);
				}
			}
		}
	}
	return arrLocalIP;
}

// 访问外部扩展
function callExt(api) {
	if (air.NativeProcess.isSupported) {
		var file = air.File.applicationDirectory,
			filepath;
		if (isWin) filepath = api + '.cmd';
		else if (isLinux) filepath = api + '.sh';
		else if (isMac) filepath = api + '.sh';
		filepath = 'ext/' + filepath;
		if (filepath) {
			file = file.resolvePath(isMac?'/bin/bash':filepath);
			var nativeProcessStartupInfo = new air.NativeProcessStartupInfo();
			nativeProcessStartupInfo.executable = file;
			var args = new air.Vector["<String>"]();
			if(isMac){
				// Mac下无法直接运行sh脚本，必需要通过bash运行
				var runFile = air.File.applicationDirectory;
				args.push(runFile.nativePath + '/' + filepath);
			}
			var callArguments = arguments,
				callback = callArguments[callArguments.length - 1],
				hasCallback = typeof callback === 'function';
			for (var i = 1, c = callArguments.length - (hasCallback ? 1 : 0); i < c; i++){
				if(callArguments[i] !== null && callArguments[i] !== undefined){
					args.push(callArguments[i].replace(/ /g, '_~'));
				}
			}
			nativeProcessStartupInfo.arguments = args;
			var process = new air.NativeProcess();
			if (hasCallback) {
				function progressHandle() {
					process.removeEventListener(air.ProgressEvent.STANDARD_OUTPUT_DATA, progressHandle);
					var stdOut = process.standardOutput;
					var str = stdOut.readMultiByte(stdOut.bytesAvailable, 'ansi');
					process.exit();
					process = null;
					callback(str);
				}
				process.addEventListener(air.ProgressEvent.STANDARD_OUTPUT_DATA, progressHandle);
			}
			// 添加Error事件监听
			process.addEventListener(air.ProgressEvent.STANDARD_ERROR_DATA, function(){
				var errorOut = process.standardError;
				var errorInfo = errorOut.readMultiByte(errorOut.bytesAvailable, 'ansi');
				console.log(errorInfo);
			});
			process.start(nativeProcessStartupInfo);
		}
	}
}

// 重启启动程序
function restart(callback) {
	callExt('restart', callback);
}

// 读取本机名
function hostname(callback) {
	callExt('hostname', callback);
}

// ping
function ping(hostname, callback) {
	callExt('ping', hostname, function(str) {
		var match = str.match(/[\[\()]((\d+\.){3}\d+)[\]\)]/),
			ip = '';
		if (match !== null) ip = match[1];
		callback(ip);
	});
}

// 设置系统DNS
function setSysDNS(dnsip) {
	if(isMac){
		getActiveNetnameMac(function(netname){
			callExt('setsysdns', netname, dnsip ? dnsip : 'clear');
		});
	} else {
		var netname = getActiveNetnameWin();
		callExt('setsysdns', netname, dnsip ? dnsip : 'clear');
	}
}

// 获得当前激活网卡名(Win)
function getActiveNetnameWin(){
	var arrInterfaces = air.NetworkInfo.networkInfo.findInterfaces(),
		interfaceObj;
	if (arrInterfaces !== null) {
		for (var i = 0, count1 = arrInterfaces.length; i < count1; i++) {
			interfaceObj = arrInterfaces[i];
			if (interfaceObj.active) {
				return interfaceObj.displayName;
			}
		}
	}
}

// 获得当前激活网卡名(Mac)
function getActiveNetnameMac(callback){
	var hardwareport;
	var arrInterfaces = air.NetworkInfo.networkInfo.findInterfaces(),
		interfaceObj;
	if (arrInterfaces !== null) {
		for (var i = 0, count1 = arrInterfaces.length; i < count1; i++) {
			interfaceObj = arrInterfaces[i];
			if (interfaceObj.active) {
				hardwareport = interfaceObj.name;
				break;
			}
		}
	}
	if(hardwareport){
		callExt('getallnetname', function(output){
			var regNetname = new RegExp('(?:^|\\n)Hardware Port:\\s*([^\n]+)\\r?\\nDevice:\\s*'+hardwareport, 'i');
			var match = output.match(regNetname);
			if(match !== null){
				callback(match[1]);
			}
		});
	}
}

// 清除系统DNS
function clearSysDNS() {
	if(isWin){
		// 只有Windows清系统DNS
		callExt('clearsysdns');
	}
}

// 设置IE DNS缓存模式
function setIeDns(disable) {
	callExt('setiedns', disable);
}