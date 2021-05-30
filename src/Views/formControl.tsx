import { useState } from 'react';
import DistrictsCollection from '../Collections/Districts'
import CowinController from '../Controllers/CowinController';

enum Dosage { dose1 = 1, dose2 = 2 }
enum AgeGroup { Below45 = 18, Above45 = 45 }

const CowinControl = new CowinController();
let probe: any
function play_alert() {
  (document.getElementById('audiotag1')as HTMLAudioElement)?.play();
}

function FormControl() {
  let states
  states = DistrictsCollection.map((district) => district.state_name)
  const selectState = (selected_state_name: string, return_collection: boolean = false) => {
    const selectedStateDistricts = DistrictsCollection.find((stateDistricts) => stateDistricts.state_name === selected_state_name)
    const outPutCollection = selectedStateDistricts ? selectedStateDistricts.state_districts.districts : null
    if (return_collection) {
      return outPutCollection
    }
    setDistricts(outPutCollection)

  }
  const [Districts, setDistricts] = useState(selectState("Karnataka", true));
  const [SelectedDistrict, setSelectedDistrict] = useState(294);
  const [Dose, setDose] = useState(1 as Dosage)
  const [AgeGrp, setAgeGrp] = useState(AgeGroup.Below45)
  const [Polling, setPolling] = useState(false)
  const [ProbeStart, setProbeStart] = useState(0)
  const [ReceivedResults, setReceivedResults] = useState([] as Array<any>);
  const stateOptions = states.map((state_name) => (
    <option value={state_name}>{state_name}</option>
  ))
  const districtOptions = (districtsList: Array<{
    district_id: number;
    district_name: string;
  }>) => (
    districtsList && districtsList.map ? districtsList.map((district) => (<option value={district.district_id}>{district.district_name}</option>)) : null
  )

  const logTab = () => {

    if (SelectedDistrict !== 0 && ProbeStart === 0) {
      setProbeStart(Date.now())
      probe = setInterval(() => {
        CowinControl.fetch(SelectedDistrict).then(checkData).catch((e) => {
          console.log("[Request Error]:", e, e.message)
          TimeoutApp()
        })
      }, 1000)
      setPolling(true)

    }

  }
  const checkData = (data: { centers: Array<any> }) => {
    if (data !== null && data.centers) {
      console.log("Centers:", data.centers)
      const { centers } = data
      const filteredCenters = centers.filter((center) => {
        let allowedCenter = false
        const { sessions } = center
        const hasDosageSessions = sessions.filter(
          (session: any) => Dose === Dosage.dose1 ?
            session.available_capacity_dose1 > 0
            : session.available_capacity_dose2 > 0
        )
        if (hasDosageSessions.length > 0) {
          const hasAgeSessions = hasDosageSessions.filter((session: any) => session.min_age_limit === AgeGrp)
          if (hasAgeSessions.length > 0) {
            allowedCenter = true
          }
        }
        return allowedCenter
      })
      console.log("Filtered centers:", filteredCenters)
      if (filteredCenters.length > 0) {
        console.log("___________FOUND RESULT________________")
        setReceivedResults(filteredCenters as Array<any>)
        play_alert()
        CowinControl.fillPincode(filteredCenters[0].pincode)
        exitProbe()
      }

    }
    else {
      console.log("From fetch:", data)

    }

  }
  const TimeOutIn = () => (240000 - (Date.now() - ProbeStart))
  const TimeoutApp = () => {
    exitProbe()
    CowinControl.logout().then(() => window.close())
  }
  const exitProbe = () => {
    clearInterval(probe)
    setPolling(false)
    setProbeStart(0)
  }
  if (ProbeStart > 0 && TimeOutIn() < 1) {
    console.log("Timing Out", ProbeStart, TimeOutIn())
    TimeoutApp()
  }
  const receivedList = ReceivedResults.map((center: any) => (
    <li>
      <button onClick={(e) => { e.preventDefault(); CowinControl.fillPincode(center.pincode) }}>Select Pincode</button>|{center.name} | {center.pincode} | {center.vaccine_fees.map((listing: { vaccine: string, fee: number }) => `[${listing.vaccine}: ₹${listing.fee}]`)} |
    </li>
  ))
  return (
    <form>
      {
        receivedList && receivedList.length > 0 ?
          <div className="results_area">
            <h1>Found Results</h1>
            <ul>
              {receivedList}
            </ul>
          </div>
          : "Results will populate here"
      }
      <audio id="audiotag1" src="audio/alert.mp3" preload="auto"></audio>
      <div>
        <label htmlFor="states">State</label>
        <select defaultValue="Karnataka" onChange={(eventsData) => { setSelectedDistrict(0); setDistricts(null); const { target } = eventsData; selectState(target.value) }} name="states" id="states">
          {stateOptions}
        </select>
        {Districts && Districts !== null ? (
          <select value={SelectedDistrict} onChange={(eventsData) => { setSelectedDistrict(parseInt(eventsData.target.value)) }} name="districts_list" id="">
            {districtOptions(Districts)}
          </select>
        ) : ""}
      </div>
      <p>Selected district ID: {SelectedDistrict}</p>
      <div>
        <span className="search_filter">
          <label htmlFor="dose">Dose</label>
          <select value={Dose} onChange={(eventsData) => { const value = eventsData.target.value; setDose(parseInt(value)) }} name="dose" id="dose">
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </span>
        <span className="search_filter">
          <label htmlFor="age_grp">Age Group</label>
          <select name="age_grp" value={AgeGrp} onChange={(eventsData) => { const value = eventsData.target.value; setAgeGrp(parseInt(value)) }} id="age_grp">
            <option value="18">18+</option>
            <option value="45">45+</option>
          </select>
        </span>
      </div>

      <div>
        {
          Polling ?
            `[Running Search]: ${(new Date(TimeOutIn())).toISOString().substr(14, 5)} to timeout.`
            : <button onClick={(e) => {
              e.preventDefault();
              logTab()
            }}>
              Search
            </button>
        }
        <button onClick={(e) => { e.preventDefault(); CowinControl.logout() }}>Logout</button>
      </div>
      {/* {<div><button onClick={(e) => { e.preventDefault(); checkData(SampleData) }}>Test</button></div>} */}
    </form>
  )


}
const SampleData = {
  centers: [
    {
      address: "CAMP BELL ROAD VIVEK NAGAR",
      block_name: "East",
      center_id: 569425,
      district_name: "BBMP",
      fee_type: "Paid",
      from: "10:00:00",
      lat: 12,
      long: 77,
      name: "ST PHILOMENA HOSPITAL BLOCK 1",
      pincode: 560047,
      sessions: [
        {
          available_capacity: 0,
          available_capacity_dose1: 1,
          available_capacity_dose2: 0,
          date: "30-05-2021",
          min_age_limit: 18,
          session_id: "1d8458d3-26df-4d08-b614-67da6bcd64b0",
          slots: ["10:00AM-11:00AM", "11:00AM-12:00PM", "12:00PM-01:00PM", "01:00PM-03:00PM"],
          vaccine: "COVISHIELD"
        }
      ],
      state_name: "Karnataka",
      to: "15:00:00",
      vaccine_fees: [{
        fee: "1000",
        vaccine: "COVISHIELD"
      }]
    }
  ]
}
export default FormControl