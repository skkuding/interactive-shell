const fs = require("fs");
const express = require("express");
const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:8080",
        credentials: true
    }
});
const pty = require("node-pty");
const jsonParser = require('body-parser').json();
const expSession = require("express-session");
const ioSession = require("express-socket.io-session");
const rateLimit = require("rate-limiter-flexible");

const logging = require('./winston');
const morgan = require('morgan');
const combined = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : combined;
// morgan 출력 형태 server.env에서 NODE_ENV 설정 production : 배포 dev : 개발

const compiler = require("./compiler");
const cleanUp = require("./file_manager").cleanUp;
const { purifyPath, makeRunFormat, checkLanguage }  = require("./formatter");
const BASE_DIR = require("./constants").WORKSPACE_BASE;

let server_logger = new logging("server")
let compile_logger = new logging("compile")
let run_logger = new logging("run")

const socketLimiter = new rateLimit.RateLimiterMemory({
    points: 20, // Limit each sessionID to 20 requests
    duration: 60, // For 1 minute
});
const compileLimiter = new rateLimit.RateLimiterMemory({
    points: 20, // Limit each sessionID to 20 requests
    duration: 60, // For 1 minute
});
const session = expSession({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true
});

// TODO: redirect errors to log file
app.use(require('cors')({
    origin: "http://localhost:8080",
    credentials: true
}));
app.use(jsonParser);
app.use(session);

app.use( morgan(morganFormat, {stream : server_logger.stream}) );

app.post("/compile", async (req, res) => {
    const dir = Math.random().toString(36).substr(2,11);
    const lang = req.body.lang;
    const code = req.body.code;

    try {
        await compileLimiter.consume(req.sessionID);
        console.log("compile success" + req.sessionID + "\n");
    } catch (err) {
        console.log("too many request"+req.sessionID+"\n");
        return res.status(429).send("Too many requests");
    }

    try {
        await compiler.compile(dir, lang, code);
        res.send({"status": 1, "output": dir});
    } catch (err) {
        try {
            await cleanUp(dir);
        } catch (cleanupErr) {
            compile_logger.error(cleanupErr);
        }
        compile_logger.error(err);

        res.send({"status": 0, "output": err});
    }
})

//TODO: handshake, Run 분리
io.use(ioSession(session, {autoSave: true}))
io.on("connection", async(socket) => {
    var dir = socket.handshake.query['token'];
    var lang = socket.handshake.query['lang'];
    var sid = socket.handshake.sessionID;

    //Check Rate Limit socket connection request
    try {
        await socketLimiter.consume(sid);
    } catch (err) {
        socket.emit('stdout', "too many request");
        try {
            await cleanUp(dir);
        } catch (err) {
            console.log(err);
        } finally {
            socket.emit("exited");
            socket.disconnect();
        }
    }

    try {
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
                        run_logger.error(err);
                    } finally {
                        socket.emit("exited");
                        socket.disconnect();
                    }
                }
            });
        }
    } catch (err) {
        run_logger.error(err);
        socket.disconnect();
    }
});

server.listen(3000, () => {
    console.log("Server opened");
    server_logger.info("Server Start Listening on port 3000");
});
