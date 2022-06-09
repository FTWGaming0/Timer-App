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
    pastimgs: new Array<string>()
}

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
                    console.log(`[INITIALIZATION WARN] Configuration file ${path.join(process.cwd(),"./settings.conf")} missing. Writing default configurations in place of config file.`);
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
                        console.log(`[INITIALIZATION INFO]: Config file missing ${key}. Using default value: ${(<any> configuration)[key]}`);
                        filecontents[key] = (<any> configuration)[key];
                    } else {
                        (<any> configuration)[key] = filecontents[key];
                    }
                });

                fs.writeFileSync('./settings.conf',JSON.stringify(filecontents));
                console.log(`[INITIALIZATION SUCCESS]: Current Configuraitons\n\n`,configuration,`\n`);
            })
        } catch(e) {
            console.log(`Failed to access current directory. Settings configuration unreachable.\nExiting at code 5.`)
            process.exit(5);
        }

        try {
            fs.access(`persist_data.yml`, async (err) => {
                if(err) {
                    fs.writeFileSync(`persist_data.yml`,YAML.stringify(``),`utf8`);
                    console.log(`File doesn't exist. Creating blank YAML document.`);
                    return;
                } else {
                    let ymlcontent: any;
                    try {
                        ymlcontent = YAML.parse(fs.readFileSync(`persist_data.yml`,`utf8`));
                        console.log(`[INITIALIZATION SUCCESS]: YAML Parse Success.`);
                    } catch(e) {
                        console.log(`[INITIALIZATION ERROR]: Failed to parse YAML from persist_data.yml. Overwriting with blank YAML document.`);
                        fs.writeFileSync(`persist_data.yml`,YAML.stringify(``),`utf8`);
                        return;
                    }
                    console.log(ymlcontent);
                    Object.keys(persist_data).forEach(key => { if(ymlcontent[key] === undefined) { console.log(`Persist_Data is missing key ${key}. Writing default of `,(<any> persist_data)[key]); } else { (<any> persist_data)[key] == ymlcontent[key]; console.log((<any> persist_data)[key]) } });
                    fs.writeFileSync(`persist_data.yml`,YAML.stringify(persist_data),`utf8`);
                }
            })
        } catch(e) {
            console.log(`Could not access persist_data.yml file. Exiting at code 5.`);
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
    let temp: { pastimgs: string[] } = persist_data;
    Object.keys(persist_data).forEach(key => { if(newvars[key] !== undefined) {(<any> temp)[key] = newvars[key];}; });
    // Shift past image array until length <= 5 if length > 5
    if(temp.pastimgs.length > 5) { for(let i = 0; i > temp.pastimgs.length-5; i++) { temp.pastimgs.shift(); }; };
    persist_data = temp;
    fs.writeFileSync(`persist_data.yml`,YAML.stringify(persist_data),`utf8`);
}