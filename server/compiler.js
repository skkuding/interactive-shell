import { promises as fs } from "fs";
import { systemLogger } from "./logger.js";
import { execSync } from "child_process";
import { WORKSPACE_BASE, COMPILE_FAIL, COMPILE_SUCCESS } from "./constants.js";
import languageConfig from "./languages.js";

async function compile(command) {
    try {
        execSync(command);
    } catch (err) {
        throw err.stderr.toString();
    }
}

async function compiler(directory, lang, code) {
    const dir = WORKSPACE_BASE + directory;
    const src_path = dir + "/" + languageConfig[lang].compile.src_name;
    const exe_path = dir + "/" + languageConfig[lang].compile.exe_name;
    const compile_command = languageConfig[lang].compile.compile_command;
    const command = compile_command.replace("{src_path}", src_path).replace("{exe_path}", exe_path);
    const result = {"status": COMPILE_FAIL, "error": "", "token": ""}

    try {
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(src_path, code);
    } catch (err) {
        systemLogger.error(err);
        result.err = "server error"
        return result;
    }

    try {
        await compile(command);
        result.status = COMPILE_SUCCESS;
        result.token = directory;
    } catch (err) {
        result.err = err;
    }

    return result;
}

export default compiler;
