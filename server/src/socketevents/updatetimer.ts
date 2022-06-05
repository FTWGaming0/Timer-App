import * as socket from "socket.io";
import { ioserver } from "../apiserver";
import { configuration as configs, update } from "../cfg_mngr";
export async function updatetimer(data: any, socket: socket.Socket) {
    let currentTime = new Date();
    let timeString = `${currentTime.getHours().toString().padStart(2,'0')}:${currentTime.getMinutes().toString().padStart(2,'0')}:${currentTime.getSeconds().toString().padStart(2,'0')}.${currentTime.getMilliseconds().toString().padEnd(2,'0')}`;
    let args: string[] = data.split(" ");
    switch(args[0]) {
        default:
            socket.emit(`error`,`Unknown Command`);
            console.log(`\x1b[31m[COMMAND UNKNOWN]\x1b[0m: IP: \x1b[33m${socket.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
            break;
        case "query":
            socket.emit(`timer`,`${configs.targetTime} ${Date.now()}`);
            console.log(`\x1b[36m[TIMER QUERY]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
            break;
        case "set":
            let setTime: number = 0;
            try {
                setTime = Number(args[1]);
            } catch(e) {
                console.log(`\x1b[31m[TIMER SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                break;
            }
            let targetTime = setTime;
            console.log(`\x1b[36m[TIMER SET SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m TIME: \x1b[36m${new Date(targetTime)}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
            update({ targetTime: setTime });
            ioserver.emit(`timer`,`${targetTime} ${Date.now()}`);
            break;
    };
}