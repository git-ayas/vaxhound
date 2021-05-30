import { useState } from 'react';
import './App.css';
import ChromeController from './Controllers/ChromeController';
import FormControl from './Views/formControl';
import OtherSiteView from './Views/OtherSiteView';
import Instructions from './Views/Instructions'


const thisChrome = new ChromeController();


function App() {

  const [Tab, setTab] = useState({})

  thisChrome.getSelectedTab().then((tabData) => { setTab(tabData) })

  let isCowinPage = false
  let isCowinSearchPage = false

  if (Tab && Tab.url && Tab.url.indexOf("selfregistration.cowin.gov.in") > -1) {
    isCowinPage = true
    if(Tab.url.indexOf("appointment")>-1){
      isCowinSearchPage = true
    }
  }

  


  return (
    <div className="App">
      <header className="App-header">
        {
          isCowinPage ?
            (isCowinSearchPage?<FormControl/>:<Instructions/>) :
            <OtherSiteView />
        }

        {/* <button onClick={logTab}>Log Tab</button> */}
      </header>
    </div>
  );
}

export default App;
