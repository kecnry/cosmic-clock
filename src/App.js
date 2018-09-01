import React, { Component } from 'react';
import Clock from './clock';
import DateTimePicker from 'react-datetime-picker'; // https://github.com/wojtekmaj/react-datetime-picker
import Geosuggest from 'react-geosuggest'; // https://github.com/ubilabs/react-geosuggest
import './App.css';





export default class App extends Component {
  state = {
    showSettings: false,
    date: null, // will use live date if null
    location: null // will use live data if null
  }
  onChange = settings => this.setState(settings)
  toggleSettings = () => this.setState({showSettings: !this.state.showSettings})
  render() {
    return (
      <div className="App">
        <Settings showSettings={this.state.showSettings} date={this.state.date} onChange={this.onChange} />
        <ToggleButton onClick={this.toggleSettings} style={{position: "absolute", top: "5px", right: "5px"}} text={"settings"}/>
        <Clock size={300} color={'white'} date={this.state.date} location={this.state.location}/>

      </div>
    );
  }
}

class ToggleButton extends Component {
  render() {
    return (
      <button onClick={this.props.onClick} style={this.props.style}>{this.props.text}</button>
    )
  }
}

class Settings extends Component {
  onChangeDateTime = date => this.props.onChange({date: date});
  onChangeLocation = location => this.props.onChange({location: location});
  render() {
    var display = 'block'
    if (!this.props.showSettings) {
      display = 'none'
    }
    return (
      <div className='Settings' style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: "rgba(224, 238, 255, 0.79)", display: display}}>
        <div className='SettingsSection'>
          Date and Time<br/><DateTimePicker onChange={this.onChangeDateTime} value={this.props.date}/>
        </div>
        <div className='SettingsSection'>
          Location<br/><Geosuggest onSuggestSelect={this.onChangeLocation}/>
        </div>
      </div>
    )
  }
}
