import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { Fragment, useMemo, useState, useEffect, useRef } from "react";
import "./App.css";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { getMultipleGoogleApiLatLng, getMultipleHereApiLatLng } from './services/routeApiService'
import { jsonToCsv, exportFile } from "./services/exportService";

import DynamicInput from './components/DynamicInput'
import RouteTable from "./components/RouteTable";
import DynamicSwitchToggle from "./components/DynamicSwitchToggle";

// Main component for visualization
// Program flow: User input -> DynamicInput component -> callback function processDynamicInput() in App called -> setAllGoogleLatLng() -> useEffect activated from allGoogleLatLng changing -> addRoute()
const App = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  });

  const [map, setMap] = useState( /** @type google.maps.Map */  (null))
  const center = useMemo(() => ({ lat: 13.8032, lng: 100.6146 }), []);

  // Store LatLng 
  const [allGoogleLatLng, setAllGoogleLatLng] = useState(null)
  const [allHereLatLng, setAllHereLatLng] = useState(null)
  // Store other inputted info for visualization
  const [generalSetting, setGeneralSetting] = useState(null)
  // allLatLng in a format that can be displayed by RouteTable
  const [tableData, setTableData] = useState([])
  const [csvData, setCsvData] = useState(null)
  // Keep how many routes has been inputted, including ones with NO ROUTE FOUND. Used for DynamicSwitchToggle
  const [totalRouteInput, setTotalRouteInput] = useState(0)

  // Prevent update on first render
  const firstUpdate = useRef(true); 

  // Call every time allGoogleLatLng is updated, AKA everytime user submit DynamicInput latlngs for route calculation
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    addRoute() 
  }, [allGoogleLatLng]); // TODO: here version also exist

  const [drawnPolylines, setDrawnPolylines] = useState([])
  const [drawnMarkers, setDrawnMarkers] = useState([])

  // Props function. Passed into DynamicInput component for callback. Handle submitted result from DynamicInput component
  async function processDynamicInput(formFields, generalSetting) {

    // Compute route from Google Route API
    const googleRouteResponse = await getMultipleGoogleApiLatLng({
      latLng: formFields,
      travelMode: 'DRIVE',
    })
    // Compute route from HERE API
    const hereRouteResponse = await getMultipleHereApiLatLng({
      latLng: formFields,
      travelMode: 'car',
    })

    // Update useState variables. The attached useEffect also means addRoute() will be called next, for visualization
    setAllGoogleLatLng(googleRouteResponse)
    setAllHereLatLng(hereRouteResponse)
    setGeneralSetting(generalSetting[0])
  }

  // Props function. Passed into DynamicInput component for callback. Validate all latLng given by DynamicInput
  function validateAllLatLngInput(inputLatLng) {
    for (let i=0 ; i<inputLatLng.length ; i++) {
      if (!validateLatitude(inputLatLng[i].originLat) ||
          !validateLongtitude(inputLatLng[i].originLng) ||
          !validateLatitude(inputLatLng[i].destinationLat) ||
          !validateLongtitude(inputLatLng[i].destinationLng)) 
        return false
    }
    return true
  }
  // Validate one specific latitude value
  function validateLatitude(inputValue) {
    let value = parseFloat(inputValue.trim())
    if(isNaN(value) || value < -90 || value > 90){
      return false
    }
    return true
  }
  // Validate one specific longtitude value
  function validateLongtitude(inputValue) {
    let value = parseFloat(inputValue.trim())
    if(isNaN(value) || value < -180 || value > 180){
      return false
    }
    return true
  }


  // Visualize the computed route and display data for the table
  function addRoute() {
    if (allGoogleLatLng == null) return

    const newTableData = []

    for (let i=0 ; i<allGoogleLatLng.length ; i++) { 

      let originLat = allGoogleLatLng[i].latLng[0].lat
      let originLng = allGoogleLatLng[i].latLng[0].lng
      let destinationLat = allGoogleLatLng[i].latLng[1].lat
      let destinationLng = allGoogleLatLng[i].latLng[1].lng

      const rowData = {
        id: allGoogleLatLng[i].id, // id, origin & destination latlng are taken from allGoogleLatLng, but it'll be the same in allHereLatLng
        originLat: originLat,
        originLng: originLng,
        destinationLat: destinationLat,
        destinationLng: destinationLng,
        googleDuration: "ROUTE NOT FOUND",
        hereDuration: "ROUTE NOT FOUND",
        googleDistance: "ROUTE NOT FOUND",
        hereDistance: "ROUTE NOT FOUND",
        departureTime: allGoogleLatLng[i].departureTime,
        googleArrivalTime: "ROUTE NOT FOUND",
        hereArrivalTime: "ROUTE NOT FOUND",
        originTableDisplay: originLat + " , " + originLng,
        destinationTableDisplay: destinationLat + " , " + destinationLng,
      }

      // If Google Route API found a route, update rowData
      if (allGoogleLatLng[i].routeExists) {
        rowData.googleDuration = allGoogleLatLng[i].duration.toFixed(2)
        rowData.googleDistance = allGoogleLatLng[i].distance.toFixed(2)
        rowData.googleArrivalTime = allGoogleLatLng[i].arrivalTime

        let originLatLng = allGoogleLatLng[i].latLng[0]
        let destinationLatLng = allGoogleLatLng[i].latLng[allGoogleLatLng[i].latLng.length-1]

        // Visualize on map
        addMarker(originLatLng, map, allGoogleLatLng[i].id.toString())
        addMarker(destinationLatLng, map, allGoogleLatLng[i].id.toString())
        addPolyline(allGoogleLatLng[i].id.toString(), allGoogleLatLng[i].latLng, map, generalSetting.googlePolylineColor)
      }

      // If HERE Route API found a route, update rowData
      if (allHereLatLng[i].routeExists) {
        rowData.hereDuration = allHereLatLng[i].duration.toFixed(2)
        rowData.hereDistance = allHereLatLng[i].distance.toFixed(2)
        rowData.hereArrivalTime = allHereLatLng[i].arrivalTime
        
        let originLatLng = allHereLatLng[i].latLng[0]
        let destinationLatLng = allHereLatLng[i].latLng[allHereLatLng[i].latLng.length-1]

        // Visualize on map
        addMarker(originLatLng, map, allHereLatLng[i].id.toString())
        addMarker(destinationLatLng, map, allHereLatLng[i].id.toString())
        addPolyline(allHereLatLng[i].id.toString(), allHereLatLng[i].latLng, map, generalSetting.herePolylineColor)
      }

      // Create new row in tableData, the row representing a latLng query
      newTableData.push(rowData)
    }

    // Set Table data and CSV data
    setTableData(newTableData)
    setCsvData(jsonToCsv(newTableData))

    // Set number of toggle switches
    setTotalRouteInput(allGoogleLatLng.length)
  }




  // Adds a polyline to the map.
  function addPolyline(id, latLng, map, color) {
    // Create and set polyline
    let polyline = new window.google.maps.Polyline({
      path: latLng,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 5
    });
    polyline.setMap(map);
    // Keep in this format to also keep track of id
    let ele = {
      id: id,
      polyline: polyline,
      isVisible: true
    }
    setDrawnPolylines(drawn => [...drawn, ele]);
  }
  // Adds a marker to the map.
  function addMarker(location, map, label) {
    // Create and set marker
    let marker = new window.google.maps.Marker({
      position: location,
      label: label,
      map: map,
    });
    marker.setMap(map);
    // Keep in this format to also keep track of id
    let ele = {
      id: label,
      marker: marker,
      isVisible: true
    }
    setDrawnMarkers(drawn => [...drawn, ele]);
  }



  // Clear all stored and drawn routes
  function clearRouteVisuals() {
    setTotalRouteInput(0)
    clearPolylines()
    clearMarkers()
  }  
  function clearPolylines() {
    for (let i = 0; i < drawnPolylines.length; i++) {
      drawnPolylines[i].polyline.setMap(null);
      // .setVisible(false)
    }
    setDrawnPolylines([]);
  }   
  function clearMarkers() {
    for (let i = 0; i < drawnMarkers.length; i++) {
      drawnMarkers[i].marker.setMap(null);
    }
    setDrawnMarkers([]);
  } 

  // For a given route of ID toSwitchId, hide if its showing, and show if its hiding
  function switchRouteVisibility(toSwitchId) {
    for (let i = 0; i < drawnPolylines.length; i++) {
      if (drawnPolylines[i].id === toSwitchId.toString()) {
        let switchTo = !drawnPolylines[i].isVisible
        drawnPolylines[i].isVisible = switchTo
        drawnPolylines[i].polyline.setVisible(switchTo)
      }
    }
    for (let i = 0; i < drawnMarkers.length; i++) {
      if (drawnMarkers[i].id === toSwitchId.toString()) {
        let switchTo = !drawnMarkers[i].isVisible
        drawnMarkers[i].isVisible = switchTo
        drawnMarkers[i].marker.setVisible(switchTo)
      }
    }
  }

  // Show all routes
  function showAllRouteVisuals() {
    for (let i = 0; i < drawnPolylines.length; i++) {
      drawnPolylines[i].polyline.setVisible(true);
    }
    for (let i = 0; i < drawnMarkers.length; i++) {
      drawnMarkers[i].marker.setVisible(true);
    }
  } 


  


  return (
    <div className="App">
      {!isLoaded ? (
        <h1>Loading...</h1>
      ) : (
        <Fragment>
          <Box component="span" sx={{ p: 2, border: '1px dashed grey' }}>
            <Button onClick={() => map.panTo(center)}>
              Center
            </Button>

            <Button onClick={clearRouteVisuals}>
              Clear
            </Button>

            <Button onClick={showAllRouteVisuals}>
              Show All
            </Button>
          </Box>

          <div class="horizontal-flexbox-container">
              <DynamicInput 
                processDynamicInput={processDynamicInput} 
                validateAllLatLngInput={validateAllLatLngInput}
              />
              <DynamicSwitchToggle
                switchRouteVisibility={switchRouteVisibility} 
                totalRouteInput={totalRouteInput}
              />
          </div>
          <br />

          <GoogleMap
            mapContainerClassName="map-container"
            center={center}
            zoom={13}
            onLoad={map => setMap(map)}
          >
          </GoogleMap>
          <p>Powered by Google, 2023 Google</p>

          <button onClick={() => {exportFile(csvData, "route-api-result", "csv")}}>Download CSV</button>
          <RouteTable data={tableData} />

        </Fragment>
      )}
    </div>
  );
};

export default App;

// https://medium.com/scalereal/integration-of-google-maps-with-react-part-1-86c075ab452a

// Routes preferred: available only to few companies?
// https://developers.google.com/maps/documentation/routes_preferred
