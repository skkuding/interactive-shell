const fs = require("fs");
const BASE_DIR = require("./constants").WORKSPACE_BASE;

async function cleanUp(dir) {
    var _dir = BASE_DIR + dir
    try {
        if(fs.existsSync(_dir)){
            await fs.promises.rm(_dir, { recursive: true, force: true });
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports = {cleanUp}