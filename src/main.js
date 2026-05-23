import plugin from "../plugin.json";
import { zipSync } from "fflate";

const fsOperation = acode.require("fsOperation");
const commands = acode.require("commands");
const projects = acode.require("projects");

async function scanProj(projDir, baseUrl) {
    const dataMap = {};
    const files = await projDir.lsDir();
    for (const file of files) {
        if (file.isDirectory) {
            const subDM = await scanProj(file.url, baseUrl);
            Object.assign(dataMap, subDM);
        } else if (file.isFile) {
            const currFs = await fsOperation(file.url);
            const content = await currFs.readFile();
            const relPath = file.url
                .substring(baseDir.length)
                .replace(/^\/+/, "");
            dataMap[relPath] = new Uint8Array(content);
        }
    }
    return dataMap;
}

class LoveLauncher {
    async getAsset(name) {
        const res = await fetch(`${this.baseUrl}assets/${name}`);
        return res;
    }

    async readTemplateFile(name) {
        const res = await this.getAsset(`templates/${name}.lua`);
        return res.text();
    }

    async initTemplate() {
        const getTemplate = async () => {
            return {
                "init.lua": await this.readTemplateFile("init"),
                "conf.lua": await this.readTemplateFile("conf"),
                "main.lua": await this.readTemplateFile("main"),
            };
        };

        const icon = await (await this.getAsset("icon.png"))
            .blob()
            .then((blob) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            });

        projects.set("LÖVE", getTemplate, icon);
    }

    // 打包Love文件
    async packLove(projDir) {
        const stat = await projDir.stat();
        const name = stat.name;
        const base = stat.url;
        
        const baseUrl = base.at(-1) === "/" ? base : base + "/";
        const outPath = `${baseUrl}${name}.love`;
        const dataMap = await scanProj(projDir, baseUrl);
        const blobZip = zipSync(dataMap);
        
        const fsZip = await fsOperation(outPath);
        fsZip.writeFile(blobZip);
        return outPath;
    }

    /* initCommand() {
        commands.addCommand({
            name: "lovelauncher.packlove",
            description: "LÖVE Launcher: Pack current projrct",
            exec: (editor) => {
                
            }
        });
    } */

    initListener() {
        
    }

    async init() {
        this.initTemplate();
        this.initListener();
        this.initCommand();
    }

    async destroy() {}
}

if (window.acode) {
    const thisPlugin = new LoveLauncher();
    acode.setPluginInit(
        plugin.id,
        async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            thisPlugin.baseUrl = baseUrl;
            await thisPlugin.init($page, cacheFile, cacheFileUrl);
        },
    );
    acode.setPluginUnmount(plugin.id, () => {
        thisPlugin.destroy();
    });
}
