import languageConfig from "./languages.js";
import { WORKSPACE_BASE } from "./constants.js";

export function purifyPath (dir) {
    return new Promise(resolve => {
        resolve(dir.replace(/[^a-zA-Z0-9]/g, ""));
    })
}


// TODO: Add settings for java
// TODO: Set python env
export function makeRunFormat (directory, lang) {
    const exe_name = languageConfig[lang].compile.exe_name;
    const run_config = languageConfig[lang].run;
    const seccomp_rule = "--seccomp_rule_name=" + run_config.seccomp_rule;
    const env = "--env=" + run_config.env;
    const max_cpu_time = "--max_cpu_time=" + String(60*1000);
    const max_real_time = "--max_real_time=" + String(60*1000);
    const max_memory = "--max_memory=" + String(256*1024*1024);
    let dir = directory;
    let exe_path = WORKSPACE_BASE + dir + "/" + exe_name;
    if (lang === "py2") {
        return ["--exe_path=/usr/bin/python2", "--args="+exe_path, max_cpu_time, max_real_time, max_memory, seccomp_rule];
    }
    if (lang === "py3") {
        return ["--exe_path=/usr/bin/python3", "--args="+exe_path, max_cpu_time, max_real_time, max_memory, seccomp_rule];
    }
    exe_path = "--exe_path=" + exe_path;

    return [exe_path, max_cpu_time, max_real_time, max_memory, seccomp_rule, env];
}
