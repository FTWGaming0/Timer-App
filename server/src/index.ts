import * as os from "os";
import { init, configuration as configs } from './cfg_mngr';
import {start as expressStart} from './apiserver';
const open = require("open");

async function run() {
    // console.log(`[DEBUG]: Current Working Directory: ${process.cwd()}`);
    // console.log(`[DEBUG]: Directory Name: ${__dirname}`);
    // console.log(`[DEBUG]: Execution Path: ${process.execPath}`);
    
    console.log(`[MAIN_SCRIPT] Initializing configs.`);
    try { await init(); }
    catch(e) { process.exit(5); }

    console.log(`[MAIN_SCRIPT] Starting API Server.`);
    try { await expressStart(); }
    catch(e) { process.exit(5); }

    let nets: any = os.networkInterfaces();
    let results = Object.create(null);

    if(nets !== undefined) {
        for(const name of Object.keys(nets)) {
            for(const net of nets[name]) {
                if(net.family === 'IPv4' && !net.internal) {
                    if(!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
    }

    let localips = "";
    let localamt = 0;

    Object.keys(results).forEach((netinterface: string) => {
        results[netinterface].forEach((localip: any) => {
            localamt += 1;
            localips += `\x1b[0m\n- \x1b[32mhttp://${localip}:${configs.serverPort}\x1b[0m`;
        });
    });

    if (localamt === 1) {
        console.log(`\n\x1b[36mApplication is now being hosted at \x1b[32mhttp://${results[Object.keys(results)[0]][0]}:${configs.serverPort}\x1b[0m\n`);
    } else if(localamt > 1) {
        console.log(`\n\x1b[33mThis computer has multiple Local IP addresses attributed to it.\n\x1b[36mApplication is now being hosted at port \x1b[32m3002\n\x1b[36m on the following addresses.${localips}\n`);
    } else {
        console.log(`\n\x1b[36mApplication is being hosted at port \x1b[32m${configs.serverPort}\x1b[0m,\x1b[33m but the Local IP of this machine could not be determined.\x1b[0m\n`);
    }

    //open(`http://localhost:${configs.serverPort}`);
}

run();