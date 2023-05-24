import {useRef} from 'react';

// Simple utility Component. InputBox can take text input and can pass callback function as props to call upon submit
// Used for testing
const InputBox = (props) => {
  const inputRef = useRef(null);

  function handleClick() {
    props.callback(inputRef.current.value)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        id="message"
        name="message"
        placeholder={props.placeholder}
      />

      <button onClick={handleClick}>Submit</button>
    </div>
  );
};

export default InputBox;