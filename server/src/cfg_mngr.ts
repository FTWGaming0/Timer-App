import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";
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
export let persist_data = {
    pastimgs: new Array<string>(),
}

export async function init() {
    return new Promise<any>(async (resolve,reject) => {
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
                    console.log(`[INITIALIZATION WARN] Configuration file ${path.join(process.cwd(),"./settings.conf")} missing. Writing default configurations in place of config file.`);
                    fs.writeFileSync(`./settings.conf`,JSON.stringify(configuration));
                    return;
                };

                console.log(`[INITIALIZATION INFO] Configuration file exists. Reading settings from file.`);
                let filecontents: any = {};
                
                try {
                    filecontents = JSON.parse(fs.readFileSync(`./settings.conf`,`utf8`));
                } catch(e) {
                    console.log(`[INITIALIZATION ERROR] Unable to parse JSON from settings config. Overwriting file with default configurations.`);
                    fs.writeFileSync(`./settings.conf`,JSON.stringify(configuration));
                    return;
                }

                Object.keys(configuration).forEach(key => {
                    if(filecontents[key] === undefined) {
                        console.log(`[INITIALIZATION INFO]: Config file missing ${key}. Using default value: ${(<any> configuration)[key]}`);
                        filecontents[key] = (<any> configuration)[key];
                    } else {
                        (<any> configuration)[key] = filecontents[key];
                    }
                });

                fs.writeFileSync('./settings.conf',JSON.stringify(filecontents));
                console.log(`[INITIALIZATION SUCCESS]: Settings file loaded successfully.`);
            });
        } catch(e) {
            console.log(`Failed to access current directory. Settings configuration unreachable.\nExiting at code 5.`)
            process.exit(5);
        }

        try {
            fs.access('./persist_data.yml', async (err) => {
                if(err) {
                    console.log(`[INITIALIZATION WARN] Data Persistence file ${path.join(process.cwd(),"./persist_data.yml")} missing. Writing default configurations.`);
                    fs.writeFileSync(`./persist_data.yml`,YAML.stringify(persist_data));
                    return;
                };

                console.log(`[INITIALIZATION INFO] Persistence file exists. Reading data from file.`);
                let ymlcontents: any = {};
                
                try {
                    ymlcontents = YAML.parse(fs.readFileSync(`./persist_data.yml`,`utf8`));
                } catch(e) {
                    console.log(`[INITIALIZATION ERROR] Unable to parse YAML from persistence file. Overwriting file with default configurations.`);
                    fs.writeFileSync(`./persist_data.yml`,YAML.stringify(persist_data));
                    return;
                }

                Object.keys(persist_data).forEach(key => {
                    if(ymlcontents[key] === undefined) {
                        console.log(`[INITIALIZATION INFO]: Config file missing ${key}. Using default value: ${(<any> persist_data)[key]}`);
                        ymlcontents[key] = (<any> persist_data)[key];
                    } else {
                        (<any> persist_data)[key] = ymlcontents[key];
                    };
                });

                pruneimgs();

                fs.writeFileSync('./persist_data.yml',YAML.stringify(persist_data));
                console.log(`[INITIALIZATION SUCCESS]: Loaded persist_data.yml file.\n`);
            })
        } catch(e) {
            console.log(`Failed to access persistence file. Assuming unreachable.\nExiting at code 5.`)
            process.exit(5);
        }

        resolve(configuration);
    });
};

export async function update(configs: any) {
    Object.keys(configuration).forEach(key => { if(configs[key] !== undefined) { (<any> configuration)[key] = configs[key]; }; });
    fs.writeFileSync(`./settings.conf`,JSON.stringify(configuration),`utf8`);
}

export async function yaml_update(newvars: any) {
    // Update persist_data with new data only if persist_data already contains key.
    Object.keys(persist_data).forEach(key => { if(newvars[key] !== undefined) {(<any> persist_data)[key] = newvars[key];}; });
    // Shift past image array until length <= 5 if length > 5
    pruneimgs();
    fs.writeFileSync(`persist_data.yml`,YAML.stringify(persist_data),`utf8`);
}

function pruneimgs() {
    if(persist_data.pastimgs.length > 5) { for(let i = 0; i < persist_data.pastimgs.length-5; i++) { let targetname = persist_data.pastimgs[i]; fs.unlinkSync(`./public/uploads/${targetname}`); console.log(`Deleting ${targetname} from public/uploads folder`); }; };
    for(let i = 0; i < 5; i++) { persist_data.pastimgs.unshift(<string> persist_data.pastimgs.shift()) };
    let lastfive = []; for(let i = 0; i < Math.min(5,persist_data.pastimgs.length); i++) { let targetimg = persist_data.pastimgs[persist_data.pastimgs.length-5+i]; if(targetimg !== null) lastfive.push(targetimg); };
    persist_data.pastimgs = lastfive;
}