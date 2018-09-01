import React, { Component } from 'react';
import {CircleSegment, Tick, CircleMarker, HalfCircleMarker} from './clockComponents'
import {geolocated} from 'react-geolocated'; // https://www.npmjs.com/package/react-geolocated
var SunCalc = require('suncalc'); // https://github.com/mourner/suncalc

// NOTE: this does not account for a leap year.
var nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var bgColor = "rgb(33, 44, 64)"


class Clock extends Component {
  state = {
    date: new Date(),
    location: null,
    sunTimes: null,
    moonPhase: null,
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
    console.log("computeMoonPhase ");
    return(SunCalc.getMoonIllumination(this.state.date).phase);
  }

  componentDidMount() {
    setInterval(
      () => {
          this.setState({date: this.props.date || new Date()});

          if (this.props.location && this.props.location.label) {
            // then read from the user-provided locatoin
            var location = {lat: this.props.location.location.lat, long: this.props.location.location.lng}
          } else if (this.props.coords) {
            // then read from the browser location
            var location = {lat: this.props.coords.latitude, long: this.props.coords.longitude}
          } else {
            // then no location available
            var location = null
          }
          if (!this.state.location || (location && (location.long != this.state.location.long || location.lat != this.state.location.lat || ! this.state.sunTimes))) {
            // sunTimes will fail until location is available, but once it is
            // and sunTimes is set, we don't need to set until the next day
            // which the other interval will cover
            this.setState({location: location});
            this.setState({sunTimes: this.computeSunTimes()});

          }
        },
        1000
    );
    setInterval(
      () => this.setState({sunTimes: this.computeSunTimes(), moonPhase: this.computeMoonPhase()}),
      1000*60*60*24
    );
    this.setState({moonPhase: this.computeMoonPhase()});

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
    var spacing = this.props.size/6.5

    var hours12 = this.state.date.getHours();
    if (hours12 > 12) {
      hours12 -= 12
    }
    var timeString = ("00" + hours12).slice (-2) + ":" + ("00" + this.state.date.getMinutes()).slice(-2);
    var dateString = this.state.date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div style={{paddingTop:50}}>
        <div>
          <svg width={this.props.size*2} height={this.props.size*2}>
            <g>
              {/* per-year */}
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearWinterSolstice} color={this.props.color} strokeWidth={strokeWidth/2} length={width}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearFallEquinox} color={this.props.color} strokeWidth={strokeWidth/2} length={width}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearSummerSolstice} color={this.props.color} strokeWidth={strokeWidth/2} length={width}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearSpringEquinox} color={this.props.color} strokeWidth={strokeWidth/2} length={width}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearPerihelion} color={this.props.color} strokeWidth={strokeWidth} length={width/2}/>
              <Tick cx={cx} cy={cy} r={centerSize+0*spacing} endAngle={rYearAphelion} color={this.props.color} strokeWidth={strokeWidth} length={width/2}/>
              <CircleSegment cx={cx} cy={cy} r={centerSize+0*spacing} width={width} startAngle={0} endAngle={rYear} color={this.props.color} strokeWidth={strokeWidth}/>

              {/* per-month */}
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthNewMoon} color={this.props.color} strokeWidth={strokeWidth} fill={bgColor}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFirstQuarterMoon} color={this.props.color} strokeWidth={strokeWidth} fill={bgColor}/>
              <HalfCircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFirstQuarterMoon} leftHalf={true} color={this.props.color}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFullMoon} color={this.props.color} strokeWidth={strokeWidth} fill={this.props.color}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthThirdQuarterMoon} color={this.props.color} strokeWidth={strokeWidth} fill={bgColor}/>
              <HalfCircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthThirdQuarterMoon} leftHalf={false} color={this.props.color}/>

              <CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={width} startAngle={0} endAngle={rMonth} color={this.props.color} strokeWidth={strokeWidth}/>

              {/* per-day (hour) */}
              {this.state.sunTimes ? <CircleMarker cx={cx} cy={cy} r={centerSize+2*spacing} width={1.7*width} endAngle={rDaySunrise} color={this.props.color} strokeWidth={strokeWidth} fill={this.props.color}/> : null}
              {this.state.sunTimes ? <CircleMarker cx={cx} cy={cy} r={centerSize+2*spacing} width={1.7*width} endAngle={rDaySunset} color={this.props.color} strokeWidth={strokeWidth} fill={bgColor}/> : null}
              <CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={width} startAngle={0} endAngle={rDay} color={this.props.color}/>

              {/* per-hour (minute) */}
              <CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={width} startAngle={0} endAngle={rHour} color={this.props.color}/>

              {/* per-minute (second) */}
              <Tick cx={cx} cy={cy} r={centerSize+4*spacing} endAngle={rMinute} color={this.props.color} strokeWidth={strokeWidth/2} length={width}/>
            </g>
          </svg>
        </div>

        <div>
          <p style={{color: this.props.color, margin: "5px", fontFamily: "Helvetica, Arial, sans-serif", fontSize: 56, fontWeight: "bold"}}>{timeString}</p>
          <p style={{color: this.props.color, margin: "5px", fontSize: 24}}>{dateString}</p>
          {/* <p style={{color: this.props.color}}>Sunrise: {this.state.sunTimes ? this.state.sunTimes.sunrise.toLocaleTimeString() : "waiting for location"} | Sunset: {this.state.sunTimes ? this.state.sunTimes.sunset.toLocaleTimeString() : "waiting for location"}</p> */}
          {/* <p style={{color: this.props.color}}>Moonphase: {this.state.moonPhase}</p> */}
        </div>
      </div>
    );
  }
}

export default geolocated()(Clock);
