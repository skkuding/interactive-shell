const lang_config = require("./languages");
const WORKSPACE_BASE = require("./constants").WORKSPACE_BASE;

async function purifyPath (dir) {
    return new Promise(resolve => {
        resolve(dir.replace(/[^a-zA-Z0-9]/g, ""))
    })
}

async function checkLanguage (lang) {
    return new Promise(resolve => {
        resolve(["c", "cpp", "py2", "py3"].includes(lang));
    })
}

// TODO: Add limits
// TODO: Add settings for java
// TODO: Set python env
function makeRunFormat (dir, lang) {
    var _dir = dir;
    const exe_name = lang_config[lang].compile.exe_name;
    const run_config = lang_config[lang].run;
    const seccomp_rule = "--seccomp_rule_name=" + run_config.seccomp_rule;
    const env = "--env=" + run_config.env;
    const max_cpu_time = "--max_cpu_time=" + String(60*1000)
    const max_real_time = "--max_real_time=" + String(60*1000)
    const max_memory = "--max_memory=" + String(256*1024*1024)
    var exe_path = WORKSPACE_BASE + _dir + "/" + exe_name;
    if (lang === "py2") {
        return ["--exe_path=/usr/bin/python2", "--args="+exe_path, max_cpu_time, max_real_time, max_memory, seccomp_rule];
    }
    if (lang === "py3") {
        return ["--exe_path=/usr/bin/python3", "--args="+exe_path, max_cpu_time, max_real_time, max_memory, seccomp_rule];
    }
    exe_path = "--exe_path=" + exe_path;

    return [exe_path, max_cpu_time, max_real_time, max_memory, seccomp_rule, env];
}
module.exports = {purifyPath, checkLanguage, makeRunFormat}