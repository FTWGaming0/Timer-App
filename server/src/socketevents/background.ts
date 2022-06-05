import * as socket from "socket.io";
import { configuration as configs, update } from "../cfg_mngr";
import { ioserver } from "../apiserver";
export async function background(data: any, socket: socket.Socket) {
    let currentTime = new Date();
    let timeString = `${currentTime.getHours().toString().padStart(2,'0')}:${currentTime.getMinutes().toString().padStart(2,'0')}:${currentTime.getSeconds().toString().padStart(2,'0')}.${currentTime.getMilliseconds().toString().padEnd(2,'0')}`;
    let args: string[] = data.toString().toLowerCase().split(" ");
    switch(args[0]) {
        case "get":
            socket.emit(`background`,`${configs.bgUseImage}${(configs.bgUseImage)?(" "+configs.bgImageLocal):("")}${(configs.bgUseImage)?(" "+configs.bgHorizontal):("")} ${(configs.bgUseImage)?(configs.bgImage):(configs.bgSolid)}`);
            socket.emit(`bgHU`,configs.bgHorizontal);
            console.log(`\x1b[36m[BACKGROUND QUERY]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
            break;
        case "set":
            switch(args[1]) {
                case "bgi":
                    if(args.length < 4) {
                        socket.emit(`error`,`Not enough arguments for background set.`);
                        console.log(`\x1b[31m[BACKGROUND SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                        return;
                    }
                    let _BGUI: boolean = false;
                    let _BGO2: string = "";
                    try {
                        _BGUI = (args[2] == "true");
                        _BGO2 = String(args[3]);
                    } catch(e) {
                        socket.emit(`error`,`Could not cast to boolean and string types with given parameters.`);
                        console.log(`\x1b[31m[BACKGROUND SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                        return;
                    }
                    if(_BGUI == true) {
                        console.log(`\x1b[32m[BACKGROUND SET SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                        ioserver.emit(`background`,`${_BGUI} false ${configs.bgHorizontal} ${_BGO2}`);
                        update({ bgUseImage: true, bgImage: _BGO2, bgImageLocal: false });
                    } else {
                        console.log(`\x1b[32m[BACKGROUND SET SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                        ioserver.emit(`background`,`${_BGUI} #${_BGO2}`);
                        update({ bgUseImage: false, bgSolid: `#${_BGO2}`, bgImageLocal: false });
                    }
                    break;
                case "bgh":
                    if(args.length < 3) {
                        socket.emit(`error`,`Not enough arguments for background set.`);
                        console.log(`\x1b[31m[BACKGROUND-HORIZONTAL FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                        return;
                    }
                    let _BGH: boolean = (args[2] == "true");
                    console.log(`\x1b[32m[BACKGROUND-HORIZONTAL SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:","")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                    update({ bgHorizontal: _BGH });
                    ioserver.emit(`bgHU`,_BGH);
                    break;
            }
            break;
    }
}