import { useState } from 'react';
import dayjs from 'dayjs';

// Generating latLng input for users to input data. Once it is submitted, it pass the array of inputs into props callback function
function DynamicInput(props) {

  // Keep latLng input; one for each route
  const [formFields, setFormFields] = useState([
    { 
      id: '',
      originLat: '', 
      originLng: '',
      destinationLat: '', 
      destinationLng: '',
      departureTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    },
  ])
  // Keep input that apply to all input latLng
  const [generalSetting, setGeneralSetting] = useState([
    { 
      googlePolylineColor: '#245bff', // default color
      herePolylineColor: '#DB1FD4', // default color
      travelMode: '',
    },
  ])

  // Handle change, for formFields
  const handleFormChange = (event, index) => {
    let data = [...formFields];
    data[index][event.target.name] = event.target.value;
    setFormFields(data);
  }

  // Specially used for departureTime, to keep format integrity
  const handleFormDateChange = (event, index) => {
    let data = [...formFields];
    data[index][event.target.name] = dayjs(event.target.value).format('YYYY-MM-DDTHH:mm:ss')
    setFormFields(data);
  }

  // Handle change, for generalSetting
  const handleGeneralSettingChange = (event, index) => {
    let data = [...generalSetting];
    data[index][event.target.name] = event.target.value;
    setGeneralSetting(data);
  }

  // Handle submitting input. Use callback function to validate input and 
  const submit = async (e) => {
    e.preventDefault();
    console.log(formFields)
    if (!props.validateAllLatLngInput(formFields)) {
      alert("Invalid LatLng Input") 
    }
    else { 
      props.processDynamicInput(formFields, generalSetting) 
    }
  }

  const addFields = () => {
    let object = {
      id: '',
      originLat: '', 
      originLng: '',
      destinationLat: '', 
      destinationLng: '',
      departureTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    }
    setFormFields([...formFields, object])
  }

  const removeFields = (index) => {
    let data = [...formFields];
    data.splice(index, 1)
    setFormFields(data)
  }

  return (
    <div className="DynamicInput">
      <form onSubmit={submit}>
        {generalSetting.map((setting, index) => {
          return (
            <div key={index}>
              <label for="googlePolylineColor">Google Linecolor: </label>
              <input
                id="googlePolylineColor"
                type="color"
                name='googlePolylineColor'
                placeholder='Color'
                onChange={event => handleGeneralSettingChange(event, index)}
                value={setting.googlePolylineColor}
                required
              />
              <br></br>
              <br />
              <label for="herePolylineColor">HERE Linecolor: </label>
              <input
                id="herePolylineColor"
                type="color"
                name='herePolylineColor'
                placeholder='Color'
                onChange={event => handleGeneralSettingChange(event, index)}
                value={setting.herePolylineColor}
                required
              />
              <br /> <br />
            </div>
          )
        })}
        {formFields.map((form, index) => {
          form.id = index
          return (
            <div key={index}>
              <p>{'.  [  ' + index + '  ]'}</p>
              <input
                name='originLat'
                placeholder='Origin Latitude'
                onChange={event => handleFormChange(event, index)}
                value={form.originLat}
                required
                min="-128" 
                max="75"
              />
              <input
                name='originLng'
                placeholder='Origin Longtitude'
                onChange={event => handleFormChange(event, index)}
                value={form.originLng}
                required
                min="-128" 
                max="75"
              />
              <br />
              <input
                name='destinationLat'
                placeholder='Destination Latitude'
                onChange={event => handleFormChange(event, index)}
                value={form.destinationLat}
                required
                min="-128" 
                max="75"
              />
              <input
                name='destinationLng'
                placeholder='Destination Longtitude'
                onChange={event => handleFormChange(event, index)}
                value={form.destinationLng}
                required
                min="-128" 
                max="75"
              />
              <input
                type="datetime-local"
                name='departureTime'
                placeholder='Departure Time'
                onChange={event => handleFormDateChange(event, index)}
                value={form.departureTime}
                // min="" // Minimum time now
              />
              <br />
              <button onClick={() => removeFields(index)}>Remove</button>
              <br /> <br />
            </div>
          )
        })}
      </form>
      <button onClick={addFields}>Add More..</button>
      <br />
      <button onClick={submit}>Submit</button>
    </div>
  );
}

export default DynamicInput;













// import { useState } from 'react';
// import { getMultipleGoogleApiLatLng } from '../services/routeApiService'
// import dayjs from 'dayjs';

// function DynamicInput(props) {
//   const [formFields, setFormFields] = useState([
//     { 
//       id: '',
//       originLat: '', 
//       originLng: '',
//       destinationLat: '', 
//       destinationLng: '',
//       departureTime: '',
//       color:'',
//     },
//   ])

//   const handleFormChange = (event, index) => {
//     let data = [...formFields];
//     data[index][event.target.name] = event.target.value;
//     setFormFields(data);
//   }

//   const submit = async (e) => {
//     e.preventDefault();

//     console.log(formFields)

//     formFields.map((ele) => {
//       if (ele.departureTime === '') {
//         ele.departureTime = dayjs().format('YYYY-MM-DDTHH:mm:ss')
//       }
//     });
//     const response = await getMultipleGoogleApiLatLng({
//       latLng: formFields,
//       travelMode: 'DRIVE',
//     })
//     props.setAllLatLng(response)

//     // console.log(response)

//     // Do HERE API too
//   }

//   const addFields = () => {
//     let object = {
//       id: '',
//       originLat: '', 
//       originLng: '',
//       destinationLat: '', 
//       destinationLng: '',
//       departureTime: '',
//       color:'',
//     }
//     setFormFields([...formFields, object])
//   }

//   const removeFields = (index) => {
//     let data = [...formFields];
//     data.splice(index, 1)
//     setFormFields(data)
//   }

//   return (
//     <div className="DynamicInput">
//       <form onSubmit={submit}>
//         {formFields.map((form, index) => {
//           form.id = index
//           return (
//             <div key={index}>
//               <p>{index}</p>
//               <input
//                 name='originLat'
//                 placeholder='Origin Latitude'
//                 onChange={event => handleFormChange(event, index)}
//                 value={form.originLat}
//                 required
//               />
//               <input
//                 name='originLng'
//                 placeholder='Origin Longtitude'
//                 onChange={event => handleFormChange(event, index)}
//                 value={form.originLng}
//                 required
//               />
//               <input
//                 type="color"
//                 name='color'
//                 placeholder='Color'
//                 onChange={event => handleFormChange(event, index)}
//                 value={form.color}
//                 required
//               />
//               <br />
//               <input
//                 name='destinationLat'
//                 placeholder='Destination Latitude'
//                 onChange={event => handleFormChange(event, index)}
//                 value={form.destinationLat}
//                 required
//               />
//               <input
//                 name='destinationLng'
//                 placeholder='Destination Longtitude'
//                 onChange={event => handleFormChange(event, index)}
//                 value={form.destinationLng}
//                 required
//               />
//               <input
//                 type="datetime-local"
//                 name='departureTime'
//                 placeholder='Departure Time'
//                 onChange={event => handleFormChange(event, index)}
//                 value={form.departureTime}
//                 // min="" // Minimum time now
//               />
//               <br />
//               <button onClick={() => removeFields(index)}>Remove</button>
//               <br /> <br />
//             </div>
//           )
//         })}
//       </form>
//       <button onClick={addFields}>Add More..</button>
//       <br />
//       <button onClick={submit}>Submit</button>
//     </div>
//   );
// }

// export default DynamicInput;