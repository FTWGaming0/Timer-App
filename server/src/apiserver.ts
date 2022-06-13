import { update, configuration as configs, persist_data, yaml_update } from "./cfg_mngr";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import * as socketio from "socket.io";
import * as http from "http";
import * as path from "path";
import * as fs from "fs";
const fileUpload = require("express-fileupload");

const apiserver = express();
export const httpserver = http.createServer(apiserver);

apiserver.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));
apiserver.use(cors({
    origin: "*"
}));
apiserver.use(fileUpload());
apiserver.use(express.static(path.join(__dirname,'../public')));
apiserver.use(express.static(path.join(process.cwd(),'./public')));

apiserver.post('/upload', async (req: any, res: any) => {
    if(req.files) {
        let file = req.files.File;
        if(!fs.existsSync(path.join(process.cwd(),'./public/uploads'))) {
            console.log(`\x1b[33m[API WARN]\x1b[0m: Uploads folder doesn't exists. Creating new directory.`);
            fs.mkdir(path.join(process.cwd(),'./public/uploads'), (err) => {
                if(err) console.log(`\x1b[31m[API ERROR]\x1b[0m: There was a problem creating Uploads directory. If this problem persists, try making one yourself or check permissions.`);
                else console.log(`\x1b[36m[API SERVER]\x1b[0m: Created Uploads directory.`);
            })
        }
        fs.access(path.join(process.cwd(),`./public/uploads/${file.name}`), (err) => {
            let pastimgs: string[] = persist_data.pastimgs;
            if(err) {
                console.log(`\x1b[32m[API UPLOAD]\x1b[0m: \x1b[36m${file.name}\x1b[0m \x1b[33m${file.size}\x1b[0m`);
                if(file.size > 1073741824) { console.log(`Rejecting File Download : File Size Too Large.`); return; }
                fs.writeFile(path.join(process.cwd(),`./public/uploads/${file.name}`),file.data,() => {
                    console.log(`\x1b[32mFile Upload Complete.\x1b[0m`);
                    update({ bgImage: file.name, bgImageLocal: true, bgUseImage: true });
                    ioserver.emit(`background`,`true true ${configs.bgHorizontal} ${file.name}`);
                    console.log(`Background set to downloaded file.`);
                    res.write(`File Upload Complete`);
                    pastimgs.push(file.name);
                    yaml_update({ pastimgs: pastimgs });
                    res.end();
                });
                return;
            }
            console.log(`Rejecting File Download : File of same name already exists.`);
            if(pastimgs.indexOf(file.name,0) !== -1) {
                pastimgs.splice(pastimgs.indexOf(file.name),1);
                pastimgs.push(file.name);
            } else {
                pastimgs.push(file.name);
            }
            yaml_update({ pastimgs: pastimgs });
            ioserver.emit(`background`,`true true ${configs.bgHorizontal} ${file.name}`);
            console.log(`Background set to local file.`);
            update({ bgImage: file.name, bgImageLocal: true, bgUseImage: true });
            res.write(`File already exists in server directory with requested file name.`); 
            res.end(); 
            return;
        });
        return;
    }
    res.write(`Upload did not contain files.`);
    res.end();
});

export const ioserver = new socketio.Server(httpserver, { cors: { origin: "*" } });

ioserver.on(`connection`,(socket)=>{
    let currentTime = new Date();
    let timeString: string = `${currentTime.getHours().toString().padStart(2,'0')}:${currentTime.getMinutes().toString().padStart(2,'0')}:${currentTime.getSeconds().toString().padStart(2,'0')}.${currentTime.getMilliseconds().toString().padEnd(2,'0')}`;
    console.log(`\x1b[1m\x1b[32m[SOCKET CONNECT]\x1b[0m: New Connection from \x1b[33m${socket.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
    socket.on(`updatetimer`, (data: string) => { require("./socketevents/updatetimer").updatetimer(data, socket); });
    socket.on(`ping`, () => { socket.emit(`ping`,Date.now()); });
    socket.on(`background`, (data) => { require('./socketevents/background').background(data, socket); });
    socket.on(`debug`, (data) => { require(`./socketevents/debug`).debug(data); })
    socket.on(`updatedisp`, (data) => { require('./socketevents/updatedisp').updatedisp(data, socket); });
    socket.on(`title`, (data) => { require('./socketevents/title').title(data, socket) });
    socket.on(`disconnect`,() => {
        currentTime = new Date();
        timeString = `${currentTime.getHours().toString().padStart(2,'0')}:${currentTime.getMinutes().toString().padStart(2,'0')}:${currentTime.getSeconds().toString().padStart(2,'0')}.${currentTime.getMilliseconds().toString().padEnd(2,'0')}`;
        console.log(`\x1b[1m\x1b[31m[SOCKET DISCONNECT]\x1b[0m: Disconnection from \x1b[33m${socket.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
    });
});

export async function start() {
    return new Promise<boolean>(async (resolve,reject) => {
        try {
            httpserver.listen(configs.serverPort, () => {
                console.log(`[API Server] Online.`);
                resolve(true);
            });
        } catch(e) {
            console.log(`[API Server] Failed to start.`);
            reject(e);
        }
    })
}