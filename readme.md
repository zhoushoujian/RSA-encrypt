# RSA-encrypt

仓库地址: ```https://github.com/zhoushoujian/RSA-encrypt```

````Introduction````
1. Use encrypt => base64(read file) + RSA(encrypt file data with middle and extname) + bitwise or(normally most file data);
2. This program only encrypt desktop Common files like office files, video files and so on,detailed on encrypt.js line 48, but it can recursive encrypt.
3. Because of nodejs buffer not support more than 500MB file,so if file size bigger than 500MB,it will be ignored.
4. If file names are the same but extname, pragram will rename them as the same behind because after renaming as crypted extname,there will lose others which names are the same but extname.
5. Console log has been modified and some important info will be print to log.log in current directory.
6. If file data size which after base64 less than 100 bytes, then program will rsa encrypt the whole file. If file data size which after base64 more than 100 bytes, pragram will slice middle 100 bytes and the left will use bitwise or whose key is sent by outter exe parameter.
7. Program still use single process due to neckbottle is disk i/o instead of cpu calculation.Calculate RSA string is a small part of action and write data to file is bigger,so program will write data in most time.

````About RSA````
1. Key length is 1024 bytes and all keys use 16 binary system，Encryption index E is 10001（hex）which reflects utf8 is 65537，
2. Big integer P is：A696266BF8FA0E85A967156B44E10B4C085477074292BB9E1D6C3ED47E0DA618EA3F6A2630E729EB90A29BD53FC2D20563B292378A6D9A6A46DE409017C30697
3. Big integer Q is：DFADC98B25580C21B0EF040AAB47E76DFA8BF826DA28483155F81D9DFEA458BC539F9A27A4B959E94BFA9AFF110079341A3BCDDF70A46ED3216C7D4B7110D65B
4. modulus N is：  918DE21674D7B5CE8A759BC55985556568F54AAEDFFE275E8945F179C43F276BC4FDEA9FF86F8D14AC7F0A16ED69A8208F2E90E7486C3D66D55DDADFA4E7ED8EDD6BC4B486D43194867EA15BC0245090A8B0F70901B93DB010DA8C11041CFDB98CF1AA1B08D9E74C9930FAE92393E479525A72A027C403CF0D86A26B8A4591AD
5. private key D is：  3E8F450571E2E4F988F953A256FFBFDC7E682F594A5CEA7EEF71688075A0CF48BABA880589BA28612262D7EB52CF7EBBBFCEBBE92C6F995481907D6A726E5CE3CAFA0BADFD252CC5739D580BA680DBAC4E487A9BD2A0922FC07DF3A9A77A8D6383B8F81A6251E036AE8EB4505EEBD9725DD2B584CFF90F415A4B8BC979556DE1
6. Euler function: φ(n) = (P-1)*(Q-1)
7. Last: (E * D) mod φ(n) = 1