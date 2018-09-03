import React, { Component } from 'react';


export class CircleSegment extends Component {
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

    var d = null;
    if (this.props.strokeWidth) {
      var strokeWidthInner = (this.props.width)/2;

      d = ["M", x+(r-strokeWidthInner+strokeWidth/2)*Math.sin(startAngle), y-(r-strokeWidthInner+strokeWidth/2)*Math.cos(startAngle),
           "A", r-strokeWidthInner+strokeWidth/2, r-strokeWidthInner+strokeWidth/2, 0, largeArc, 1, x+(r-strokeWidthInner+strokeWidth/2)*Math.sin(endAngle), y-(r-strokeWidthInner+strokeWidth/2)*Math.cos(endAngle),

           "M", x+(r+strokeWidthInner-strokeWidth/2)*Math.sin(startAngle), y-(r+strokeWidthInner-strokeWidth/2)*Math.cos(startAngle),
           "A", r+strokeWidthInner-strokeWidth/2, r+strokeWidthInner-strokeWidth/2, 0, largeArc, 1, x+(r+strokeWidthInner-strokeWidth/2)*Math.sin(endAngle), y-(r+strokeWidthInner-strokeWidth/2)*Math.cos(endAngle),

           "M", x+(r-strokeWidthInner)*Math.sin(startAngle)+strokeWidth/2*Math.cos(startAngle), y-(r-strokeWidthInner)*Math.cos(startAngle)+strokeWidth/2*Math.sin(startAngle),
           "L", x+(r+strokeWidthInner)*Math.sin(startAngle)+strokeWidth/2*Math.cos(startAngle), y-(r+strokeWidthInner)*Math.cos(startAngle)+strokeWidth/2*Math.sin(startAngle),

           "M", x+(r-strokeWidthInner)*Math.sin(endAngle)-strokeWidth/2*Math.cos(endAngle), y-(r-strokeWidthInner)*Math.cos(endAngle)-strokeWidth/2*Math.sin(endAngle),
           "L", x+(r+strokeWidthInner)*Math.sin(endAngle)-strokeWidth/2*Math.cos(endAngle), y-(r+strokeWidthInner)*Math.cos(endAngle)-strokeWidth/2*Math.sin(endAngle),
          ].join(" ");

    } else {
      d = ["M", x+r*Math.sin(startAngle), y-r*Math.cos(startAngle),
           "A", r, r, 0, largeArc, 1, x+r*Math.sin(endAngle), y-r*Math.cos(endAngle)
          ].join(" ");

    }

    return (
      <path d={d} stroke={this.props.color} strokeWidth={strokeWidth} fill={"none"} opacity={this.props.opacity} />
    )
  }
}

export class Tick extends Component {
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

export class CircleMarker extends Component {
  render () {
    var endAngle = this.props.endAngle * 2 * Math.PI;

    var x = this.props.cx + this.props.r * Math.sin(endAngle);
    var y = this.props.cy - this.props.r * Math.cos(endAngle);

    var radius = this.props.width/2

    return (
      <circle cx={x} cy={y} r={radius} stroke={this.props.color} strokeWidth={this.props.strokeWidth} fill={this.props.fill} />
    )
  }
}

export class HalfCircleMarker extends Component {
  render () {
    var endAngle = this.props.endAngle * 2 * Math.PI;

    var x = this.props.cx + this.props.r * Math.sin(endAngle);
    var y = this.props.cy - this.props.r * Math.cos(endAngle);

    var radius = this.props.width/2

    if (this.props.leftHalf) {
      var direction = 0
    } else {
      direction = 1
    }

    var d = ["M", x, y,
             "L", x+radius*Math.sin(endAngle), y-radius*Math.cos(endAngle),
             "A", radius, radius, 0, 0, direction, x-radius*Math.sin(endAngle), y+radius*Math.cos(endAngle)
             ].join(" ");

    return (
      <path d={d} stroke={null} fill={this.props.color} />
    )
  }
}
