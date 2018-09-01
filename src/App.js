import React, { Component } from 'react';
import './App.css';


// NOTE: this does not account for a leap year.
var nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Clock size={300} color={'white'}/>
      </div>
    );
  }
}

class CircleSegment extends Component {
  render () {

    // see https://codepen.io/smlsvnssn/pen/FolaA/
    var startAngle = this.props.startAngle * 2 * Math.PI;
    var endAngle = this.props.endAngle * 2 * Math.PI;

    // console.log("startAngle: "+startAngle+" endAngle: "+endAngle);

    var r = this.props.r;
    var x = this.props.cx;
    var y= this.props.cy;

    if (startAngle > endAngle) {
      var s = startAngle;
      startAngle = endAngle;
      endAngle = s;
    }
    if (endAngle - startAngle > Math.PI * 2) {
      endAngle = Math.PI * 1.99999;
    }

    var largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;


    var strokeWidth = this.props.strokeWidth || this.props.width;

    if (this.props.strokeWidth) {
      var strokeWidthInner = (this.props.width)/2;

      var d = ["M", x+(r-strokeWidthInner+strokeWidth/2)*Math.sin(startAngle), y-(r-strokeWidthInner+strokeWidth/2)*Math.cos(startAngle),
               "A", r-strokeWidthInner+strokeWidth/2, r-strokeWidthInner+strokeWidth/2, 0, largeArc, 1, x+(r-strokeWidthInner+strokeWidth/2)*Math.sin(endAngle), y-(r-strokeWidthInner+strokeWidth/2)*Math.cos(endAngle),

               "M", x+(r+strokeWidthInner-strokeWidth/2)*Math.sin(startAngle), y-(r+strokeWidthInner-strokeWidth/2)*Math.cos(startAngle),
               "A", r+strokeWidthInner-strokeWidth/2, r+strokeWidthInner-strokeWidth/2, 0, largeArc, 1, x+(r+strokeWidthInner-strokeWidth/2)*Math.sin(endAngle), y-(r+strokeWidthInner-strokeWidth/2)*Math.cos(endAngle),

               "M", x+(r-strokeWidthInner)*Math.sin(startAngle)+strokeWidth/2*Math.cos(startAngle), y-(r-strokeWidthInner)*Math.cos(startAngle)+strokeWidth/2*Math.sin(startAngle),
               "L", x+(r+strokeWidthInner)*Math.sin(startAngle)+strokeWidth/2*Math.cos(startAngle), y-(r+strokeWidthInner)*Math.cos(startAngle)+strokeWidth/2*Math.sin(startAngle),

               "M", x+(r-strokeWidthInner)*Math.sin(endAngle)-strokeWidth/2*Math.cos(endAngle), y-(r-strokeWidthInner)*Math.cos(endAngle)-strokeWidth/2*Math.sin(endAngle),
               "L", x+(r+strokeWidthInner)*Math.sin(endAngle)-strokeWidth/2*Math.cos(endAngle), y-(r+strokeWidthInner)*Math.cos(endAngle)-strokeWidth/2*Math.sin(endAngle),
              ].join(" ");

    } else {
      var d = ["M", x+r*Math.sin(startAngle), y-r*Math.cos(startAngle),
               "A", r, r, 0, largeArc, 1, x+r*Math.sin(endAngle), y-r*Math.cos(endAngle)
              ].join(" ");

    }

    return (
      <path d={d} stroke={this.props.color} strokeWidth={strokeWidth} fill={"none"} />
    )
  }
}

class Tick extends Component {
  render () {

    var endAngle = this.props.endAngle * 2 * Math.PI;
    var strokeWidthInner = this.props.length/2;
    var strokeWidth = this.props.strokeWidth;

    var r = this.props.r;
    var x = this.props.cx;
    var y= this.props.cy;

    var d = ["M", x+(r-strokeWidthInner)*Math.sin(endAngle)-strokeWidth/2*Math.cos(endAngle), y-(r-strokeWidthInner)*Math.cos(endAngle)-strokeWidth/2*Math.sin(endAngle),
             "L", x+(r+strokeWidthInner)*Math.sin(endAngle)-strokeWidth/2*Math.cos(endAngle), y-(r+strokeWidthInner)*Math.cos(endAngle)-strokeWidth/2*Math.sin(endAngle),


            ].join(" ");

    return (
      <path d={d} stroke={this.props.color} strokeWidth={this.props.strokeWidth} fill={"none"} />
    )
  }
}

class Clock extends Component {
  state = {
    date: new Date(),
  }

  componentDidMount() {
    setInterval(
      () => this.setState({ date: new Date() }),
      1000
    );
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

    var cx = this.props.size;
    var cy = this.props.size;
    var width = this.props.size/12
    var strokeWidth = this.props.size/100
    var centerSize = this.props.size/3
    var spacing = this.props.size/6.5

    var dateString = this.state.date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div>
        <div style={{margin: "auto"}}>
          <svg width={this.props.size*2} height={this.props.size*2}>
            <g>
              {/* per-year */}
              <CircleSegment cx={cx} cy={cy} r={centerSize+0*spacing} width={width} startAngle={0} endAngle={rYear} color={this.props.color} strokeWidth={strokeWidth}/>

              {/* per-month */}
              <CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={width} startAngle={0} endAngle={rMonth} color={this.props.color} strokeWidth={strokeWidth}/>

              {/* per-day (hour) */}
              <CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={width} startAngle={0} endAngle={rDay} color={this.props.color}/>

              {/* per-hour (minute) */}
              <CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={width} startAngle={0} endAngle={rHour} color={this.props.color}/>

              {/* per-minute (second) */}
              <Tick cx={cx} cy={cy} r={centerSize+4*spacing} endAngle={rMinute} color={this.props.color} strokeWidth={strokeWidth/2} length={width}/>
            </g>
          </svg>
        </div>

        <h2 style={{color: this.props.color}}>{this.state.date.toLocaleTimeString()}<br/>{dateString}</h2>
      </div>
    );
  }
}
