import ChromeController from "./ChromeController";
enum errors {
    AUTHENTICATION = "Unauthenticated access!"

}
export default class CowinController {
    token: string | undefined = "";
    chromeController: ChromeController;

    constructor() {
        this.chromeController = new ChromeController()
        this.getCowinRequestToken().then((token) => { this.token = token })
        this.getCowinRequestToken = this.getCowinRequestToken.bind(this)
    }

    setToken(token: string) {
        this.token = token

    }

    async fetch(district_id = 294) {

        await this.chromeController.runScriptInSelectedTab(`localStorage.removeItem("cowin_search_chrome_data","")`)
        const currentDate = new Date();
        const formattedDate = `${(currentDate.getDate() + 1)
            .toString()
            .padStart(2, "0")}-${(currentDate.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${currentDate.getFullYear()}`;


        let script = `  
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            localStorage.setItem("cowin_search_chrome_data",this.responseText)
            console.log("xhrout",this)
           
        });
    
        xhr.open("GET", "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${district_id}&date=${formattedDate}");
        xhr.setRequestHeader("accept", "application/json, text/plain, */*");
        xhr.setRequestHeader("accept-language", "en-US,en;q=0.9");
        xhr.setRequestHeader("Authorization", "Bearer ${this.token}");
        xhr.send();
        `
        await this.chromeController.runScriptInSelectedTab(script)
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 100)

        })

        let fromPageLocalStore = (await this.chromeController.runScriptInSelectedTab(`localStorage['cowin_search_chrome_data']`))
        fromPageLocalStore = fromPageLocalStore[0][0]
        if (fromPageLocalStore === errors.AUTHENTICATION) {
            throw new Error(errors.AUTHENTICATION);

        } else {
            return fromPageLocalStore !== "" ? JSON.parse(fromPageLocalStore) : null
        }

    }

    async getCowinRequestToken() {
        const chromeController = this.chromeController
        try {
            // Execute script in the current tab 
            let fromPageSessionStore = await chromeController.runScriptInSelectedTab(`sessionStorage['userToken']`)

            return (fromPageSessionStore[0][0].replaceAll("\"", ""))
        }
        catch (err) {
            console.log(err)
        }
    }
    fillPincode(pincode: number) {
        let scriptStr = `var pincode_input = Array.from(document.getElementsByTagName("input")).find((input) => { if (input.attributes["formcontrolname"] && input.attributes["formcontrolname"].value === "pincode") { return true } return false });`
        scriptStr += `pincode_input.value = ${pincode}`
        return this.chromeController.runScriptInSelectedTab(scriptStr)

    }

    logout() {
        console.warn("LogoutCalled!!!!")
        return this.chromeController.runScriptInSelectedTab(`var LogOutBtn=Array.from(document.getElementsByTagName("li")).find((entry)=>entry.innerText === "Logout");LogOutBtn.click()`)
    }


}