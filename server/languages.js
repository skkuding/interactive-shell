var default_env = ["LANG=en_US.UTF-8", "LANGUAGE=en_US:en", "LC_ALL=en_US.UTF-8"]
module.exports = {
    "c" : {
        "compile": {
            "src_name": "main.c",
            "exe_name": "main",
            "compile_command": "/usr/bin/gcc -DONLINE_JUDGE -O2 -w -fmax-errors=3 -std=c99 {src_path} -lm -o {exe_path}",
        },
        "run": {
            "command": "{exe_path}",
            "seccomp_rule": "c_cpp",
            "env": default_env
        }
    },
    "cpp" : {
        "compile": {
            "src_name": "main.cpp",
            "exe_name": "main",
            "compile_command": "/usr/bin/g++ -DONLINE_JUDGE -O2 -w -fmax-errors=3 -std=c++11 {src_path} -lm -o {exe_path}",
        },
        "run": {
            "command": "{exe_path}",
            "seccomp_rule": "c_cpp",
            "env": default_env
        }
    },
    "java" : {
        "compile": {
            "src_name": "Main.java",
            "exe_name": "Main",
            "compile_command": "/usr/bin/javac {src_path} -d {exe_dir} -encoding UTF8"
        },
        "run": {
            "command": "/usr/bin/java -cp {exe_dir} -XX:MaxRAM={max_memory}k -Djava.security.manager -Dfile.encoding=UTF-8 -Djava.security.policy==/etc/java_policy -Djava.awt.headless=true Main",
            "seccomp_rule": null,
            "env": default_env,
            "memory_limit_check_only": 1
        }
    },
    "py2" : {
        "compile": {
            "src_name": "solution.py",
            "exe_name": "solution.pyc",
            "compile_command": "/usr/bin/python -m py_compile {src_path}",
        },
        "run": {
            "command": "/usr/bin/python {exe_path}",
            "seccomp_rule": "general",
            "env": default_env
        }
    },
    "py3" : {
        "compile": {
            "src_name": "solution.py",
            "exe_name": "__pycache__/solution.cpython-36.pyc",
            "compile_command": "/usr/bin/python3 -m py_compile {src_path}",
        },
        "run": {
            "command": "/usr/bin/python3 {exe_path}",
            "seccomp_rule": "general",
            "env": ["PYTHONIOENCODING=UTF-8"].concat(default_env)
        }
    },
    "go" : {
        "compile": {
            "src_name": "main.go",
            "exe_name": "main",
            "compile_command": "/usr/bin/go build -o {exe_path} {src_path}",
            "env": ["GOCACHE=/tmp"]
        },
        "run": {
            "command": "{exe_path}",
            "seccomp_rule": "",
            "env": ["GODEBUG=madvdontneed=1", "GOCACHE=off"].concat(default_env),
            "memory_limit_check_only": 1
        }
    }
}