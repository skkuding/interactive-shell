const fs = require("fs").promises;
const lang_config = require("./languages");
const constants = require("./constants");
const execSync = require("child_process").execSync;

async function _compile(command) {
    try {
        execSync(command);
        return new Promise(resolve => {resolve(constants.COMPILE_SUCCESS)});
    } catch (err) {
        throw err.stderr.toString();
    }
}

async function compile(dir, lang, code) {
    const _dir = constants.WORKSPACE_BASE + dir;
    const src_path = _dir + "/" + lang_config[lang].compile.src_name;
    const exe_path = _dir + "/" + lang_config[lang].compile.exe_name;
    const compile_command = lang_config[lang].compile.compile_command;
    const command = compile_command.replace("{src_path}", src_path).replace("{exe_path}", exe_path);
    try {
        await fs.mkdir(_dir);
        await fs.writeFile(src_path, code,);
        await _compile(command);
    } catch (err) {
        throw err;
    }
}

module.exports = {compile}
