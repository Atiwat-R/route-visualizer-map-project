import axios from "axios";


// Use axios to make REST API request to Google Route API & HERE API
const hereRouteApiRequest = async (params) => {
    return await axios({
        method: 'get',
        url: `https://router.hereapi.com/v8/routes?transportMode=${params.transportMode}&origin=${params.origin.lat},${params.origin.lng}&destination=${params.destination.lat},${params.destination.lng}&return=${params.return}&departureTime=${params.departureTime}&apikey=${process.env.REACT_APP_HERE_API_KEY}`,
    })
}

const googleRouteApiRequest = async (params) => {
    return await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          'origin': {
            'location': {
              'latLng': {
                'latitude': params.origin.lat, 
                'longitude': params.origin.lng
              }
            }
          },
          'destination': {
            'location': {
              'latLng': {
                'latitude': params.destination.lat,
                'longitude': params.destination.lng
              }
            }
          },
          'travelMode': params.travelMode,
          'routingPreference': 'TRAFFIC_AWARE_OPTIMAL',
          "extraComputations": ["TRAFFIC_ON_POLYLINE"],
          'departureTime': params.departureTime.toString() + 'Z', // + 'Z' is needed to create the Zulu time format Google Route API accepts
          'computeAlternativeRoutes': false,
          'routeModifiers': {
            'avoidTolls': false,
            'avoidHighways': false,
            'avoidFerries': false
          },
          'languageCode': 'en-US',
          'units': 'METRIC'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.REACT_APP_GOOGLE_API_KEY,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory,routes.legs.travelAdvisory'
          }
        }
      );
}



export { hereRouteApiRequest, googleRouteApiRequest } 