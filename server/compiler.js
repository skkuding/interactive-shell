import { promises as fs } from "fs";
import { systemLogger } from './logger.js';
import { execSync } from "child_process";
import { WORKSPACE_BASE, COMPILE_FAIL, COMPILE_SUCCESS } from "./constants.js";
import lang_config from "./languages.js";

async function compile(command) {
    try {
        execSync(command);
    } catch (err) {
        throw err.stderr.toString();
    }
}

async function compiler(directory, lang, code) {
    const dir = WORKSPACE_BASE + directory;
    const src_path = dir + "/" + lang_config[lang].compile.src_name;
    const exe_path = dir + "/" + lang_config[lang].compile.exe_name;
    const compile_command = lang_config[lang].compile.compile_command;
    const command = compile_command.replace("{src_path}", src_path).replace("{exe_path}", exe_path);
    let result = {'status': COMPILE_FAIL, 'err': ''}

    try {
        await fs.mkdir(dir);
        await fs.writeFile(src_path, code);
    } catch (err) {
        systemLogger.error(err.name + ": " + err.message);
        result.err = "server error"
        return result;
    }

    try {
        await compile(command);
        result.status = COMPILE_SUCCESS;
    } catch (err) {
        result.err = err;
    }

    return result;
}

export default compiler
