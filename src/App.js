import React, { Component } from 'react';
import Clock from './clock';
import DateTimePicker from 'react-datetime-picker'; // https://github.com/wojtekmaj/react-datetime-picker
import Geosuggest from 'react-geosuggest'; // https://github.com/ubilabs/react-geosuggest
import {ChromePicker} from 'react-color'; // https://github.com/casesandberg/react-color
import './App.css';


// see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}



export default class App extends Component {
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    windowVisible: true,
    bgColor: '#212c40',
    fgColor: '#ffffff',
    showInfo: false,
    showSettings: false,
    showColorSettings: false,
    showForecast: true,
    date: null, // will use live date if null
    location: null // will use live data if null
  }
  onChange = settings => this.setState(settings)
  toggleInfo = () => {
    this.setState({showInfo: !this.state.showInfo})
  }
  toggleSettings = () => {
    this.setState({showSettings: !this.state.showSettings})
  }
  toggleColorSettings = () => {
    this.setState({showColorSettings: !this.state.showColorSettings})
  }
  toggleForecast = () => {
    this.setState({showForecast: !this.state.showForecast})
  }
  componentDidMount() {
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener(visibilityChange, this.updateWindowVisibility);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener(visibilityChange, this.updateWindowVisibility);
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
  }
  updateWindowVisibility = () => {
    this.setState({windowVisible: !document[hidden]});
  }
  render() {
    document.body.style.backgroundColor = this.state.bgColor;

    var size = 0.8 * this.state.windowWidth/2
    if (this.state.windowHeight/2 - 125 < size) {
      size = this.state.windowHeight/2 - 125
    }

    console.log("windowWidth: "+ this.state.windowWidth + "   " + window.innerWidth+ "   size: "+ size);

    var refreshForecastButton = null;
    var toggleForecastOpacity = 0.6;
    if (this.state.showForecast) {
      refreshForecastButton = <ToggleButton style={{paddingRight: "10px", opacity: 0.6}} iconColor={this.state.fgColor} iconClass={'wi fa-2x wi-cloud-refresh'}/>
      toggleForecastOpacity = 0.9;
    }


    return (
      <div className="App">
        <Info showInfo={this.state.showInfo} bgColor={this.state.bgColor} fgColor={this.state.fgColor} onChange={this.onChange} />
        <Settings showSettings={this.state.showSettings} bgColor={this.state.bgColor} fgColor={this.state.fgColor} date={this.state.date} onChange={this.onChange} />
        <ColorSettings showSettings={this.state.showColorSettings} bgColor={this.state.bgColor} fgColor={this.state.fgColor} onChange={this.onChange} />

        <div style={{position: "absolute", top: "2%", right: "2%"}}>
          <ToggleButton onClick={this.toggleInfo} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={this.state.fgColor} iconClass={'fas fa-lg fa-info'}/>
        </div>

        <div style={{position: "absolute", bottom: "2%", left: "2%"}}>
          <ToggleButton onClick={this.toggleForecast} style={{paddingRight: "10px", opacity: toggleForecastOpacity}} iconColor={this.state.fgColor} iconClass={'wi fa-2x wi-cloud'}/>
          {refreshForecastButton}
        </div>

        <div style={{position: "absolute", bottom: "2%", right: "2%"}}>
          <ToggleButton onClick={this.toggleColorSettings} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={this.state.fgColor} iconClass={'fas fa-2x fa-palette'}/>
          <ToggleButton onClick={this.toggleSettings} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={this.state.fgColor} iconClass={'fas fa-2x fa-cog'}/>
        </div>

        <Clock size={size} bgColor={this.state.bgColor} fgColor={this.state.fgColor} date={this.state.date} location={this.state.location} showForecast={this.state.showForecast} pauseUpdates={!this.state.windowVisible}/>

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

class Info extends Component {
  onClose = () => this.props.onChange({showInfo: false});
  render () {
    var display = 'block'
    if (!this.props.showInfo) {
      display = 'none'
    }
    return (
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: this.props.bgColor, display: display, zIndex: 999}}>
      <ToggleButton onClick={this.onClose} style={{position: "fixed", top: "2%", right: "2%"}} iconColor={this.props.fgColor} iconClass={'fas fa-2x fa-times'}/>

        <div className='Settings' style={{paddingTop: '5px'}}>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor}}>Designed and Written by <a href="https://keconroy.com" target="_blank">Kyle Conroy</a><br/>
            as an <a href="http://github.com/kecnry/cosmic-clock" target="_blank">open-source project on GitHub</a></p>
          </div>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor}}>Weather <a href="https://darksky.net/poweredby/" target="_blank">Powered by DarkSky</a></p>
          </div>
        </div>
      </div>
    )
  }
}

class Settings extends Component {
  onClose = () => this.props.onChange({showSettings: false});
  onChangeDateTime = date => this.props.onChange({date: date});
  onChangeLocation = location => this.props.onChange({location: location});

  render() {
    var display = 'block'
    if (!this.props.showSettings) {
      display = 'none'
    }
    return (
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: this.props.bgColor, display: display, zIndex: 999}}>
      <ToggleButton onClick={this.onClose} style={{position: "fixed", bottom: "2%", right: "2%"}} iconColor={this.props.fgColor} iconClass={'fas fa-2x fa-times'}/>

        <div className='Settings' style={{paddingTop: '5px'}}>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor}}>Date and Time</p><br/>
            <DateTimePicker onChange={this.onChangeDateTime} value={this.props.date}/>
          </div>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor}}>Location</p><br/>
            <Geosuggest onSuggestSelect={this.onChangeLocation}/>
          </div>
        </div>
      </div>
    )
  }
}

class ColorSettings extends Component {
  onClose = () => this.props.onChange({showColorSettings: false});
  onChangebgColor = color => this.props.onChange({bgColor: "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+","+color.rgb.a+")"});
  onChangefgColor = color => this.props.onChange({fgColor: "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+","+color.rgb.a+")"});
  render() {
    var display = 'block'
    if (!this.props.showSettings) {
      display = 'none'
    }
    return (
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: this.props.bgColor, display: display, zIndex: 999}}>
        <ToggleButton onClick={this.onClose} style={{position: "fixed", bottom: "2%", right: "2%"}} iconColor={this.props.fgColor} iconClass={'fas fa-2x fa-times'}/>

        <div className='Settings' style={{paddingTop: '5px'}}>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor}}>Background Color</p><br/>
            <div style={{margin: 'auto', width: '225px'}}>
              <ChromePicker onChangeComplete={this.onChangebgColor} color={this.props.bgColor}/>
            </div>
          </div>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor}}>Foreground Color</p><br/>
            <div style={{margin: 'auto', width: '225px'}}>
              <ChromePicker onChangeComplete={this.onChangefgColor} color={this.props.fgColor}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
