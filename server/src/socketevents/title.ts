import * as socketio from "socket.io";
import { configuration as configs, update } from "../cfg_mngr";
import { ioserver } from "../apiserver";

export async function title(data: string, socket: socketio.Socket) {
    let currentTime = new Date();
    let timeString = `${currentTime.getHours().toString().padStart(2,'0')}:${currentTime.getMinutes().toString().padStart(2,'0')}:${currentTime.getSeconds().toString().padStart(2,'0')}.${currentTime.getMilliseconds().toString().padEnd(2,'0')}`;
    let args: string[] = data.split(" ");
    switch(args.shift()) {
        case "get":
            socket.emit(`title`, `${configs.titleCol} ${configs.title}`);
            console.log(`\x1b[36m[TITLE QUERY]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
            break;
        case "set":
            args[0] = args[0].replace('#','');
            if(!((args[0].length === 3) || (args[0].length === 4) || (args[0].length === 6) || (args[0].length === 8))) {
                socket.emit(`error`,`Colour option not valid`);
                console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                return;
            }
            let col = args.shift();
            ioserver.emit(`title`,`${col} ${args.join(" ")}`);
            update({ titleCol: col, title: args.join(" ") });
            break;
    }
}