import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import queryString from 'query-string'; // https://www.npmjs.com/package/query-string
import {CircleSegment, Tick, CircleMarker, HalfCircleMarker} from './clockComponents'
import DarkSkyApi from 'dark-sky-api'; // https://www.npmjs.com/package/dark-sky-api
import ApiCalendar from 'react-google-calendar-api'; // https://github.com/Insomniiak/react-google-calendar-api

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

var getPrecipColor = function(precipIntensity, precipProbability, precipType) {
  //https://www.quackit.com/css/css_color_codes.cfm
  if (precipType=='snow') {
    if (precipIntensity < 0.01 || precipProbability < 0.05) {
      return 'transparent'
    } else if (precipIntensity < 0.2) {
      return 'lightblue'
    } else if (precipIntensity < 0.3) {
      return 'lightskyblue'
    } else if (precipIntensity < 0.4) {
      return 'cornflowerblue'
    } else if (precipIntensity < 0.5) {
      return 'royalblue'
    } else if (precipIntensity < 0.6) {
      return 'blue'
    } else if (precipIntensity < 0.7) {
      return 'mediumblue'
    } else if (precipIntensity < 0.8) {
      return 'darkblue'
    } else if (precipIntensity < 0.9) {
      return 'navy'
    } else {
      return 'midnightblue'
    }
  } else if (precipType==='sleet') {
    if (precipIntensity < 0.01 || precipProbability < 0.05) {
      return 'transparent'
    } else if (precipIntensity < 0.2) {
      return 'mediumpurple'
    } else if (precipIntensity < 0.3) {
      return 'mediumpurple'
    } else if (precipIntensity < 0.4) {
      return 'darkviolet'
    } else if (precipIntensity < 0.5) {
      return 'darkviolet'
    } else if (precipIntensity < 0.6) {
      return 'darkviolet'
    } else if (precipIntensity < 0.7) {
      return 'indigo'
    } else if (precipIntensity < 0.8) {
      return 'indigo'
    } else if (precipIntensity < 0.9) {
      return 'indigo'
    } else {
      return 'indigo'
    }
  } else {
    // then rain or not provided
    if (precipIntensity < 0.01 || precipProbability < 0.05) {
      return 'transparent'
    } else if (precipIntensity < 0.2) {
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


}

var getTempColor = function(temp) {
  var colorsColdToHot = ["#0012ff", "#0022ff", "#0032ff", "#0044ff", "#0054ff",
                         "#0064ff", "#0074ff", "#0084ff", "#0094ff", "#00a4ff",
                         "#00b4ff", "#00c4ff", "#00d4ff", "#00e4ff", "#00fff4",
                         "#fffa00", "#fff000", "#ffe600", "#ffdc00", "#ffd200",
                         "#ffc800", "#ffbe00", "#ffb400", "#ffaa00", "#ffa000",
                         "#ff9600", "#ff8c00", "#ff8200", "#ff7800", "#ff6e00",
                         "#ff6400", "#ff5a00", "#ff4600", "#ff3c00", "#ff3200",
                         "#ff2800", "#ff1e00", "#ff1400", "#ff0a00"]

  if (temp < 0) {
    temp = 0
  }

  return colorsColdToHot[parseInt(temp/100*39, 10)];
}

DarkSkyApi.apiKey = '796616a5ef888b16148b7f659fba5725';

export default class Clock extends Component {
  state = {
    date: new Date(),
    fixedDate: null,
    sunTimes: null,
    moonPhase: null,
    calendarEvents: null,
    calendarUpdateTime: null,
    calendarUpdateIntervalMins: 10,
    weather: null,
    weatherUpdateTime: null,
    weatherUpdateIntervalMins: null,
    location: null,
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

  updateCalendar = () => {
    if (!this.props.showCalendar || this.props.fixedDate) {
      console.log("skipping updating calendar")
      return
    }
    console.log("updateCalendar");
    ApiCalendar.listUpcomingEvents(10)
      .then(({result}: any) => {
        // console.log(result.items);
        this.setState({calendarEvents: result.items, calendarUpdateTime: new Date()})

        // for (var i=0; i < this.state.calendarEvents.length; i++) {
        //   console.log(this.state.calendarEvents[i].summary)
        // }
      });
  }

  updateWeatherState = (weather) => {
    var weatherUpdateTime = weather.updatedDateTime.toDate();
    var weatherUpdateIntervalMins = 60;

    // here we'll assume we JUST got the forecast so we don't need to handle
    // subtracting weatherUpdateTime

    // even if the minutely weather is clear, if we're expecting rain in the
    // next hour, we should set the maximum to 30 mins
    if (weather.hourly.data[0].precipIntensity > 0.01 && weather.hourly.data[0].precipProbability > 0.01) {
      weatherUpdateIntervalMins = 30
    }
    if (weather.hourly.data[1].precipIntensity > 0.01 && weather.hourly.data[1].precipProbability > 0.01) {
      weatherUpdateIntervalMins = 30
    }

    // we'll start at minute 15 so that the minimum time between updates is 12 mins
    for (var min=15; min < 60; min++) {
      if (weather.minutely.data[min].precipIntensity > 0.01 && weather.minutely.data[min].precipProbability > 0.01) {
        if (0.8 * min < weatherUpdateIntervalMins) {
          weatherUpdateIntervalMins = 0.8 * min
          break
        }
      }
    }

    this.setState({weather: weather, weatherUpdateTime: weatherUpdateTime, weatherUpdateIntervalMins: weatherUpdateIntervalMins})
  }

  updateWeather = () => {
    if (!(this.props.showForecastRain || this.props.showForecastCloud || this.props.showForecastTemp) || this.props.fixedDate) {
      console.log("skipping weather update")
      return
    }
    if (this.state.location) {
      console.log("updateWeather");
      var location = {latitude: this.state.location.lat, longitude: this.state.location.long}

      DarkSkyApi.loadItAll('flags,alerts', location)
        .then(result => this.updateWeatherState(result));

      this.props.refreshForecastComplete();
    }
  }

  getDarkSkyLink = (dayOffset) => {
    var year = this.state.weatherUpdateTime.getFullYear()
    var month = this.state.weatherUpdateTime.getMonth() + 1
    var date = this.state.weatherUpdateTime.getDate() + dayOffset
    if (date > nDays[month-1]) {
      date -= nDays[month-1]
      month += 1
    }
    if (month > 12) {
      month = 1
      year += 1
    }

    return "https://darksky.net/details/"+this.state.location.lat+","+this.state.location.long+"/"+year+"-"+month+"-"+date+"/us12/en"
  }

  componentDidMount() {
    setInterval(
      () => {
          if (this.props.pauseUpdates) return

          var location = this.props.fixedLocation || this.props.liveLocation;

          if (!this.state.location && !location) {
            // nothing to do here location-wise...
            this.setState({date: this.props.fixedDate || new Date()});
          } else if (!this.state.location || (location && (location.long !== this.state.location.long || location.lat !== this.state.location.lat || ! this.state.sunTimes))) {
            // sunTimes will fail until location is available, but once it is
            // and sunTimes is set, we don't need to set until the next day
            // which the other interval will cover
            this.setState({date: this.props.fixedDate || new Date(), location: location});
            this.setState({sunTimes: this.computeSunTimes(), moonPhase: this.computeMoonPhase()});

            // clear the weather and let the checks below update it
            this.setState({weather: null});

          } else if (this.props.fixedDate !== this.state.fixedDate) {
            this.setState({date: this.props.fixedDate || new Date(), fixedDate: this.props.fixedDate});
            this.setState({sunTimes: this.computeSunTimes(), moonPhase: this.computeMoonPhase()});
          } else {
            this.setState({date: this.props.fixedDate || new Date()});
          }

          // check to see if weather is out of date and needs to be updated
          var showWeather = !this.props.fixedDate && (this.props.showForecastRain || this.props.showForecastTemp || this.props.showForecastCloud)
          var weatherMinsSinceLastUpdate = (this.state.date - this.state.weatherUpdateTime)/60000;
          var refreshWeatherFromInterval = weatherMinsSinceLastUpdate > this.state.weatherUpdateIntervalMins;
          // var refreshWeatherNewHour = (this.state.date.getMinutes()===0) && (weatherMinsSinceLastUpdate > 5)
          if (showWeather && (!this.state.weather || this.props.refreshForecast || refreshWeatherFromInterval)) {
            this.updateWeather();
          }

          var showCalendar = !this.props.fixedDate && this.props.showCalendar;
          if (showCalendar && (!this.state.calendarEvents || (this.state.date - this.state.calendarUpdateTime)/60000 > this.state.calendarUpdateIntervalMins)) {
            this.updateCalendar();
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
    this.setState({moonPhase: this.computeMoonPhase()});

  }

  render() {

    // counter for various for-loops
    var i = 0;

    // var milliseconds = this.state.date.getMilliseconds();
    var milliseconds = 0;  // use actual milliseconds if interval above is < 1000, otherwise override to 0
    var seconds = this.state.date.getSeconds() + milliseconds/1000;
    var rMinute = seconds/60;
    var minutes = this.state.date.getMinutes() + rMinute;
    var rHour = minutes/60;
    var hours = this.state.date.getHours() + rHour;
    var rDay = hours/24;
    var days = this.state.date.getDate() + rDay;
    var month = this.state.date.getMonth() + 1;
    var rMonth = (days - 1) / nDays[month-1];
    var daysTotal = rDay;
    for (i=1; i <= month; i++) {
        daysTotal += nDays[month-1]
    }
    var rYear = daysTotal/365;


    if (this.state.sunTimes) {
      var rDaySunrise = (this.state.sunTimes.sunrise.getHours() + this.state.sunTimes.sunrise.getMinutes()/60)/24;
      var sunriseTooltipText = 'sunrise today at '+this.state.sunTimes.sunrise.toLocaleTimeString();
      var rDaySunset = (this.state.sunTimes.sunset.getHours() + this.state.sunTimes.sunset.getMinutes()/60)/24;
      var sunsetTooltipText = 'sunset today at '+this.state.sunTimes.sunset.toLocaleTimeString();
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

    // DATE/TIME BELOW CLOCK
    var hours12 = this.state.date.getHours();
    if (hours12===0) {
      hours12 = 12;
    }
    if (hours12 > 12) {
      hours12 -= 12
    }
    var timeString = hours12 + ":" + ("00" + this.state.date.getMinutes()).slice(-2);
    var dateString = this.state.date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // CALENDAR
    var calendarDay = [];
    var eventDateStart = new Date()
    var eventDateEnd = new Date()
    var rDayEventStart = null;
    var rDayEventEnd = null;
    var eventTooltip = null;
    var eventLink = null;
    if (this.props.showCalendar && this.state.calendarEvents) {
      for (i=0; i < this.state.calendarEvents.length; i++) {
        eventDateStart.setTime(Date.parse(this.state.calendarEvents[i].start.dateTime))
        eventDateEnd.setTime(Date.parse(this.state.calendarEvents[i].end.dateTime))
        // show events starting within the next 24 hours but have not already completed
        if (eventDateEnd - this.state.date < 24*60*60*1000 && eventDateEnd - this.state.date > 0) {

          rDayEventStart = (eventDateStart.getHours() + eventDateStart.getMinutes()/60) / 24
          rDayEventEnd = (eventDateEnd.getHours() + eventDateEnd.getMinutes()/60) / 24
          eventTooltip = this.state.calendarEvents[i].summary + " ("+eventDateStart.toLocaleDateString()+" "+eventDateStart.toLocaleTimeString()+"-"+eventDateEnd.toLocaleTimeString()+")"
          eventLink = this.state.calendarEvents[i].htmlLink
          calendarDay.push(<CircleSegment cx={cx} cy={cy}
                                          r={centerSize+2*spacing} width={2.0*width}
                                          startAngle={rDayEventStart} endAngle={rDayEventEnd}
                                          color={this.props.fgColor} strokeWidth={0.75*strokeWidth}
                                          tooltipText={eventTooltip} tooltipLink={eventLink} onClick={this.props.displayTooltip}/>)
        }
      }
    }


    // CENTER ICON
    var centerIconClass = "wi "
    var centerIconText = null
    var centerIconOnClick = null
    if (this.props.fixedDate) {
      centerIconClass += "wi-moon-"+moonIcon[parseInt(this.state.moonPhase*28, 10)];
    } else if (this.props.showForecastRain) {
      if (this.state.weather) {
        // centerIconOnClick = this.toggleForecast
        centerIconClass += "wi-forecast-io-"+this.state.weather.currently.icon;
      } else {
        centerIconClass += "wi-rain"
      }
    } else if (this.props.showForecastTemp) {
      if (this.state.weather) {
        centerIconText = parseInt(this.state.weather.currently.temperature, 10);
      } else {
        centerIconClass += "wi-thermometer"
      }
    } else if (this.props.showForecastCloud) {
      if (!this.state.weather) {
        centerIconClass += "wi-cloudy"
      } else if (this.state.weather.currently.cloudCover > 0.5) {
        centerIconClass += "wi-cloudy"
      } else if (this.state.weather.currently.cloudCover > 0.3) {
        centerIconClass += "wi-cloud"
      } else if (rDay > rDaySunset || rDay < rDaySunrise) {
        centerIconClass += "wi-night-clear"
      } else {
        centerIconClass += "wi-day-sunny"
      }
    } else {
      centerIconClass += "wi-moon-"+moonIcon[parseInt(this.state.moonPhase*28, 10)];
    }


    // WEATHER
    var opacityFactor = 1.0
    var precipHour = [];
    var rHourWeather = null;
    var hour = null;
    var tempHour = [];
    var cloudHour = [];
    var minHour = null;
    var minHourText = null;
    var precipDay = [];
    var rDayWeather = null;
    var tempDay = []
    var cloudDay = [];
    var precipMonth = [];
    var rMonthWeather = null;
    var dayOfWeekWeather = null;
    var tempMonth = [];
    var cloudMonth = [];
    var precipIntensity = null;
    var precipProbability = null;
    var precipType = null;
    var temp = null;
    var cloudCover = null;
    var tooltipText = ''
    var tooltipLink = null;
    var color = null;
    if ((this.props.showForecastRain || this.props.showForecastCloud || this.props.showForecastTemp) && this.state.weather && !this.props.fixedDate) {

      if ("minutely" in this.state.weather) {
        // not all locations have minutely data
        var weatherMinsOld = this.state.date.getMinutes() - this.state.weatherUpdateTime.getMinutes();
        if (weatherMinsOld < 0) {
          // handle wrapping
          weatherMinsOld += 60
        }

        tooltipLink = this.getDarkSkyLink(0) // TODO: technically this will fail for next day (only near midnight)

        for (var minFuture=0; minFuture<60; minFuture++) {
          rHourWeather = (this.state.date.getMinutes() + minFuture)/60

          if (rHourWeather < 1) {
            minHour = 0
            minHourText = 'this'
          } else {
            minHour = 1
            minHourText = 'next'
          }
          if (this.state.date.getHours() > this.state.weatherUpdateTime.getHours()) {
            minHour += 1
          }

          // try to access from minutely data if within 60 mins of last update time
          if (minFuture+weatherMinsOld<60) {
            // then we can access from minutely data
            precipIntensity = this.state.weather.minutely.data[minFuture+weatherMinsOld].precipIntensity
            precipProbability = this.state.weather.minutely.data[minFuture+weatherMinsOld].precipProbability
            precipType = this.state.weather.minutely.data[minFuture+weatherMinsOld].precipType
            tooltipText = parseInt(precipProbability*100, 10)+'% chance of '+precipType+' in '+minFuture+' minutes with '+parseInt(precipIntensity*100, 10)+'% intensity.'
            opacityFactor = 1.0
          } else {
            precipIntensity = this.state.weather.hourly.data[minHour].precipIntensity
            precipProbability = this.state.weather.hourly.data[minHour].precipProbability
            precipType = this.state.weather.hourly.data[minHour].precipType
            tooltipText = parseInt(precipProbability*100, 10)+'% chance of '+precipType+' in '+minHourText+' hour with '+parseInt(precipIntensity*100, 10)+'% intensity. (minute data available in '+parseInt(this.state.weatherUpdateIntervalMins-weatherMinsOld, 10)+' minutes)'
            opacityFactor = 0.7
          }

          color = getPrecipColor(precipIntensity, precipProbability, precipType);
          precipHour.push(<CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={(1+0.8*precipProbability)*width}
                                         startAngle={rHourWeather} endAngle={rHourWeather+1.01/60}
                                         color={color} opacity={opacityFactor}
                                         tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip}/>)




           temp = this.state.weather.hourly.data[minHour].temperature;
           color = getTempColor(temp);
           tooltipText = temp+' degrees '+minHourText+' hour.'
           tempHour.push(<CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={1.5*width}
                                        startAngle={rHourWeather} endAngle={rHourWeather+1.01/60}
                                        color={color}
                                        tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip}/>)

           cloudCover = this.state.weather.hourly.data[minHour].cloudCover;
           tooltipText = parseInt(cloudCover*100, 10)+'% cloud cover '+minHourText+' hour.'
           cloudHour.push(<CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={1.5*width}
                                         startAngle={rHourWeather} endAngle={rHourWeather+1.01/60}
                                         color={this.props.fgColor} opacity={0.7*cloudCover}
                                         tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip}/>)


        }
      }

      for (var h=0; h < 24; h++) {
        // weather begins at the beginning of the LATEST hour
        rDayWeather = (this.state.weatherUpdateTime.getHours() + h)/24

        if (rDayWeather < 0 || rDayWeather > 1) {
          tooltipLink = this.getDarkSkyLink(1)
        } else {
          tooltipLink = this.getDarkSkyLink(0)
        }

        if (rDayWeather-rDay <= -1/24) {
          // we'll never be more than one hour behind
          // opacityFactor = 0.7
          hour = h+24
        } else {
          // opacityFactor = 1.0
          hour = h
        }

        precipIntensity = this.state.weather.hourly.data[hour].precipIntensity
        precipProbability = this.state.weather.hourly.data[hour].precipProbability
        precipType = this.state.weather.hourly.data[hour].precipType
        color = getPrecipColor(precipIntensity, precipProbability, precipType);
        tooltipText = parseInt(precipProbability*100, 10)+'% chance of '+precipType+' starting in '+((rDayWeather-rDay)*24).toFixed(1)+' hours with '+parseInt(precipIntensity*100, 10)+'% intensity.'
        precipDay.push(<CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={(1+0.8*precipProbability)*width}
                                      startAngle={rDayWeather} endAngle={rDayWeather+1.01/24}
                                      color={color} opacity={1.0}
                                      tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip} />)

        temp = this.state.weather.hourly.data[hour].temperature;
        color = getTempColor(temp);
        tooltipText = temp+' degrees in '+hour+' hours.'
        tempDay.push(<CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={1.5*width}
                                    startAngle={rDayWeather} endAngle={rDayWeather+1.01/24}
                                    color={color} opacity={1.0}
                                    tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip}/>)

        cloudCover = this.state.weather.hourly.data[hour].cloudCover;
        tooltipText = parseInt(cloudCover*100, 10)+'% cloud cover in '+hour+' hours.'
        cloudDay.push(<CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={1.5*width}
                                     startAngle={rDayWeather} endAngle={rDayWeather+1.01/24}
                                     color={this.props.fgColor} opacity={0.7*cloudCover}
                                     tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip}/>)
      }
      // since the last hour++ has already happened, we'll draw this at hour+delta
      // precipDay.push(<Tick cx={cx} cy={cy} r={centerSize+2*spacing}
      //                       endAngle={rDayWeather+1.01/24}
      //                       color={getPrecipColor(0.1, 1)} strokeWidth={strokeWidth/2} length={1.8*width}/>)

      for (var day=0; day <= 7; day++) {
        // not sure how rMonthWeather will handle wrapping over months
        rMonthWeather = (this.state.weatherUpdateTime.getDate() - 1 + day) / nDays[month-1]
        if (rMonthWeather > 1 ) {
          rMonthWeather -= 1
        }
        tooltipLink = this.getDarkSkyLink(day)
        // this may also be assuming locale time with Sunday at day 0
        if (day === 0) {
          dayOfWeekWeather = 'today'
        } else if (day === 1) {
          dayOfWeekWeather = 'tomorrow'
        } else {
          dayOfWeekWeather = 'on '+['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][this.state.weatherUpdateTime.getDay()+day]
        }
        precipIntensity = this.state.weather.daily.data[day].precipIntensityMax
        precipProbability = this.state.weather.daily.data[day].precipProbability
        precipType = this.state.weather.daily.data[day].precipType
        color = getPrecipColor(precipIntensity, precipProbability, precipType);
        tooltipText = parseInt(precipProbability*100, 10)+'% chance of '+precipType+' '+dayOfWeekWeather+' with '+parseInt(precipIntensity*100, 10)+'% maximum intensity.'
        precipMonth.push(<CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={(1+0.8*precipProbability)*width}
                                        startAngle={rMonthWeather} endAngle={rMonthWeather+1.01/nDays[month-1]}
                                        color={color}
                                        tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip} />)

        temp = this.state.weather.daily.data[day].temperatureMax;
        color = getTempColor(temp);
        tooltipText = temp+' degrees (max) '+dayOfWeekWeather+'.'
        tempMonth.push(<CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={1.5*width}
                                      startAngle={rMonthWeather} endAngle={rMonthWeather+1.01/nDays[month-1]}
                                      color={color}
                                      tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip}/>)

        cloudCover = this.state.weather.daily.data[day].cloudCover;
        tooltipText = parseInt(cloudCover*100, 10)+'% cloud cover '+dayOfWeekWeather+'.'
        cloudMonth.push(<CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={1.5*width}
                                       startAngle={rMonthWeather} endAngle={rMonthWeather+1.01/nDays[month-1]}
                                       color={this.props.fgColor} opacity={0.7*cloudCover}
                                       tooltipText={tooltipText} tooltipLink={tooltipLink} onClick={this.props.displayTooltip}/>)

      }
      // since the last day++ has already happened, we'll draw this at day+delta instead of day+1
      precipMonth.push(<Tick cx={cx} cy={cy} r={centerSize+1*spacing}
                             endAngle={rMonthWeather+1.01/nDays[month-1]}
                             color={getPrecipColor(0.1, 1)} strokeWidth={strokeWidth/2} length={1.8*width}/>)
    }



    return (
      <div style={{paddingTop:50}}>
        {/* center icon : height set to 0 so as not to block click targets on svg elements below */}
        <td style={{textAlign: 'center', zIndex: -999, height: "0px"}}>
          <i style={{color: this.props.fgColor, fontSize: centerIconSize, position: 'fixed', top: this.props.size+50-centerIconSize/2, width: '100%', height: "0px", display: 'inline-block'}}>
            <Link to={{pathname: process.env.PUBLIC_URL + '/', search: queryString.stringify(this.props.cycleForecastNextQuery, {encode: false})}}>
              {centerIconText ?
                <span onClick={centerIconOnClick}>{centerIconText}&deg;</span> :
                <span className={centerIconClass} onClick={centerIconOnClick}></span>
              }
            </Link>
          </i>
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
              {this.props.showForecastCloud ? cloudMonth : null}
              {this.props.showForecastTemp ? tempMonth : null}
              {this.props.showForecastRain ? precipMonth : null}
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthNewMoon} color={this.props.fgColor} strokeWidth={strokeWidth} fill={'transparent'}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFirstQuarterMoon} color={this.props.fgColor} strokeWidth={strokeWidth} fill={'transparent'}/>
              <HalfCircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFirstQuarterMoon} leftHalf={true} color={this.props.fgColor}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthFullMoon} color={this.props.fgColor} strokeWidth={strokeWidth} fill={this.props.fgColor}/>
              <CircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthThirdQuarterMoon} color={this.props.fgColor} strokeWidth={strokeWidth} fill={'transparent'}/>
              <HalfCircleMarker cx={cx} cy={cy} r={centerSize+1*spacing} width={0.9*width} endAngle={rMonthThirdQuarterMoon} leftHalf={false} color={this.props.fgColor}/>

              <CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={width} startAngle={0} endAngle={rMonth} color={this.props.fgColor} strokeWidth={strokeWidth}/>

              {/* per-day (hour) */}
              {this.props.showForecastCloud ? cloudDay : null}
              {this.props.showForecastTemp ? tempDay : null}
              {this.props.showForecastRain ? precipDay : null}
              {this.props.showCalendar ? calendarDay : null}
              <CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={width} startAngle={0} endAngle={rDay} color={this.props.fgColor}/>
              {this.state.sunTimes ? <CircleMarker cx={cx} cy={cy} r={centerSize+2*spacing} width={1.7*width} endAngle={rDaySunrise} color={this.props.fgColor} strokeWidth={strokeWidth} fill={this.props.fgColor} tooltipText={sunriseTooltipText} onClick={this.props.displayTooltip}/> : null}
              {this.state.sunTimes ? <CircleMarker cx={cx} cy={cy} r={centerSize+2*spacing} width={1.7*width} endAngle={rDaySunset} color={this.props.fgColor} strokeWidth={strokeWidth} fill={'transparent'} tooltipText={sunsetTooltipText} onClick={this.props.displayTooltip}/> : null}

              {/* per-hour (minute) */}
              {this.props.showForecastCloud ? cloudHour : null}
              {this.props.showForecastTemp ? tempHour : null}
              {this.props.showForecastRain ? precipHour : null}
              <CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={width} startAngle={0} endAngle={rHour} color={this.props.fgColor}/>

              {/* per-minute (second) */}
              <Tick cx={cx} cy={cy} r={centerSize+4*spacing} endAngle={rMinute} color={this.props.fgColor} strokeWidth={strokeWidth/2} length={width}/>
            </g>
          </svg>
        </div>

        <div>
          <Link style={{color: this.props.fgColor, margin: "5px", display: "inherit", fontFamily: "Helvetica, Arial, sans-serif", fontSize: 56, fontWeight: "bold"}} to={{pathname: process.env.PUBLIC_URL + '/datetime', search: this.props.search}}>{timeString}</Link>
          <Link style={{color: this.props.fgColor, margin: "5px", display: "inherit", fontSize: 24, fontWeight: "normal"}} to={{pathname: process.env.PUBLIC_URL + '/datetime', search: this.props.search}}>{dateString}</Link>
          <Link style={{color: this.props.fgColor, margin: "5px", display: "inherit", fontSize: 24, fontWeight: "normal"}} to={{pathname: process.env.PUBLIC_URL + '/location', search: this.props.search}}>{this.props.locationName}</Link>
          {/* <p style={{color: this.props.fgColor}}>Sunrise: {this.state.sunTimes ? this.state.sunTimes.sunrise.toLocaleTimeString() : "waiting for location"} | Sunset: {this.state.sunTimes ? this.state.sunTimes.sunset.toLocaleTimeString() : "waiting for location"}</p> */}
          {/* <p style={{color: this.props.fgColor}}>Moonphase: {this.state.moonPhase}</p> */}
        </div>
      </div>
    );
  }
}
