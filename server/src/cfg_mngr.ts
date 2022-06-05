import * as fs from "fs";
import * as path from "path";
export let configuration = {
    targetTime: Date.now()+3600000,
    bgUseImage: false,
    bgImage: "",
    bgHorizontal: true,
    bgImageLocal: false,
    bgSolid: "3333ff",
    serverPort: 3002,
    timerColor: "ffffff",
    timerSize: 16,
    endTxt: "END",
    title: "TIMER TITLE",
    titleCol: "fff",
    endCol: "fff",
};

export async function init() {
    return new Promise<any>((resolve,reject) => {
        if(!fs.existsSync(path.join(process.cwd(),'./public'))) {
            console.log(`[INITIALIZATION WARN]: Public folder missing. Creating new directory.`);
            fs.mkdir(path.join(process.cwd(),'./public'), (err) => {
                if(err) console.log(`[INITIALIZATION ERROR] Creating public folder failed with code [${err.code}]. Application can continue but background uploads will fail.`);
                else {
                    console.log(`[INITIALIZATION INFO]: Public folder created successfully, Creating Uploads folder.`);
                    fs.mkdir(path.join(process.cwd(),'./public/uploads'), (err) => {
                        if(err) console.log(`\x1b[33m[INITIALIZATION ERROR] Creating uploads folder failed with code [${err.code}]. Application can continue but background uploads will fail.`);
                        else console.log(`[INITIALIZATION INFO]: Uploads folder created successfully.`);
                    })
                };
            });
        }
        try {
            fs.access('./settings.conf', async (err) => {
                if(err) {
                    console.log(`[INITIALIZATION WARN] Configuration file ${path.join(__dirname,"./settings.conf")} missing. Writing default configurations in place of config file.`);
                    fs.writeFileSync(`./settings.conf`,JSON.stringify(configuration))
                    resolve(configuration);
                    return;
                };
                console.log(`[INITIALIZATION INFO] Configuration file exists. Reading settings from file.`);
                let filecontents: any = {};
                
                try {
                    filecontents = JSON.parse(fs.readFileSync(`./settings.conf`,`utf8`));
                } catch(e) {
                    console.log(`[INITIALIZATION ERROR] Unable to parse JSON from settings config. Overwriting file with default configurations.`);
                    fs.writeFileSync(`./settings.conf`,JSON.stringify(configuration))
                    resolve(configuration);
                    return;
                }

                Object.keys(configuration).forEach(key => {
                    if(filecontents[key] === undefined) {
                        console.log(`[INITIALIZATION INFO] Config file missing ${key}. Using default value: ${(<any> configuration)[key]}`);
                        filecontents[key] = (<any> configuration)[key];
                    } else {
                        (<any> configuration)[key] = filecontents[key];
                    }
                });

                fs.writeFileSync('./settings.conf',JSON.stringify(filecontents));
                console.log(`[INITIALIZATION SUCCESS]: Current Configuraitons\n\n`,configuration,`\n`);
                resolve(configuration);
            })
        } catch(e) {
            console.log(`Failed to access current directory. Settings configuration unreachable.\nExiting at code 5.`)
            reject(e);
        }
    });
};

export async function update(configs: any) {
    Object.keys(configuration).forEach(key => { if(configs[key] !== undefined) { (<any> configuration)[key] = configs[key]; }; });
    fs.writeFileSync(`./settings.conf`,JSON.stringify(configuration));
}