import { hereRouteApiRequest, googleRouteApiRequest } from './axiosService'
import { decodeHerePolyline } from '../decoders/HerePolylineDecoder'
import { decodeGooglePolyline } from '../decoders/GooglePolylineDecoder'
import dayjs from 'dayjs';

// Wrapper functions to process the calculated route API results. It take input, pass to axiosService, receive and organize the result, then return the result
const getMultipleGoogleApiLatLng = async (params) => {
    const allResponseInfo = []

    for (let i=0 ; i<params.latLng.length ; i++) {

        // Call axios API
        const response = await googleRouteApiRequest({
            travelMode: 'DRIVE', 
            origin: {lat: params.latLng[i].originLat, lng: params.latLng[i].originLng},
            destination: {lat: params.latLng[i].destinationLat, lng: params.latLng[i].destinationLng},
            departureTime: params.latLng[i].departureTime.toString()
        })
        if (Object.keys(response.data).length === 0) {
            console.log("No route found for GOOGLE " + i)
            allResponseInfo.push({
                id: params.latLng[i].id, // Can use i instead of carrying over params.latLng[i].id
                latLng: [{lat: params.latLng[i].originLat, lng: params.latLng[i].originLng},{lat: params.latLng[i].destinationLat, lng: params.latLng[i].destinationLng}], // input latlng, for table display
                distance: null,
                duration: null,
                routeExists: false,
                departureTime: null,
                arrivalTime: null,
            })
            continue;
        }

        // // For Debug
        // console.log("Google API axios response")
        // console.log(response)

        // Decode polyline and format into { lat: val, lng: val }
        const decoded = decodeGooglePolyline(response.data.routes[0].polyline.encodedPolyline)
        const arr = []
        for (let j=0 ; j<decoded.length ; j++) {
            arr.push({ lat: decoded[j][0], lng: decoded[j][1] })
        }
        allResponseInfo.push({
            id: params.latLng[i].id, 
            latLng: arr,
            distance: response.data.routes[0].distanceMeters / 1000,
            duration: Number(response.data.routes[0].duration.slice(0,-1)) / 60,
            routeExists: true,
            departureTime: dayjs(params.latLng[i].departureTime).format('YYYY-MM-DDTHH:mm:ssZ'), // Format departureTime to include timezone
            arrivalTime: dayjs(params.latLng[i].departureTime).add(Number(response.data.routes[0].duration.slice(0,-1)), 'second').format('YYYY-MM-DDTHH:mm:ssZ'), // Look complicated, but basically Google Route API doesn't provide arrival time, so we need to calculate it manually using departureTime + duration. Most of the code is for formatting to allow dayjs to calculate the new time and formatting the final result to include timezone  
        })

        // // For Debug
        // console.log("GOOGLE ROUTE " + i)
        // console.log(JSON.stringify(response.data.routes[0].distanceMeters / 1000) + ' km')
        // console.log(JSON.stringify(Number(response.data.routes[0].duration.slice(0,-1)) / 60 + ' mins'))
    }
    // console.log(allResponseInfo)
    return allResponseInfo
    
}

const getMultipleHereApiLatLng = async (params) => {
    const allResponseInfo = []

    for (let i=0 ; i<params.latLng.length ; i++) {

        // Call axios API
        const response = await hereRouteApiRequest({
            transportMode: params.travelMode, 
            origin: {lat: params.latLng[i].originLat, lng: params.latLng[i].originLng},
            destination: {lat: params.latLng[i].destinationLat, lng: params.latLng[i].destinationLng},
            departureTime: params.latLng[i].departureTime.toString(),
            return: 'polyline,summary',
        })
        if (Object.keys(response.data.routes).length === 0) {
            console.log("No route found for HERE " + i)
            allResponseInfo.push({
                id: params.latLng[i].id, // Can use i instead of carrying over params.latLng[i].id
                latLng: [{lat: params.latLng[i].originLat, lng: params.latLng[i].originLng},{lat: params.latLng[i].destinationLat, lng: params.latLng[i].destinationLng}], // input latlng, for table display
                distance: null,
                duration: null,
                routeExists: false,
                departureTime: null,
                arrivalTime: null,
            })
            continue;
        }

        // // For Debug
        // console.log("Here API axios response")
        // console.log(response)

        // Decode polyline and format into { lat: val, lng: val }
        const decoded = decodeHerePolyline(response.data.routes[0].sections[0].polyline).polyline

        const arr = []
        for (let j=0 ; j<decoded.length ; j++) {
            arr.push({ lat: decoded[j][0], lng: decoded[j][1] })
        }
        allResponseInfo.push({
            id: params.latLng[i].id, // Can use i instead of carrying over params.latLng[i].id
            latLng: arr,
            distance: response.data.routes[0].sections[0].summary.length / 1000,
            duration: Number(response.data.routes[0].sections[0].summary.duration) / 60,
            routeExists: true,
            departureTime: response.data.routes[0].sections[0].departure.time,
            arrivalTime: response.data.routes[0].sections[0].arrival.time,
        })

        // // For Debug
        // console.log("HERE ROUTE " + i)
        // console.log(JSON.stringify(response.data.routes[0].sections[0].summary.length / 1000) + ' km')
        // console.log(JSON.stringify(Number(response.data.routes[0].sections[0].summary.duration) / 60 + ' mins'))
    }
    // console.log(allResponseInfo)
    return allResponseInfo
    
}


export { getMultipleGoogleApiLatLng, getMultipleHereApiLatLng }


// Prototype versions of the above that process only one route

// const getGoogleApiLatLng = async (params) => {
//     try {
//         const response = await googleRouteApiRequest(params)
//         const encodedPolyline = response.data.routes[0].polyline.encodedPolyline
    
//         console.log("GOOGLE ROUTE")
//         console.log(JSON.stringify(response.data.routes[0].distanceMeters / 1000) + ' km')
//         console.log(JSON.stringify(Number(response.data.routes[0].duration.slice(0,-1)) / 60 + ' mins'))
    
//         const decoded = decodeGooglePolyline(encodedPolyline);
    
//         const arr = []
//         for (let i=0 ; i<decoded.length ; i++) {
//             arr.push({ lat: decoded[i][0], lng: decoded[i][1] })
//         }
    
//         return {
//             latLng: arr,
//             distance: response.data.routes[0].distanceMeters / 1000,
//             duration: Number(response.data.routes[0].duration.slice(0,-1)) / 60
//         }
//     }
//     catch (err) {
//         console.log(err.response)
//     }
// }

// const getHereApiLatLng = async (params) => {
//     try {
//         const response = await hereRouteApiRequest(params)

//         console.log(response)
//         const encodedPolyline = response.data.routes[0].sections[0].polyline
    
//         console.log("HERE API") 
//         console.log(JSON.stringify(response.data.routes[0].sections[0].summary.length / 1000) + ' km')
//         console.log(JSON.stringify(response.data.routes[0].sections[0].summary.duration / 60) + ' mins')
        
//         const decoded = decodeHerePolyline(encodedPolyline).polyline
    
//         const arr = []
//         for (let i=0 ; i<decoded.length ; i++) {
//             arr.push({ lat: decoded[i][0], lng: decoded[i][1] })
//         }
//         return {
//             latLng: arr,
//             distance: response.data.routes[0].sections[0].summary.length / 1000,
//             duration: response.data.routes[0].sections[0].summary.duration / 60
//         }
//     }
//     catch (err) {
//         console.log(err.response)
//     }
// }








