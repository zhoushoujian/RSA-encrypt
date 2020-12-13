# RSA-encrypt

仓库地址: ```https://github.com/zhoushoujian/RSA-encrypt```

加密自己的文件时一定要备份好原文件,否则调试失误,文件很可能解密不回来

## 介绍

1. 使用base64 + RSA + 异或来加密文件

2. 这个程序可以用来加密指定文件夹内的文件,支持加密的文件类型见encrypt.js里的```fileExtnames```

3. 因为nodejs不支持直接读取大于500MB的文件,所以大于500MB的文件会被忽略

4. 假如有相同文件名,不同文件类型的文件存在同一个文件目录下,程序会自动在文件末尾加上Same作为标记,否则会导致文件被覆盖而丢失

5. 假如文件大小小于100字节,则直接使用RSA加密,否则使用RSA加密文件中间的100个字节,两边的使用异或来加密,文件后缀名会被RSA加密并保存到加密Buffer的头部

6. 程序使用单线程执行,因为读写文件是i/o密集型的操作,nodejs很擅长这个

7. encrypt.js提供加密功能,decrypt提供解密功能,但为了保险,如果是加密自己的文件,一定要记得先备份,以免解密不回来

## 关于RSA

1. 密钥的长度是1024位,并且所有的密钥都使用16位二进制系统,加密的index E是1001,映射到utf8就是65537

2. 大质数 P 是：A696266BF8FA0E85A967156B44E10B4C085477074292BB9E1D6C3ED47E0DA618EA3F6A2630E729EB90A29BD53FC2D20563B292378A6D9A6A46DE409017C30697

3. 大质数 Q 是: DFADC98B25580C21B0EF040AAB47E76DFA8BF826DA28483155F81D9DFEA458BC539F9A27A4B959E94BFA9AFF110079341A3BCDDF70A46ED3216C7D4B7110D65B

4. 模数 N 是: 918DE21674D7B5CE8A759BC55985556568F54AAEDFFE275E8945F179C43F276BC4FDEA9FF86F8D14AC7F0A16ED69A8208F2E90E7486C3D66D55DDADFA4E7ED8EDD6BC4B486D43194867EA15BC0245090A8B0F70901B93DB010DA8C11041CFDB98CF1AA1B08D9E74C9930FAE92393E479525A72A027C403CF0D86A26B8A4591AD

5. 私钥 D 是: 3E8F450571E2E4F988F953A256FFBFDC7E682F594A5CEA7EEF71688075A0CF48BABA880589BA28612262D7EB52CF7EBBBFCEBBE92C6F995481907D6A726E5CE3CAFA0BADFD252CC5739D580BA680DBAC4E487A9BD2A0922FC07DF3A9A77A8D6383B8F81A6251E036AE8EB4505EEBD9725DD2B584CFF90F415A4B8BC979556DE1

6. 欧拉公式: φ(n) = (P-1)*(Q-1)

7. 最后: (E * D) mod φ(n) = 1

8. RSA的科普文章: http://www.ruanyifeng.com/blog/2013/06/rsa_algorithm_part_one.html
