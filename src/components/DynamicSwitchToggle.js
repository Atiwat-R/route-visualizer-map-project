import { useCallback, useState, useEffect } from 'react';
import Switch from '@mui/material/Switch';

// Generating toggle switch buttons UI
function DynamicSwitchToggle(props) {
  const [formFields, setFormFields] = useState([])

  // This component reveives a number from props to decide how many switches to show
  useEffect(() => {
    addFieldsDynamically()
  }, [props.totalRouteInput]);


  const handleToggleChange = (event, index) => {
    props.switchRouteVisibility(index)
  }

  const addFieldsDynamically = () => {
    setFormFields([])
    let arr = []
    for (let i=0 ; i<props.totalRouteInput ; i++) {
      let object = {
        id: '',
      }
      arr.push(object)
    }
    setFormFields([...formFields, ...arr])
  }


  const addFields = () => {
    let object = {
        id: '',
    }
    setFormFields([...formFields, object])
  }

  const removeFields = (index) => {
    let data = [...formFields];
    data.splice(index, 1)
    setFormFields(data)
  }

  return (
    <div className="DynamicSwitchToggle">

        {/* <button onClick={() => {addFields()}}>Add More</button>
        <button onClick={() => {removeFields()}}>Remove</button> */}
        Show/Hide Route:
        {formFields.map((ele, index) => {
          return (
            <div key={index}>

                {". [ "+ index +" ]"} <Switch onChange={event => handleToggleChange(event, index)} defaultChecked  />
              
            </div>
          )
        })}
    </div>
  );
}

export default DynamicSwitchToggle;
