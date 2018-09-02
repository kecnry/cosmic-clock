import React, { Component } from 'react';
import Clock from './clock';
import DateTimePicker from 'react-datetime-picker'; // https://github.com/wojtekmaj/react-datetime-picker
import Geosuggest from 'react-geosuggest'; // https://github.com/ubilabs/react-geosuggest
import {ChromePicker} from 'react-color'; // https://github.com/casesandberg/react-color
import './App.css';





export default class App extends Component {
  state = {
    windowWidth: 10000,
    windowHeight: 10000,
    bgColor: '#212c40',
    fgColor: '#ffffff',
    showSettings: false,
    showColorSettings: false,
    date: null, // will use live date if null
    location: null // will use live data if null
  }
  onChange = settings => this.setState(settings)
  toggleSettings = () => {
    this.setState({showSettings: !this.state.showSettings})
    if (this.state.showColorSettings) {
      this.setState({showColorSettings: false})
    }
  }
  toggleColorSettings = () => {
    this.setState({showColorSettings: !this.state.showColorSettings})
    if (this.state.showSettings) {
      this.setState({showSettings: false})
    }
  }
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
  }
  render() {
    document.body.style.backgroundColor = this.state.bgColor;

    var size = 300;
    if (0.8 * this.state.windowWidth/2 < size) {
      size = 0.8 * this.state.windowWidth/2
    }
    console.log("windowWidth: "+ this.state.windowWidth + "   " + window.innerWidth+ "   size: "+ size);


    return (
      <div className="App">
        <Settings showSettings={this.state.showSettings} date={this.state.date} />
        <ColorSettings showSettings={this.state.showColorSettings} bgColor={this.state.bgColor} fgColor={this.state.fgColor} onChange={this.onChange} />

        <ToggleButton onClick={this.toggleSettings} style={{position: "absolute", bottom: "25px", right: "25px"}} iconColor={this.state.fgColor} iconClass={'fas fa-2x fa-cog'}/>
        <ToggleButton onClick={this.toggleColorSettings} style={{position: "absolute", bottom: "25px", right: "75px"}} iconColor={this.state.fgColor} iconClass={'fas fa-2x fa-palette'}/>

        <Clock size={size} bgColor={this.state.bgColor} fgColor={this.state.fgColor} date={this.state.date} location={this.state.location}/>

      </div>
    );
  }
}

class ToggleButton extends Component {
  render() {
    return (
      <a className="button" onClick={this.props.onClick} style={this.props.style}><i className={this.props.iconClass} style={{color: this.props.iconColor}}></i>{this.props.text}</a>
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

class ColorSettings extends Component {
  onChangebgColor = color => this.props.onChange({bgColor: "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+","+color.rgb.a+")"});
  onChangefgColor = color => this.props.onChange({fgColor: "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+","+color.rgb.a+")"});
  render() {
    var display = 'block'
    if (!this.props.showSettings) {
      display = 'none'
    }
    return (
      <div className='Settings' style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: "rgba(224, 238, 255, 0.79)", display: display}}>
        <div className='SettingsSection'>
          Background Color<br/><div style={{margin: 'auto', width: '225px'}}><ChromePicker onChangeComplete={this.onChangebgColor} color={this.props.bgColor}/></div>
        </div>
        <div className='SettingsSection'>
          Foreground Color<br/><div style={{margin: 'auto', width: '225px'}}><ChromePicker onChangeComplete={this.onChangefgColor} color={this.props.fgColor}/></div>
        </div>
      </div>
    )
  }
}
