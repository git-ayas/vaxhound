export interface chromeTab {
    active?: boolean,
    audible?: boolean,
    autoDiscardable?: boolean,
    discarded?: boolean,
    groupId?: number,
    height?: number,
    highlighted?: boolean,
    id: number,
    incognito?: boolean,
    index?: number,
    mutedInfo?: { muted: boolean },
    pinned?: boolean,
    selected?: boolean,
    status?: string,
    title?: string,
    url?: string,
    width?: number,
    windowId?: number

}

export default class ChromeController {
    private chrome
    constructor() {
        this.chrome = (window as any).chrome
    }
    getSelectedTab(): Promise<chromeTab> {
        return new Promise((resolve, reject) => {
            this.chrome.tabs.getSelected(null, function (tab: chromeTab) {
                resolve(tab)
            })
        })

    }
    runTabScript(tabId: number, script: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.chrome.tabs.executeScript(tabId, { code: `${script}` }, (...info: any) => resolve(info))
        })
    }
    async runScriptInSelectedTab(script: string) {
        const tab = await this.getSelectedTab()
        return this.runTabScript(tab.id, script)

    }
    
}