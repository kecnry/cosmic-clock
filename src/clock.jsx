import React, { Component } from 'react';
import {CircleSegment, Tick, CircleMarker, HalfCircleMarker} from './clockComponents'
import {geolocated} from 'react-geolocated'; // https://www.npmjs.com/package/react-geolocated
import DarkSkyApi from 'dark-sky-api'; // https://www.npmjs.com/package/dark-sky-api
var SunCalc = require('suncalc'); // https://github.com/mourner/suncalc

// NOTE: this does not account for a leap year.
var nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var moonIcon = ['new',
                'waxing-crescent-1', 'waxing-crescent-2', 'waxing-crescent-3', 'waxing-crescent-4', 'waxing-crescent-5', 'waxing-crescent-6',
                'first-quarter',
                'waxing-gibbous-1', 'waxing-gibbous-2', 'waxing-gibbous-3', 'waxing-gibbous-4', 'waxing-gibbous-5', 'waxing-gibbous-6',
                'full',
                'waning-gibbous-1', 'waning-gibbous-2', 'waning-gibbous-3', 'waning-gibbous-4', 'waning-gibbous-5', 'waning-gibbous-6',
                'third-quarter',
                'waning-crescent-1', 'waning-crescent-2', 'waning-crescent-3', 'waning-crescent-4', 'waning-crescent-5', 'waning-crescent-6',
                ]

var getPrecipColor = function(precipIntensity) {
  if (precipIntensity < 0.2) {
    return 'greenyellow'
  } else if (precipIntensity < 0.3) {
    return 'green'
  } else if (precipIntensity < 0.4) {
    return 'darkgreen'
  } else if (precipIntensity < 0.5) {
    return 'yellow'
  } else if (precipIntensity < 0.6) {
    return 'gold'
  } else if (precipIntensity < 0.7) {
    return 'orange'
  } else if (precipIntensity < 0.8) {
    return 'orangered'
  } else if (precipIntensity < 0.9) {
    return 'red'
  } else {
    return 'darkred'
  }
}

DarkSkyApi.apiKey = '796616a5ef888b16148b7f659fba5725';

class Clock extends Component {
  state = {
    date: new Date(),
    location: null,
    sunTimes: null,
    moonPhase: null,
    weather: null,
  }

  computeSunTimes = () => {
    if (this.state.location) {
      console.log("computeSunTimes at location: "+this.state.location.lat + "   " + this.state.location.long);
      return(SunCalc.getTimes(this.state.date, this.state.location.lat, this.state.location.long));
    } else {
      console.log("computeSunTimes NO LOCATION");
      return(null);
    }
  }

  computeMoonPhase = () => {
    console.log("computeMoonPhase at "+this.state.date);
    return(SunCalc.getMoonIllumination(this.state.date).phase);
  }

  updateWeather = () => {
    console.log("updateWeather");
    var location = null
    if (this.state.location) {
      location = {latitude: this.state.location.lat, longitude: this.state.location.long}
    }

    DarkSkyApi.loadItAll('flags,alerts', location)
      .then(result => this.setState({weather: result}));

    this.props.refreshForecastComplete();
  }

  componentDidMount() {
    setInterval(
      () => {
          if (this.props.pauseUpdates) return
          var location = null;
          if (this.props.location && this.props.location.label) {
            // then read from the user-provided locatoin
            location = {lat: this.props.location.location.lat, long: this.props.location.location.lng}
          } else if (this.props.coords) {
            // then read from the browser location
            location = {lat: this.props.coords.latitude, long: this.props.coords.longitude}
          }
          if (!this.state.location || (location && (location.long !== this.state.location.long || location.lat !== this.state.location.lat || ! this.state.sunTimes))) {
            // sunTimes will fail until location is available, but once it is
            // and sunTimes is set, we don't need to set until the next day
            // which the other interval will cover
            this.setState({date: this.props.date || new Date(), location: location});
            this.setState({sunTimes: this.computeSunTimes(), moonPhase: this.computeMoonPhase()});
            this.updateWeather();

          } else {
            this.setState({date: this.props.date || new Date()});
          }
          if (this.props.refreshForecast) {
            this.updateWeather();
          }

        },
        1000  // every second
    );
    setInterval(
      () => {
        if (this.props.pauseUpdates) return
        this.setState({sunTimes: this.computeSunTimes(), moonPhase: this.computeMoonPhase()})
      },
      1000*60*60*24  // every day
    );
    setInterval(
      () => {
        if (this.props.pauseUpdates) return
        this.updateWeather()
      },
      1000*60*15 // every 15 minutes
    )
    this.setState({moonPhase: this.computeMoonPhase()});
    this.updateWeather();

  }

  render() {

    // var milliseconds = this.state.date.getMilliseconds();
    var milliseconds = 0;  // use actual milliseconds if interval above is < 1000, otherwise override to 0
    var seconds = this.state.date.getSeconds() + milliseconds/1000;
    var rMinute = seconds/60;
    var minutes = this.state.date.getMinutes() + rMinute;
    var rHour = minutes/60;
    var hours = this.state.date.getHours() + rHour;
    var rDay = hours/24;
    var days = this.state.date.getDate() + rDay;
    var month = this.state.date.getMonth()
    var rMonth = (days - 1) / nDays[month-1];
    var daysTotal = rDay;
    for (var i=1; i <= month; i++) {
        daysTotal += nDays[month-1]
    }
    var rYear = daysTotal/365;


    if (this.state.sunTimes) {
      var rDaySunrise = (this.state.sunTimes.sunrise.getHours() + this.state.sunTimes.sunrise.getMinutes()/60)/24;
      var rDaySunset = (this.state.sunTimes.sunset.getHours() + this.state.sunTimes.sunset.getMinutes()/60)/24;
    }

    var rMonthNewMoon = rMonth - this.state.moonPhase;
    var rMonthFirstQuarterMoon = rMonthNewMoon + 0.25;
    var rMonthFullMoon = rMonthNewMoon + 0.5;
    var rMonthThirdQuarterMoon = rMonthNewMoon + 0.75;

    var rYearWinterSolstice = (365-10)/365;
    var rYearFallEquinox = rYearWinterSolstice - 0.25;
    var rYearSummerSolstice = rYearWinterSolstice - 0.5;
    var rYearSpringEquinox = rYearWinterSolstice - 0.75;

    var rYearPerihelion = 4/365;
    var rYearAphelion = rYearPerihelion + 0.5;



    var cx = this.props.size;
    var cy = this.props.size;
    var width = this.props.size/12
    var strokeWidth = this.props.size/100
    var centerSize = this.props.size/3
    var centerIconSize = 0.8*centerSize
    var spacing = this.props.size/6.5

    var hours12 = this.state.date.getHours();
    if (hours12 > 12) {
      hours12 -= 12
    }
    var timeString = hours12 + ":" + ("00" + this.state.date.getMinutes()).slice(-2);
    var dateString = this.state.date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    var locationString = null
    if (this.props.location && 'description' in this.props.location) {
      locationString = this.props.location.description
    }

    var centerIconClass = "wi "
    var centerIconOnClick = null
    if (this.props.date || !this.state.weather) {
      centerIconClass += "wi-moon-"+moonIcon[parseInt(this.state.moonPhase*28)];
    } else {
      // centerIconOnClick = this.toggleForecast
      centerIconClass += "wi-forecast-io-"+this.state.weather.currently.icon;
    }

    var forecastHour = [];
    var forecastDay = [];
    var forecastMonth = [];
    var precipIntensity = null;
    var color
    if (this.props.showForecast && this.state.weather && !this.props.date) {
      if ("minutely" in this.state.weather) {
        // not all locations have minutely data
        for (var min=0; min < 60; min++) {
          precipIntensity = this.state.weather.minutely.data[min].precipIntensity
          if (precipIntensity > 0.01) {
            color = getPrecipColor(precipIntensity);
            forecastHour.push(<CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={1.5*width} startAngle={rHour+min/60} endAngle={rHour+(min+1.01)/60} color={color} opacity={1-(min-45)/15}/>)
          }
        }
      }

      for (var hour=0; hour < 24; hour++) {
        precipIntensity = this.state.weather.hourly.data[hour].precipIntensity
        if (precipIntensity > 0.01) {
          color = getPrecipColor(precipIntensity);
          forecastDay.push(<CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={1.5*width} startAngle={rDay+hour/24} endAngle={rDay+(hour+1.01)/24} color={color} opacity={1-(hour-18)/6}/>)
        }
      }

      for (var day=0; day <= 7; day++) {
        precipIntensity = this.state.weather.daily.data[day].precipIntensityMax
        if (precipIntensity > 0.05) {
          color = getPrecipColor(precipIntensity);
          forecastMonth.push(<CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={1.5*width} startAngle={rMonth+day/nDays[month-1]} endAngle={rMonth+(day+1.01)/nDays[month-1]} color={color} opacity={1-(day-20)/10}/>)
        }
      }
    }
    forecastMonth.push(<Tick cx={cx} cy={cy} r={centerSize+1*spacing} endAngle={rMonth+(day+1.01)/nDays[month-1]} color={getPrecipColor(0)} strokeWidth={strokeWidth/2} length={1.7*width}/>)


    return (
      <div style={{paddingTop:50}}>
        {/* weather */}
        <td style={{textAlign: 'center'}}>
          <i className={centerIconClass} onClick={centerIconOnClick} style={{color: this.props.fgColor, fontSize: centerIconSize, position: 'fixed', top: this.props.size+50-centerIconSize/2, width: '100%', display: 'inline-block'}}/>
        </td>

        <div>
          <svg width={this.props.size*2} height={this.props.size*2}>
            <g>
              {/* per-year */}
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearWinterSolstice} color={this.props.fgColor} strokeWidth={strokeWidth/2} length={width}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearFallEquinox} color={this.props.fgColor} strokeWidth={strokeWidth/2} length={width}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearSummerSolstice} color={this.props.fgColor} strokeWidth={strokeWidth/2} length={width}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearSpringEquinox} color={this.props.fgColor} strokeWidth={strokeWidth/2} length={width}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearPerihelion} color={this.props.fgColor} strokeWidth={strokeWidth} length={width/2}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearAphelion} color={this.props.fgColor} strokeWidth={strokeWidth} length={width/2}/>
              <CircleSegment cx={cx} cy={cy} r={centerSize+0*spacing} width={width} startAngle={0} endAngle={rYear} color={this.props.fgColor} strokeWidth={strokeWidth}/>

              {/* per-month */}
              {forecastMonth}
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthNewMoon} color={this.props.fgColor} strokeWidth={strokeWidth} fill={this.props.bgColor}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFirstQuarterMoon} color={this.props.fgColor} strokeWidth={strokeWidth} fill={this.props.bgColor}/>
              <HalfCircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFirstQuarterMoon} leftHalf={true} color={this.props.fgColor}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFullMoon} color={this.props.fgColor} strokeWidth={strokeWidth} fill={this.props.fgColor}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthThirdQuarterMoon} color={this.props.fgColor} strokeWidth={strokeWidth} fill={this.props.bgColor}/>
              <HalfCircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthThirdQuarterMoon} leftHalf={false} color={this.props.fgColor}/>

              <CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={width} startAngle={0} endAngle={rMonth} color={this.props.fgColor} strokeWidth={strokeWidth}/>

              {/* per-day (hour) */}
              {forecastDay}
              {this.state.sunTimes ? <CircleMarker cx={cx} cy={cy} r={centerSize+2*spacing} width={1.7*width} endAngle={rDaySunrise} color={this.props.fgColor} strokeWidth={strokeWidth} fill={this.props.fgColor}/> : null}
              {this.state.sunTimes ? <CircleMarker cx={cx} cy={cy} r={centerSize+2*spacing} width={1.7*width} endAngle={rDaySunset} color={this.props.fgColor} strokeWidth={strokeWidth} fill={this.props.bgColor}/> : null}
              <CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={width} startAngle={0} endAngle={rDay} color={this.props.fgColor}/>

              {/* per-hour (minute) */}
              {forecastHour}
              <CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={width} startAngle={0} endAngle={rHour} color={this.props.fgColor}/>

              {/* per-minute (second) */}
              <Tick cx={cx} cy={cy} r={centerSize+4*spacing} endAngle={rMinute} color={this.props.fgColor} strokeWidth={strokeWidth/2} length={width}/>
            </g>
          </svg>
        </div>

        <div>
          <p style={{color: this.props.fgColor, margin: "5px", fontFamily: "Helvetica, Arial, sans-serif", fontSize: 56, fontWeight: "bold"}}>{timeString}</p>
          <p style={{color: this.props.fgColor, margin: "5px", fontSize: 24}}>{dateString}</p>
          <p style={{color: this.props.fgColor, margin: "5px", fontSize: 24}}>{locationString}</p>
          {/* <p style={{color: this.props.fgColor}}>Sunrise: {this.state.sunTimes ? this.state.sunTimes.sunrise.toLocaleTimeString() : "waiting for location"} | Sunset: {this.state.sunTimes ? this.state.sunTimes.sunset.toLocaleTimeString() : "waiting for location"}</p> */}
          {/* <p style={{color: this.props.fgColor}}>Moonphase: {this.state.moonPhase}</p> */}
        </div>
      </div>
    );
  }
}

export default geolocated()(Clock);
