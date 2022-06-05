import * as socket from "socket.io";
import { update, configuration as configs } from "../cfg_mngr";
import { ioserver } from "../apiserver";

export async function updatedisp(data: any, socket: socket.Socket) {
    let currentTime = new Date();
    let timeString = `${currentTime.getHours().toString().padStart(2,'0')}:${currentTime.getMinutes().toString().padStart(2,'0')}:${currentTime.getSeconds().toString().padStart(2,'0')}.${currentTime.getMilliseconds().toString().padEnd(2,'0')}`;
    let args: string[] = data.toString().split(" ");
    switch(args.shift()) {
        case "query":
            socket.emit(`display`,`${configs.timerColor} ${configs.timerSize} ${configs.endCol} ${configs.endTxt}`);
            console.log(`\x1b[36m[DISPLAY QUERY]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
            break;
        case "set":
            if(args.length < 3) {
                socket.emit(`error`,`Not enough arguments (Requires 3)`);
                console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                return;
            }
            try {
                Number(args[1])
            } catch(e) {
                socket.emit(`error`,`Couldn't convert ${args[1]} to Number`);
                console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                return;
            }
            args[0] = args[0].replace('#','');
            if(!((args[0].length === 3) || (args[0].length === 4) || (args[0].length === 6) || (args[0].length === 8))) {
                socket.emit(`error`,`Colour option not valid`);
                console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                return;
            }
            args[2] = args[2].replace('#','');
            if(!((args[2].length === 3) || (args[2].length === 4) || (args[2].length === 6) || (args[2].length === 8))) {
                socket.emit(`error`,`Colour option not valid`);
                console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                return;
            }
            console.log(`\x1b[32m[BACKGROUND SET SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
            let colr = args.shift();
            let size = Number(args.shift());
            let ecol = args.shift();
            let etxt = args.join(" ");
            update({
                timerColor: colr,
                timerSize: size,
                endCol: ecol,
                endTxt: etxt
            });
            ioserver.emit(`display`,`${colr} ${size} ${ecol} ${etxt}`);
            break;
    }
}