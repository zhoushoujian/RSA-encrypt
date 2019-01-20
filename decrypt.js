var RSAKey = require('./Rsa'),
	fs = require('fs'),
	path = require('path'),
	dst = process.env.userprofile + "\\desktop";

// var RSADo = {
// 	"modulus": "a5261939975948bb7a58dffe5ff54e65f0498f9175f5a09288810b8975871e99af3b5dd94057b0fc07535f5f97444504fa35169d461d0d30cf0192e307727c065168c788771c561a9400fb49175e9e6aa4e23fe11af69e9412dd23b0cb6684c4c2429bce139e848ab26d0829073351f4acd36074eafd036a5eb83359d2a698d3",
// 	"publicExponent": "10001"
// }

// var privateKey = "8e9912f6d3645894e8d38cb58c0db81ff516cf4c7e5a14c7f1eddb1459d2cded4d8d293fc97aee6aefb861859c8b6a3d1dfe710463e1f9ddc72048c09751971c4a580aa51eb523357a3cc48d31cfad1d4a165066ed92d4748fb6571211da5cb14bc11b6e2df7c1a559e6d5ac1cd5c94703a22891464fba23d0d965086277a161"

// key长度为1024位，所有密钥均采用16进制表示，加密指数E为10001（hex），对应的uf8为65537，
// 大素数P为：A696266BF8FA0E85A967156B44E10B4C085477074292BB9E1D6C3ED47E0DA618EA3F6A2630E729EB90A29BD53FC2D20563B292378A6D9A6A46DE409017C30697
// 大素数Q为：DFADC98B25580C21B0EF040AAB47E76DFA8BF826DA28483155F81D9DFEA458BC539F9A27A4B959E94BFA9AFF110079341A3BCDDF70A46ED3216C7D4B7110D65B
// 模数N为：  918DE21674D7B5CE8A759BC55985556568F54AAEDFFE275E8945F179C43F276BC4FDEA9FF86F8D14AC7F0A16ED69A8208F2E90E7486C3D66D55DDADFA4E7ED8EDD6BC4B486D43194867EA15BC0245090A8B0F70901B93DB010DA8C11041CFDB98CF1AA1B08D9E74C9930FAE92393E479525A72A027C403CF0D86A26B8A4591AD
// 私钥D为：  3E8F450571E2E4F988F953A256FFBFDC7E682F594A5CEA7EEF71688075A0CF48BABA880589BA28612262D7EB52CF7EBBBFCEBBE92C6F995481907D6A726E5CE3CAFA0BADFD252CC5739D580BA680DBAC4E487A9BD2A0922FC07DF3A9A77A8D6383B8F81A6251E036AE8EB4505EEBD9725DD2B584CFF90F415A4B8BC979556DE1
// 欧拉函数φ(n) = (P-1)*(Q-1)
// (E * D) % φ(n) = 1

var RSADo = {
	"modulus": "918DE21674D7B5CE8A759BC55985556568F54AAEDFFE275E8945F179C43F276BC4FDEA9FF86F8D14AC7F0A16ED69A8208F2E90E7486C3D66D55DDADFA4E7ED8EDD6BC4B486D43194867EA15BC0245090A8B0F70901B93DB010DA8C11041CFDB98CF1AA1B08D9E74C9930FAE92393E479525A72A027C403CF0D86A26B8A4591AD",
	"publicExponent": "10001"
}

var privateKey = "3E8F450571E2E4F988F953A256FFBFDC7E682F594A5CEA7EEF71688075A0CF48BABA880589BA28612262D7EB52CF7EBBBFCEBBE92C6F995481907D6A726E5CE3CAFA0BADFD252CC5739D580BA680DBAC4E487A9BD2A0922FC07DF3A9A77A8D6383B8F81A6251E036AE8EB4505EEBD9725DD2B584CFF90F415A4B8BC979556DE1"


decrypt(dst);

function decrypt(dst) {
	return new Promise(function (resolve,reject) {
		var promiseArr = [];
		fs.readdirSync(dst).forEach(function (files) {
			if (path.extname(path.join(dst, files)) !== ".crypted") {
				if (fs.statSync(path.join(dst, files)).isDirectory()) {
					return decrypt(path.join(dst, files));
				}
			} else {
				var promise = new Promise((res) => {
					var str = fs.readFileSync(path.join(dst, files));
					for (var i = 0; i < str.length; i++) {
						str[i] = str[i] ^ 17302554875;
					};
					str = (str).toString();
					// console.log('str', str)
					var rsa = new RSAKey();
					rsa.setPrivate(RSADo.modulus, RSADo.publicExponent, privateKey);
					var rsaBodyStr = str.slice(-256);
					var extnameStr = str.slice(0, 256);
					var decryptBodyStr = rsa.decrypt(rsaBodyStr);
					var decryptExtnameStr = rsa.decrypt(extnameStr);
					decryptExtnameStr = Buffer.from(decryptExtnameStr, 'base64').toString();
					// console.log('decryptBodyStr', decryptBodyStr);
					if (str.length === 512) {
						str = decryptBodyStr;
					} else if (str.length === 513) {
						str = str.slice(256, 1) + decryptBodyStr;
					} else if ((str.length - 512) % 2) {
						console.info('奇数', (str.length - 512) / 2);
						str = str.slice(256, ((str.length - 511) / 2) + 256) + decryptBodyStr + str.slice(((str.length - 511) / 2 + 256), -256);
					} else {
						console.info('偶数', (str.length - 512) / 2);
						str = str.slice(256, (str.length / 2)) + decryptBodyStr + str.slice((str.length / 2), -256);
					}
					str = Buffer.from(str, 'base64')
					// console.log('str',str);
					fs.writeFileSync(path.join(dst, files), str);
					var renameFiles = path.basename(path.join(dst, files), `.crypted`) + `.${decryptExtnameStr}`;
					fs.renameSync(path.join(dst, files), `${path.join(dst, renameFiles)}`);
					res();
				}).catch(err => {
					console.error("error", err);
					reject(err);
				})
				promiseArr.push(promise);
			}
		});
		Promise.all(promiseArr).then(function () {
			resolve();
		});
	})
}

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