import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';

import {geolocated} from 'react-geolocated'; // https://www.npmjs.com/package/react-geolocated
import queryString from 'query-string'; // https://www.npmjs.com/package/query-string
import DateTimePicker from 'react-datetime-picker'; // https://github.com/wojtekmaj/react-datetime-picker
import Geosuggest from 'react-geosuggest'; // https://github.com/ubilabs/react-geosuggest
import {ChromePicker} from 'react-color'; // https://github.com/casesandberg/react-color
import ApiCalendar from 'react-google-calendar-api'; // https://github.com/Insomniiak/react-google-calendar-api

import Clock from './clock';
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

var getfgColor = function(query) {
  if ('fgColor' in query) {
    if (query.fgColor.length===6) {
      // then we assume hex
      return '#'+query.fgColor
    }
    return query.fgColor;
  } else {
    return '#ffffff';
  }
}

var getbgColor = function(query) {
  if ('bgColor' in query) {
    if (query.bgColor.length===6) {
      // then we assume hex
      return '#'+query.bgColor
    }
    return query.bgColor;
  } else {
    return '#212c40';
  }
}

var getShowCalendar = function(query) {
  if ('calendar' in query) {
    return query.calendar
  }
  return null;
}


var getForecastType = function(query) {
  if ('forecast' in query) {
    return query.forecast;
  }
  return null;
}

var getForecastCycle = function(query) {
  if ('forecastCycleSeconds' in query) {
    return query.forecastCycleSeconds;
  }
  return 0;
}

var getNextForecastButton = function(search, forecastType) {
  var cycleForecastNextQuery = queryString.parse(search);

  var toggleForecastIcon = 'wi fa-2x '
  if (forecastType==='precipitation') {
    toggleForecastIcon += 'wi-rain'
    cycleForecastNextQuery.forecast = 'temperature'
  } else if (forecastType==='temperature') {
    toggleForecastIcon += 'wi-thermometer'
    cycleForecastNextQuery.forecast = 'cloud-coverage'
  } else if (forecastType==='cloud-coverage') {
    toggleForecastIcon += 'wi-cloudy'
    cycleForecastNextQuery.forecast = undefined
  } else {
    toggleForecastIcon += 'wi-cloud'
    cycleForecastNextQuery.forecast = 'precipitation'
  }

  return [cycleForecastNextQuery, toggleForecastIcon]

}

var getFixedDate = function(query) {
  if ('fixedDate' in query) {
    var fixedDate = new Date()
    fixedDate.setTime(Date.parse(query.fixedDate))
    return fixedDate;
  }
  return null;
}

var getFixedLocation = function(query) {
  if ('fixedLocation' in query) {
    var fixedLocation = query.fixedLocation.split(",");
    return {lat: parseFloat(fixedLocation[0]), long: parseFloat(fixedLocation[1])};
  }
  return null;
}

var getLocationName = function(query) {
  if ('locationName' in query) {
    return query.locationName;
  }
  return null;
}


class App extends Component {
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    windowVisible: true,
    pauseUpdates: false, // only to be accessible from react developer tools
    refreshForecast: false,
  }
  onChange = settings => this.setState(settings)
  forceRefreshForecast = () => {
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
    var size = 0.8 * this.state.windowWidth/2
    if (this.state.windowHeight/2 - 125 < size) {
      size = this.state.windowHeight/2 - 125
    }

    // console.log("windowWidth: "+ this.state.windowWidth + "   " + window.innerWidth+ "   size: "+ size);

    var liveLocation = null;
    if (this.props.coords) {
      // then read from the browser location
      liveLocation = {lat: this.props.coords.latitude, long: this.props.coords.longitude}
    }

    return (
      <div className="App">
        <Router>
          <div>
            <Route path={process.env.PUBLIC_URL + '/info'} render={(props) => <Info match={props.match} search={props.location.search} query={queryString.parse(props.location.search)} />}/>
            <Route path={process.env.PUBLIC_URL + '/datetime'} render={(props) => <DatetimeSettings match={props.match} history={props.history} search={props.location.search} query={queryString.parse(props.location.search)} />}/>
            <Route path={process.env.PUBLIC_URL + '/location'} render={(props) => <LocationSettings match={props.match} history={props.history} search={props.location.search} query={queryString.parse(props.location.search)} liveLocation={liveLocation} />}/>
            <Route path={process.env.PUBLIC_URL + '/color'} render={(props) => <ColorSettings match={props.match} history={props.history} search={props.location.search} query={queryString.parse(props.location.search)}/>}/>
            <Route path={process.env.PUBLIC_URL + '/'} render={(props) => <ClockApp match={props.match} history={props.history} search={props.location.search} query={queryString.parse(props.location.search)}
                                                                                    size={size}
                                                                                    liveLocation = {liveLocation}
                                                                                    forceRefreshForecast={this.forceRefreshForecast} refreshForecast={this.state.refreshForecast} refreshForecastComplete={this.refreshForecastComplete}
                                                                                    windowVisible={this.state.windowVisible} pauseUpdates={this.state.pauseUpdates}/>}/>
          </div>
        </Router>

      </div>
    )
  }
}

class ClockApp extends Component {
  constructor(props) {
      super(props);
      this.state = {
        showTooltip: false,
        tooltipText: '',
        tooltipLink: null,
        liveLocationName: null,
        calendarAuthorized: ApiCalendar.sign,
      };
      ApiCalendar.onLoad(() => {
        this.calendarAuthorizeIfNecessary();
          // ApiCalendar.listenSign(this.updateCalendarAuthorization);
      });
  }
  displayTooltip = (tooltipText, tooltipLink) => {
    // console.log("request to show tooltip with text: "+tooltipText)
    this.setState({tooltipText: tooltipText, tooltipLink: tooltipLink, showTooltip: true});
  }
  hideTooltip = () => {
    this.setState({showTooltip: false});
  }
  calendarAuthorizeIfNecessary = () => {
    if (!this.state.calendarAuthorized && getShowCalendar(this.props.query)) {
      this.onCalendarAuthorize();
    }
  }
  updateCalendarAuthorization = () => {
    this.setState({calendarAuthorized: ApiCalendar.sign});
  }
  onCalendarAuthorize = () => {
    console.log("onCalendarAuthorize");
    ApiCalendar.handleAuthClick();
    this.updateCalendarAuthorization();
    this.props.query.calendar = true;
    this.props.history.push({pathname: process.env.PUBLIC_URL + '/', search: queryString.stringify(this.props.query, {encode: false})})
  }
  componentDidMount() {
    var forecastCycleSeconds = getForecastCycle(this.props.query);
    if (forecastCycleSeconds > 1) {
      setInterval(
        () => {
            var forecastType = getForecastType(this.props.query);
            var [cycleForecastNextQuery, toggleForecastIcon] = getNextForecastButton(this.props.search, forecastType)
            this.props.history.replace({pathname: process.env.PUBLIC_URL + '/', search: queryString.stringify(cycleForecastNextQuery, {encode: false})})
          },
          forecastCycleSeconds * 1000
      );
    }
  }

  render() {
    var fgColor = getfgColor(this.props.query);
    var bgColor = getbgColor(this.props.query);
    var showCalendar = getShowCalendar(this.props.query);
    var forecastType = getForecastType(this.props.query);
    var fixedDate = getFixedDate(this.props.query); // will use live-data if null
    var fixedLocation = getFixedLocation(this.props.query); // will use live-data if null
    var fixedLocationName = getLocationName(this.props.query); // won't display if null

    if (!fixedLocationName && this.props.liveLocation && !this.state.liveLocationName) {
      console.log("attempting reverse geolocation at: lat: "+this.props.liveLocation.lat+" lng: "+this.props.liveLocation.long)
      var geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({'location': {lat: this.props.liveLocation.lat, lng: this.props.liveLocation.long}}, (results, status) => {
                if (status === 'OK') {
                  for (var i = 0; i < results.length; i++) {
                    if (results[i].types.includes("locality")) {
                      this.setState({liveLocationName: results[i].formatted_address});
                      break
                    }
                  }
                } else {
                  console.log("reverse geocode failed with status: "+status)
                }
              });
    }

    document.body.style.backgroundColor = bgColor;

    var forecastButtons = [];
    if (!fixedDate && (fixedLocation || this.props.liveLocation)) {
      var refreshForecastButton = null;
      // here we'll reparse search to avoid soft-copying the query dictionary,
      // otherwise it'll automatically be updated and if this ClockApp
      // is redrawn (e.g. by toggling the tooltip) then the cycle will be invoked.
      var [cycleForecastNextQuery, toggleForecastIcon] = getNextForecastButton(this.props.search, forecastType)
      var toggleForecastOpacity = 0.6;

      if (forecastType) {
        toggleForecastOpacity = 0.9
        var refreshForecastOpacity = 0.6
        if (this.props.refreshForecast) {
          refreshForecastOpacity = 0.9
        }
        refreshForecastButton = <ToggleButton onClick={this.props.forceRefreshForecast} style={{paddingRight: "10px", opacity: refreshForecastOpacity}} iconColor={fgColor} iconWidth="40px" iconClass={'wi fa-2x wi-cloud-refresh'}/>
      }

      forecastButtons.push(<ToggleButton to={{pathname: process.env.PUBLIC_URL + '/', search: queryString.stringify(cycleForecastNextQuery, {encode: false})}} style={{paddingRight: "10px", opacity: toggleForecastOpacity}} iconColor={fgColor} iconWidth="40px" iconClass={toggleForecastIcon}/>)
      forecastButtons.push(refreshForecastButton)

    }

    var calendarButtons = [];
    if (this.state.calendarAuthorized) {

      // see note above for forecast on why we do this
      var cycleCalendarNextQuery = queryString.parse(this.props.search);
      if (showCalendar) {
        cycleCalendarNextQuery.calendar = undefined
      } else {
        cycleCalendarNextQuery.calendar = true
      }

      var toggleCalendarOpacity = 0.6;
      if (showCalendar) {
        toggleCalendarOpacity = 0.9
      }

      calendarButtons.push(<ToggleButton to={{pathname: process.env.PUBLIC_URL + '/', search: queryString.stringify(cycleCalendarNextQuery, {encode: false})}} style={{paddingRight: "10px", opacity: toggleCalendarOpacity}} iconColor={fgColor} iconWidth="40px" iconClass={'far fa-2x fa-calendar-alt'}/>)
    } else {
      calendarButtons.push(<ToggleButton onClick={this.onCalendarAuthorize} style={{paddingRight: "10px", opacity: 0.6}} iconColor={fgColor} iconWidth="40px" iconClass={'far fa-2x fa-calendar'}/>)
    }

    return (
      <div className="ClockApp">
        <Tooltip showTooltip={this.state.showTooltip} tooltipText={this.state.tooltipText} tooltipLink={this.state.tooltipLink} onClose={this.hideTooltip} bgColor={bgColor} fgColor={fgColor} />

        <div style={{position: "absolute", top: "2%", right: "2%"}}>
          <ToggleButton to={{pathname: process.env.PUBLIC_URL + '/info', search: this.props.search}} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={fgColor} iconWidth="40px" iconClass={'fas fa-lg fa-info'}/>
        </div>

        <div style={{position: "absolute", bottom: "2%", left: "2%"}}>
          {calendarButtons}
          {forecastButtons}
        </div>

        <div style={{position: "absolute", bottom: "2%", right: "2%"}}>
          <ToggleButton to={{pathname: process.env.PUBLIC_URL + '/color', search: this.props.search}} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={fgColor} iconWidth="40px" iconClass={'fas fa-2x fa-palette'}/>
          {/* <ToggleButton to={{pathname: process.env.PUBLIC_URL + '/settings', search: this.props.search}} style={{paddingLeft: "10px", opacity: 0.6}} iconColor={fgColor} iconWidth="40px" iconClass={'fas fa-2x fa-cog'}/> */}
        </div>

        <Clock search={this.props.search}
               size={this.props.size} bgColor={bgColor} fgColor={fgColor}
               fixedDate={fixedDate} fixedLocation={fixedLocation} liveLocation={this.props.liveLocation} locationName={fixedLocationName || this.state.liveLocationName}
               showCalendar={showCalendar && this.state.calendarAuthorized}
               showForecastRain={forecastType==='precipitation'} showForecastTemp={forecastType==='temperature'} showForecastCloud={forecastType==='cloud-coverage'}
               refreshForecast={this.props.refreshForecast} refreshForecastComplete={this.props.refreshForecastComplete} cycleForecastNextQuery={cycleForecastNextQuery || null}
               displayTooltip={this.displayTooltip}
               pauseUpdates={!this.props.windowVisible || this.props.pauseUpdates}/>
      </div>
    )
  }
}


class ToggleButton extends Component {
  render() {
    if (this.props.to) {
      return (
        <Link className="button" to={this.props.to} style={this.props.style}>
          <i className={this.props.iconClass} style={{color: this.props.iconColor, width: this.props.iconWidth}}></i>
          {this.props.text}
        </Link>
      )
    } else {
      return (
        <a className="button" onClick={this.props.onClick} style={this.props.style}>
          <i className={this.props.iconClass} style={{color: this.props.iconColor, width: this.props.iconWidth}}></i>
          {this.props.text}
        </a>
      )
    }
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
          {this.props.tooltipLink ? <a href={this.props.tooltipLink} style={{color: this.props.fgColor}} target="_blank" rel="noopener noreferrer"><span className="fas fa-external-link-alt"/> more info</a> : null}
          <p style={{color: this.props.fgColor}}>(click anywhere to close)</p>
        </div>
      </div>

    )
  }
}

class Info extends Component {
  render () {
    var fgColor = getfgColor(this.props.query);
    var bgColor = getbgColor(this.props.query);

    return (
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "50px", backgroundColor: bgColor, zIndex: 999, overflowY: 'scroll'}}>
      <ToggleButton to={{pathname: process.env.PUBLIC_URL + '/', search: this.props.search}} style={{position: "fixed", top: "2%", right: "2%"}} iconColor={fgColor} iconClass={'fas fa-2x fa-times'}/>

        <div className='Settings' style={{paddingTop: '5px'}}>
          <div className='SettingsSection'>
            <p style={{color: fgColor}}>Designed and Written by <a href="http://keconroy.com" target="_blank" rel="noopener noreferrer">Kyle Conroy</a><br/>
            as an <a href="http://github.com/kecnry/cosmic-clock" target="_blank" rel="noopener noreferrer">open-source project on GitHub</a></p>
          </div>
          <div className='SettingsSection'>
            <p style={{color: fgColor, paddingLeft: '10px', paddingRight: '10px', maxWidth: '600px', margin: 'auto'}}>
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
            <p style={{color: fgColor}}>Weather <a href="https://darksky.net/poweredby/" target="_blank" rel="noopener noreferrer">Powered by DarkSky</a></p>
          </div>
        </div>
      </div>
    )
  }
}

class DatetimeSettings extends Component {
  onChangeDateTime = (date) => {
    if (date) {
      this.props.query.fixedDate = date.toString();
    } else {
      this.props.query.fixedDate = undefined;
    }
    this.props.history.push({pathname: process.env.PUBLIC_URL + '/datetime', search: queryString.stringify(this.props.query, {encode: false})})

  }

  render() {
    var fgColor = getfgColor(this.props.query);
    var bgColor = getbgColor(this.props.query);

    var fixedDate = getFixedDate(this.props.query); // will use live-data if null


    return (
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "10px", backgroundColor: bgColor, zIndex: 999, overflowY: 'scroll'}}>
        <ToggleButton to={{pathname: process.env.PUBLIC_URL + '/', search: this.props.search}} style={{position: "fixed", top: "2%", right: "2%"}} iconColor={fgColor} iconClass={'fas fa-2x fa-times'}/>

        <div className='Settings' style={{paddingTop: '5px'}}>
          <div className='SettingsSection'>
            <p style={{color: fgColor}}>Date and Time</p><br/>
            <DateTimePicker onChange={this.onChangeDateTime} value={fixedDate}/>
          </div>
        </div>
      </div>
    )
  }
}

class LocationSettings extends Component {
  onChangeLocation = (location) => {
    if (location && "location" in location) {
      this.props.query.fixedLocation = location.location.lat+","+location.location.lng;
      this.props.query.locationName = location.description;
    } else {
      this.props.query.fixedLocation = undefined;
      this.props.query.locationName = undefined;
    }
    this.props.history.push({pathname: process.env.PUBLIC_URL + '/location', search: queryString.stringify(this.props.query, {encode: false})})
  }

  render() {
    var fgColor = getfgColor(this.props.query);
    var bgColor = getbgColor(this.props.query);

    return (
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "10px", backgroundColor: bgColor, zIndex: 999, overflowY: 'scroll'}}>
        <ToggleButton to={{pathname: process.env.PUBLIC_URL + '/', search: this.props.search}} style={{position: "fixed", top: "2%", right: "2%"}} iconColor={fgColor} iconClass={'fas fa-2x fa-times'}/>

        <div className='Settings' style={{paddingTop: '5px'}}>
          <div className='SettingsSection'>
            <p style={{color: fgColor}}>Location</p><br/>
            {this.props.liveLocation ? <button onClick={this.onChangeLocation} style={{marginBottom: "10px"}}>Use GPS Location</button> : <p style={{color: fgColor}}>enable browser location to use live-location</p>}
            <Geosuggest onSuggestSelect={this.onChangeLocation} types={["(cities)"]}/>
          </div>
        </div>
      </div>
    )
  }
}

class ColorSettings extends Component {
  onChangebgColor = (color) => {
    // this.props.onChange({bgColor: "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+","+color.rgb.a+")"});
    this.props.query.bgColor = color.hex.slice(1);
    this.props.history.push({pathname: process.env.PUBLIC_URL + '/color', search: queryString.stringify(this.props.query)})

  }
  onChangefgColor = (color) => {
    // this.props.onChange({fgColor: "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+","+color.rgb.a+")"});
    this.props.query.fgColor = color.hex.slice(1);
    this.props.history.push({pathname: process.env.PUBLIC_URL + '/color', search: queryString.stringify(this.props.query)})

  }
  render() {
    var fgColor = getfgColor(this.props.query);
    var bgColor = getbgColor(this.props.query);

    return (
      <div style={{position: "fixed", width: "100%", height: "100%", paddingTop: "10px", backgroundColor: bgColor, zIndex: 999, overflowY: 'scroll'}}>
        <ToggleButton to={{pathname: process.env.PUBLIC_URL + '/', search: this.props.search}} style={{position: "fixed", top: "2%", right: "2%"}} iconColor={fgColor} iconClass={'fas fa-2x fa-times'}/>
        <ToggleButton to={{pathname: process.env.PUBLIC_URL + '/', search: this.props.search}} style={{position: "fixed", bottom: "2%", right: "2%"}} iconColor={fgColor} iconClass={'fas fa-2x fa-times'}/>

        <div className='Settings' style={{paddingTop: '5px'}}>
          <div className='SettingsSection'>
            <p style={{color: fgColor}}>Background Color</p><br/>
            <div style={{margin: 'auto', width: '225px'}}>
              <ChromePicker onChangeComplete={this.onChangebgColor} color={bgColor} disableAlpha={true}/>
            </div>
          </div>
          <div className='SettingsSection'>
            <p style={{color: fgColor}}>Foreground Color</p><br/>
            <div style={{margin: 'auto', width: '225px'}}>
              <ChromePicker onChangeComplete={this.onChangefgColor} color={fgColor} disableAlpha={true}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default geolocated()(App);
