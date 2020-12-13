const fs = require('fs'),
	path = require('path'),
	RSAKey = require('./Rsa'),
	// dst = process.env.userprofile + "\\desktop\\123";
	dst = path.join(__dirname, "examples")

// key长度为1024位，所有密钥均采用16进制表示，加密指数E为10001（hex），对应的uf8为65537，
// 大素数P为：A696266BF8FA0E85A967156B44E10B4C085477074292BB9E1D6C3ED47E0DA618EA3F6A2630E729EB90A29BD53FC2D20563B292378A6D9A6A46DE409017C30697
// 大素数Q为：DFADC98B25580C21B0EF040AAB47E76DFA8BF826DA28483155F81D9DFEA458BC539F9A27A4B959E94BFA9AFF110079341A3BCDDF70A46ED3216C7D4B7110D65B
// 模数N为：  918DE21674D7B5CE8A759BC55985556568F54AAEDFFE275E8945F179C43F276BC4FDEA9FF86F8D14AC7F0A16ED69A8208F2E90E7486C3D66D55DDADFA4E7ED8EDD6BC4B486D43194867EA15BC0245090A8B0F70901B93DB010DA8C11041CFDB98CF1AA1B08D9E74C9930FAE92393E479525A72A027C403CF0D86A26B8A4591AD
// 私钥D为：  3E8F450571E2E4F988F953A256FFBFDC7E682F594A5CEA7EEF71688075A0CF48BABA880589BA28612262D7EB52CF7EBBBFCEBBE92C6F995481907D6A726E5CE3CAFA0BADFD252CC5739D580BA680DBAC4E487A9BD2A0922FC07DF3A9A77A8D6383B8F81A6251E036AE8EB4505EEBD9725DD2B584CFF90F415A4B8BC979556DE1
// 欧拉函数φ(n) = (P-1)*(Q-1)
// (E * D) % φ(n) = 1

const RSADo = {
	"modulus": "918DE21674D7B5CE8A759BC55985556568F54AAEDFFE275E8945F179C43F276BC4FDEA9FF86F8D14AC7F0A16ED69A8208F2E90E7486C3D66D55DDADFA4E7ED8EDD6BC4B486D43194867EA15BC0245090A8B0F70901B93DB010DA8C11041CFDB98CF1AA1B08D9E74C9930FAE92393E479525A72A027C403CF0D86A26B8A4591AD",
	"publicExponent": "10001"
}

const privateKey = "3E8F450571E2E4F988F953A256FFBFDC7E682F594A5CEA7EEF71688075A0CF48BABA880589BA28612262D7EB52CF7EBBBFCEBBE92C6F995481907D6A726E5CE3CAFA0BADFD252CC5739D580BA680DBAC4E487A9BD2A0922FC07DF3A9A77A8D6383B8F81A6251E036AE8EB4505EEBD9725DD2B584CFF90F415A4B8BC979556DE1"

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

decrypt(dst);

function decrypt(dst) {
	return new Promise(function (resolve, reject) {
		const promiseArr = [];
		fs.readdirSync(dst).forEach(function (files) {
			const targetPath = path.join(dst, files)
			if (path.extname(targetPath) !== ".crypted") {
				if (fs.statSync(targetPath).isDirectory()) {
					return decrypt(targetPath);
				}
			} else {
				const promise = new Promise((res) => {
					let str = fs.readFileSync(targetPath);
					for (let i = 0; i < str.length; i++) {
						str[i] = str[i] ^ 17302554875;
					};
					str = str.toString();
					// console.log('str', str)
					const rsa = new RSAKey();
					rsa.setPrivate(RSADo.modulus, RSADo.publicExponent, privateKey);
					const rsaBodyStr = str.slice(-256);
					const extnameStr = str.slice(0, 256);
					const decryptBodyStr = rsa.decrypt(rsaBodyStr);
					let decryptExtnameStr = rsa.decrypt(extnameStr);
					decryptExtnameStr = Buffer.from(decryptExtnameStr, 'base64').toString();
					// console.log('decryptBodyStr', decryptBodyStr);
					if (str.length === 512) {
						str = decryptBodyStr;
					} else if (str.length === 513) {
						str = str.slice(256, 1) + decryptBodyStr;
					} else if ((str.length - 512) % 2) {
						// console.info('奇数', (str.length - 512) / 2);
						str = str.slice(256, ((str.length - 511) / 2) + 256) + decryptBodyStr + str.slice(((str.length - 511) / 2 + 256), -256);
					} else {
						// console.info('偶数', (str.length - 512) / 2);
						str = str.slice(256, (str.length / 2)) + decryptBodyStr + str.slice((str.length / 2), -256);
					}
					str = Buffer.from(str, 'base64')
					// console.log('str',str);
					fs.writeFileSync(targetPath, str);
					const renameFiles = path.basename(targetPath, `.crypted`) + `.${decryptExtnameStr}`;
					fs.renameSync(targetPath, `${path.join(dst, renameFiles)}`);
					console.info('解密成功: ', targetPath, renameFiles)
					fs.appendFileSync(
						path.join(__dirname, "log.log"),
						`[${getTime()}] [INFO] 解密成功 ${targetPath} ${renameFiles} \r\n`,
						{ encoding: "utf8" }
					)
					res();
				}).catch(err => {
					console.error("解密单文件时发生了错误: error", err);
				})
				promiseArr.push(promise);
			}
		});
		Promise.all(promiseArr).then(function () {
			resolve();
		}).catch(err => {
			console.error('解密文件时发生了错误: err', err)
		});
	})
}

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
	} else if (mileSecond < 100) {
		second = "0" + mileSecond
	}
	time = `${year}-${month}-${day} ${hour}:${minute}:${second}.${mileSecond}`;
	return time;
}