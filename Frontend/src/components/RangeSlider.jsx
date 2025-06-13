import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Form } from 'react-bootstrap';

function RangeSlider(props) {
  const handleChange = (newValue) => {
    props.onChange(newValue);
  };

  return (
    <>
      <Form.Label>{props.title}</Form.Label>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{props.value[0]}</span>
        <span>{props.value[1]}</span>
      </div>
      <Slider
        range
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={handleChange}
      />
    </>
  );
}

export default RangeSlider;
