const fs = require("fs");
const BASE_DIR = require("./constants").WORKSPACE_BASE;

async function cleanUp(dir) {
    var _dir = BASE_DIR + dir
    try {
        await fs.promises.rm(_dir, { recursive: true, force: true });
    } catch (err) {
        throw err;
    }
}

module.exports = {cleanUp}