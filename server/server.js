const fs = require("fs");
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});
const pty = require("node-pty");
const jsonParser = require('body-parser').json();

const compiler = require("./compiler");
const cleanUp = require("./file_manager").cleanUp;
const { purifyPath, makeRunFormat, checkLanguage }  = require("./formatter");
const BASE_DIR = require("./constants").WORKSPACE_BASE;

// TODO: redirect errors to log file
app.use(require('cors')());
app.use(jsonParser);

app.post("/compile", async (req, res) => {
    const dir = Math.random().toString(36).substr(2,11);
    const lang = req.body.lang;
    const code = req.body.code;
    try {
        await compiler.compile(dir, lang, code);
        res.send({"status": 1, "output": dir});
    } catch (err) {
        try {
            await cleanUp(dir);
        } catch (cleanupErr) {
            console.log(cleanupErr);
        }
        console.log(err);
        res.send({"status": 0, "output": err});
    }
})

//TODO: handshake, Run 분리
io.on("connection", async(socket) => {
    try {
        var dir = socket.handshake.query['token'];
        var lang = socket.handshake.query['lang'];
        await purifyPath(dir).then((value) => { dir = value; })
        await checkLanguage(lang).then((value) => { if(!value) throw new Error("Unsupported language"); })

        if(!fs.existsSync(BASE_DIR + dir)) {
            socket.disconnect(); 
        } else {
            const shell = pty.spawn("/usr/lib/judger/libjudger.so", makeRunFormat(dir, lang));
            shell.on('data', (data) => {
                console.log("%s", data);
                socket.emit("stdout", data);
            });
            socket.on("stdin", (input) => {
                console.log("%s", input);
                shell.write(input + "\n");
            });
            shell.on("exit", async(code) => {
                console.log("child process exited with code " + code);
                console.log(dir);
                if(dir) {
                    try {
                        await cleanUp(dir);
                    } catch (err) {
                        console.log(err);
                    } finally {
                        socket.emit("exited");
                        socket.disconnect();
                    }
                }
            });
        }
    } catch (err) {
        console.log(err);
        socket.disconnect();
    }
});

server.listen(3000, () => {
    console.log("Server opened");
});