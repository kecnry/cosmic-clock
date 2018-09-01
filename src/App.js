import React, { Component } from 'react';
import Clock from './clock';
import './App.css';





export default class App extends Component {
  render() {
    return (
      <div className="App" style={{paddingTop:50}}>
        <Clock size={300} color={'white'}/>
      </div>
    );
  }
}
