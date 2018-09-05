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
    pauseUpdates: false, // only to be accessible from react developer tools
    bgColor: '#212c40',
    fgColor: '#ffffff',
    showTooltip: false,
    tooltipText: '',
    showInfo: false,
    showSettings: false,
    showColorSettings: false,
    showForecastRain: true,
    showForecastCloud: false,
    showForecastTemp: false,
    refreshForecast: true,
    date: null, // will use live date if null
    location: null // will use live data if null
  }
  onChange = settings => this.setState(settings)
  displayTooltip = (tooltipText) => {
    console.log("request to show tooltip with text: "+tooltipText)
    this.setState({tooltipText: tooltipText, showTooltip: true});
  }
  hideTooltip = () => {
    this.setState({showTooltip: false});
  }
  toggleInfo = () => {
    this.setState({showInfo: !this.state.showInfo})
  }
  toggleSettings = () => {
    this.setState({showSettings: !this.state.showSettings})
  }
  toggleColorSettings = () => {
    this.setState({showColorSettings: !this.state.showColorSettings})
  }
  cycleForecast = () => {
   if (this.state.showForecastRain) {
     this.setState({showForecastRain: false, showForecastTemp: true})
   } else if (this.state.showForecastTemp) {
     this.setState({showForecastTemp: false, showForecastCloud: true})
   } else if (this.state.showForecastCloud) {
     this.setState({showForecastCloud: false})
   } else {
     this.setState({showForecastRain: true})
   }
  }
  refreshForecast = () => {
    this.setState({refreshForecast: true})
  }
  refreshForecastComplete = () => {
    this.setState({refreshForecast: false})
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

    // console.log("windowWidth: "+ this.state.windowWidth + "   " + window.innerWidth+ "   size: "+ size);

    var forecastButtons = [];
    if (!this.state.date) {
      var refreshForecastButton = null;
      var toggleForecastOpacity = 0.6;

      var toggleForecastIcon = 'wi fa-2x '
      if (this.state.showForecastRain) {
        toggleForecastIcon += 'wi-rain'
      } else if (this.state.showForecastTemp) {
        toggleForecastIcon += 'wi-thermometer'
      } else if (this.state.showForecastCloud) {
        toggleForecastIcon += 'wi-cloudy'
      } else {
        toggleForecastIcon += 'wi-cloud'
      }

      if (this.state.showForecastRain || this.state.showForecastCloud || this.state.showForecastTemp) {
        toggleForecastOpacity = 0.9
        var refreshForecastOpacity = 0.6
        if (this.state.refreshForecast) {
          refreshForecastOpacity = 0.9
        }
        refreshForecastButton = <ToggleButton onClick={this.refreshForecast} style={{paddingRight: "10px", opacity: refreshForecastOpacity}} iconColor={this.state.fgColor} iconWidth="40px" iconClass={'wi fa-2x wi-cloud-refresh'}/>
      }

      forecastButtons.push(<ToggleButton onClick={this.cycleForecast} style={{paddingRight: "10px", opacity: toggleForecastOpacity}} iconColor={this.state.fgColor} iconWidth="40px" iconClass={toggleForecastIcon}/>)
      forecastButtons.push(refreshForecastButton)

    }




    return (
      <div className="App">
        <Tooltip showTooltip={this.state.showTooltip} tooltipText={this.state.tooltipText} onClose={this.hideTooltip} bgColor={this.state.bgColor} fgColor={this.state.fgColor} />
        <Info showInfo={this.state.showInfo} bgColor={this.state.bgColor} fgColor={this.state.fgColor} onChange={this.onChange} />
        <Settings showSettings={this.state.showSettings} bgColor={this.state.bgColor} fgColor={this.state.fgColor} date={this.state.date} onChange={this.onChange} />
        <ColorSettings showSettings={this.state.showColorSettings} bgColor={this.state.bgColor} fgColor={this.state.fgColor} onChange={this.onChange} />

        <div style={{position: "absolute", top: "2%", right: "2%"}}>
          <ToggleButton onClick={this.toggleInfo} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={this.state.fgColor} iconWidth="40px" iconClass={'fas fa-lg fa-info'}/>
        </div>

        <div style={{position: "absolute", bottom: "2%", left: "2%"}}>
          {forecastButtons}
        </div>

        <div style={{position: "absolute", bottom: "2%", right: "2%"}}>
          <ToggleButton onClick={this.toggleColorSettings} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={this.state.fgColor} iconWidth="40px" iconClass={'fas fa-2x fa-palette'}/>
          <ToggleButton onClick={this.toggleSettings} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={this.state.fgColor} iconWidth="40px" iconClass={'fas fa-2x fa-cog'}/>
        </div>

        <Clock size={size} bgColor={this.state.bgColor} fgColor={this.state.fgColor} date={this.state.date} location={this.state.location} showForecastRain={this.state.showForecastRain} showForecastTemp={this.state.showForecastTemp} showForecastCloud={this.state.showForecastCloud} refreshForecast={this.state.refreshForecast} refreshForecastComplete={this.refreshForecastComplete} displayTooltip={this.displayTooltip} pauseUpdates={!this.state.windowVisible || this.state.pauseUpdates}/>

      </div>
    );
  }
}

class ToggleButton extends Component {
  render() {
    return (
      <a className="button" onClick={this.props.onClick} style={this.props.style}><i className={this.props.iconClass} style={{color: this.props.iconColor, width: this.props.iconWidth}}></i>{this.props.text}</a>
    )
  }
}

class Tooltip extends Component {
  render () {
    var display = 'block'
    if (!this.props.showTooltip) {
      display = 'none'
    }
    return (
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "30%", backgroundColor: "rgba(0,0,0,0.85)", display: display, zIndex: 999}} onClick={this.props.onClose}>
        <div style={{top: '50%', width: '50%', margin: 'auto', backgroundColor: this.props.bgColor, borderRadius: '10px', padding: '5px 20px 5px 20px'}}>
          <h2 style={{color: this.props.fgColor}}>{this.props.tooltipText}</h2>
          <p style={{color: this.props.fgColor}}>(click anywhere to close)</p>
        </div>
      </div>

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
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: this.props.bgColor, display: display, zIndex: 999, overflowY: 'scroll'}}>
      <ToggleButton onClick={this.onClose} style={{position: "fixed", top: "2%", right: "2%"}} iconColor={this.props.fgColor} iconClass={'fas fa-2x fa-times'}/>

        <div className='Settings' style={{paddingTop: '5px'}}>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor}}>Designed and Written by <a href="https://keconroy.com" target="_blank" rel="noopener noreferrer">Kyle Conroy</a><br/>
            as an <a href="http://github.com/kecnry/cosmic-clock" target="_blank" rel="noopener noreferrer">open-source project on GitHub</a></p>
          </div>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor, paddingLeft: '10px', paddingRight: '10px', maxWidth: '600px', margin: 'auto'}}>
              <b>How to read:</b>the tick moving around the outside of the circle can be thought of as the second-hand of a clock.
              Just inside that is a solid arc representing the minute-hand of a clock, or circular progress bar representing how much of the current hour has passed.
              The inner solid arc tells how much of the current day has passed (so like an hour-hand, but representing a full 24 hours instead of 12).  On top of this arc are two icons: a solid and hollow circle representing the time of sunrise and sunset, respectively, for the current location.
              The outer hollow arc tells how much of the current month has passed, with icons representing the (approximate) times in the current month of the quarter phases of the moon.
              The inner hollow arc tells how much of the current year has passed, with the long ticks representing the solar solstices and equinoxes (roughly the beginning of each season) and the shorter ticks representing perihelion (around Jan 4) and aphelion (around June 4) when the Earth is closest and furthest from the sun in its orbit, respectively.
              <br/><br/>
              If weather is displayed (togglable in the bottom left) then the forecast for rain is overlayed with color representing intensitiy and width representing the chance of precipitation.  Clicking on any overlay will show the details of the expected precipitation.

            </p>
          </div>
          <div className='SettingsSection'>
            <p style={{color: this.props.fgColor}}>Weather <a href="https://darksky.net/poweredby/" target="_blank" rel="noopener noreferrer">Powered by DarkSky</a></p>
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
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: this.props.bgColor, display: display, zIndex: 999, overflowY: 'scroll'}}>
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
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: this.props.bgColor, display: display, zIndex: 999, overflowY: 'scroll'}}>
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
