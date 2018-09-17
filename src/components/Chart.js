import React, { Component } from 'react';
import * as d3 from "d3";
import { ScaleBand, ScaleLinear, schemeCategory20 } from 'd3-scale';
import { select } from 'd3-selection';

var width = 900;
var height = 600;

class Chart extends Component {

  componentDidMount(){
    this.drawChart();
  }

  drawChart(){
    const svg = d3.selection("#stacked")
    const margin = {top: 20, right: 180, bottom: 30, left: 40}
    const width = +svg.attr("width") - margin.left - margin.right
    const height = +svg.attr("height") - margin.top - margin.bottom
    const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.3).align(0.3);

    var y = d3.scaleLinear().rangeRound([height, 0]);

    var z = d3.scaleOrdinal().range(["red", "green", "blue", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var stack = d3.stack();

    d3.json("http://localhost:4000/api/test", function(error, data) {
      if (error) throw error;

      data.sort(function(a, b) { return b.total - a.total; });

      x.domain(data.map(function(d) { return d.ethnicity; }));
      y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
      z.domain(data.columns.slice(1));

      g.selectAll(".serie")
        .data(stack.keys(data.columns.slice(1))(data))
        .enter().append("g")
          .attr("class", "serie")
          .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d.data.ethnicity); })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })
          .attr("width", x.bandwidth());

      g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));
    });
    var t;
    function type(d, i, columns) {
      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
      d.total = t;
      return d;
    }
  }

  // var margin = {top: 20, right: 180, bottom: 30, left: 40};


  render() {
    return (
      <svg id="stacked" height={height} width={width}>
        <g transform={`translate(40,20)`}></g>
      </svg>

  );
}
}
export default Chart;
