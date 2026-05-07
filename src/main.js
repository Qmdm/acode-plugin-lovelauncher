import plugin from "../plugin.json";
const projects = acode.require("projects");

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

    packLove() {
        
    }

    async init() {
        this.initTemplate();
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
