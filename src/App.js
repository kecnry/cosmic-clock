import React, { Component } from 'react';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Clock size={300}/>
      </div>
    );
  }
}

class CircleSegment extends Component {
  render () {

    // see https://codepen.io/smlsvnssn/pen/FolaA/
    var startAngle = this.props.startAngle * Math.PI / 180;
    var endAngle = this.props.endAngle * Math.PI / 180;

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
      var strokeWidthInner = this.props.width - 2 * this.props.strokeWidth;

      var d = ["M", x+(r-strokeWidthInner)*Math.sin(startAngle), y-(r-strokeWidthInner)*Math.cos(startAngle),
               "A", r-strokeWidthInner, r-strokeWidthInner, 0, largeArc, 1, x+(r-strokeWidthInner)*Math.sin(endAngle), y-(r-strokeWidthInner)*Math.cos(endAngle),

               "M", x+(r+strokeWidthInner-strokeWidth)*Math.sin(startAngle), y-(r+strokeWidthInner-strokeWidth)*Math.cos(startAngle),
               "A", r+strokeWidthInner-strokeWidth, r+strokeWidthInner-strokeWidth, 0, largeArc, 1, x+(r+strokeWidthInner-strokeWidth)*Math.sin(endAngle), y-(r+strokeWidthInner-strokeWidth)*Math.cos(endAngle),

               "M", x+(r-strokeWidthInner+strokeWidth/2)*Math.sin(startAngle)+strokeWidth/2*Math.cos(startAngle), y-(r-strokeWidthInner-strokeWidth/2)*Math.cos(startAngle)+strokeWidth/2*Math.sin(startAngle),
               "L", x+(r+strokeWidthInner+strokeWidth/2)*Math.sin(startAngle)+strokeWidth/2*Math.cos(startAngle), y-(r+strokeWidthInner-strokeWidth/2)*Math.cos(startAngle)+strokeWidth/2*Math.sin(startAngle),

               "M", x+(r-strokeWidthInner-strokeWidth/2)*Math.sin(endAngle)-strokeWidth/2*Math.cos(endAngle), y-(r-strokeWidthInner-strokeWidth/2)*Math.cos(endAngle)-strokeWidth/2*Math.sin(endAngle),
               "L", x+(r+strokeWidthInner-strokeWidth/2)*Math.sin(endAngle)-strokeWidth/2*Math.cos(endAngle), y-(r+strokeWidthInner-strokeWidth/2)*Math.cos(endAngle)-strokeWidth/2*Math.sin(endAngle),
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
    var cx = this.props.size;
    var cy = this.props.size;
    var width = this.props.size/10
    var strokeWidth = this.props.size/50
    var centerSize = this.props.size/3
    var spacing = this.props.size/6
    return (
      <div>
        <div style={{margin: "auto"}}>
          <svg width={this.props.size*2} height={this.props.size*2}>
            <g>
              <CircleSegment cx={cx} cy={cy} r={centerSize+0*spacing} width={width} startAngle={0} endAngle={260} color={'black'} strokeWidth={strokeWidth}/>
              <CircleSegment cx={cx} cy={cy} r={centerSize+1*spacing} width={width} startAngle={0} endAngle={300} color={'black'} strokeWidth={strokeWidth}/>
              <CircleSegment cx={cx} cy={cy} r={centerSize+2*spacing} width={width} startAngle={0} endAngle={190} color={'black'}/>
              <CircleSegment cx={cx} cy={cy} r={centerSize+3*spacing} width={width} startAngle={0} endAngle={32} color={'black'}/>
            </g>
          </svg>
        </div>

        <h2>{1900+this.state.date.getYear()}.{this.state.date.getMonth()}.{this.state.date.getDate()} {this.state.date.getHours()}:{this.state.date.getMinutes()}:{this.state.date.getSeconds()}</h2>
      </div>
    );
  }
}
