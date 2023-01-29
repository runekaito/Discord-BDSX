const https = require("https");
const fs = require("fs");
const crypto = require("crypto");
exports.download = (uri, filename) => {
    return new Promise((resolve, reject) => {
        //SHA-256ハッシュ値で無駄なダウンロードを防止
        //try-catchでファイルが存在しない場合を検知
        try {
            const target = fs.readFileSync(filename);
            const sha256 = crypto.createHash("sha256");
            sha256.update(target);
            const dig = sha256.digest("hex");
            if (dig === "0dd4b623041704918ab97c85e096aa37d14f64db82f54364a7064c7184691545") {
                return resolve();
            }
        } catch (e) {
            //pass
        }
        https
            .request(uri, (res) => {
                res
                    .pipe(fs.createWriteStream(filename))
                    .on("close", resolve)
                    .on("error", reject);
            })
            .end()
    });
};