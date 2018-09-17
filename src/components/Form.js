import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from "d3";
import { scaleBand, scaleOrdinal, scaleLinear, schemeCategory20, axisBottom } from 'd3-scale';
import { select } from 'd3-selection';
import './Form.css';

class Form extends Component {
    constructor(props){
        super();
        this.state = {
            products: [],
            results: [],
            product_select: "spyglass",
            test_suite_select: "regress"
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleProdcutChange = this.handleProdcutChange.bind(this);
        this.handleTestChange = this.handleTestChange.bind(this);
    }

    componentDidMount() {
        axios.get('http://localhost:4000/api/products')
            .then(res => {
            const products = res.data;
            this.setState({products});
        })
    }

    handleSubmit(event) {
        event.preventDefault();
        var config = {
        headers: {
            Accept: "Access-Control-Allow-Headers",
            "Content-Type": "application/json"
        }
    };
    axios.post('http://localhost:4000/api/search',
    {
        product_select: this.state.product_select,
        test_suite_select: this.state.test_suite_select
    }, config)
        .then(res => {
            console.log(res);
            this.setState({results: res.data.objArr});
            console.log(this.state.results);
            var data = this.state.results;
            this.drawChart(data);
        }
    )
    }

    handleProdcutChange(event) {
        this.setState({product_select: event.target.value});
    }

    handleTestChange(event){
        this.setState({test_suite_select: event.target.value});
    }

    drawChart(data){
      var data = [
             {
                  "interest_rate":"< 4%",
                  "Default":60,
                  "Charge-off":20,
                  "Current":456,
                  "30 days":367.22,
                  "60 days":222,
                  "90 days":198,
                  "Default":60

               },
               {
                  "interest_rate":"4-7.99%",
                  "Charge-off":2,
                  "Default":30,
                  "Current":271,
                  "30 days":125,
                  "60 days":78,
                  "90 days":72


               }
      ];

      	var margin = {
      				top: 20,
      				right: 20,
      				bottom: 40,
      				left: 60
      			},
      				width = 450 - margin.left - margin.right,
      				height = 315 - margin.top - margin.bottom,
      				that = this;
              // d3.scaleBand()
              //     .range([range])
              //     .round([round]);

      			var x = d3.scaleBand().range([0, width]).paddingInner(0.3);

      			var y = d3.scaleLinear().rangeRound([height, 0]);

      			var color = d3.scaleOrdinal(d3.schemeCategory10);

      			var xAxis = d3.axisBottom().scaleOrdinal(x).orient("bottom");

      			var yAxis = d3.axisLeft().scaleLinear(y).orient("left").tickFormat(d3.format(".0%"));

      			var svg = d3.select("#chart").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      			color.domain(d3.keys(data[0]).filter(function (key) {
      				return key !== "interest_rate";
      			}));


      			data.forEach(function (d) {
      				var y0 = 0;

      				d.rates = color.domain().map(function (name) {
      					console.log();;
      					return {
      						name: name,
      						y0: y0,
      						y1: y0 += +d[name],
      						amount: d[name]
      					};
      				});
      				d.rates.forEach(function (d) {
      					d.y0 /= y0;
      					d.y1 /= y0;
      				});

      				console.log(data);
      			});

      			data.sort(function (a, b) {
      				return b.rates[0].y1 - a.rates[0].y1;
      			});

      			x.domain(data.map(function (d) {
      				return d.interest_rate;
      			}));

      			svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

      			svg.append("g").attr("class", "y axis").call(yAxis);

      			var interest_rate = svg.selectAll(".interest-rate").data(data).enter().append("g").attr("class", "interest-rate").attr("transform", function (d) {
      				return "translate(" + x(d.interest_rate) + ",0)";
      			});

      			interest_rate.selectAll("rect").data(function (d) {
      				return d.rates;
      			}).enter().append("rect").attr("width", x.rangeBand()).attr("y", function (d) {
      				return y(d.y1);
      			}).attr("height", function (d) {
      				return y(d.y0) - y(d.y1);
      			}).style("fill", function (d) {
      				return color(d.name);
      			}).on('mouseover', function (d) {
      				var total_amt;
      				total_amt = d.amount;



      				console.log('----');
      				d3.select(".chart-tip").style('opacity', '1').html('Amount: <strong>$' + that.numberWithCommas(total_amt.toFixed(2)) + '</strong>');

      			}).on('mouseout', function () {
      				d3.select(".chart-tip").style('opacity', '0');
      			});

      			var legend = svg.selectAll(".legend").data(color.domain().slice().reverse()).enter().append("g").attr("class", "legend").attr("transform", function (d, i) {
      				return "translate(" + i * -70 + ",283)";
      			});


      			legend.append("rect").attr("x", width + -53).attr("width", 10).attr("height", 10).style("fill", color);

      			legend.append("text").attr("x", width - 40).attr("y", 5).attr("width", 40).attr("dy", ".35em").style("text-anchor", "start").text(function (d) {
      				return d;
      			});


      };

    render() {
        var style = {
            marginTop: '80px'
        };

    return (

        <div className="container" style={style}>
            <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label>PRODUCT</label>
                            <select className="form-control" id="product-select" name="product_select" onChange={this.handleProdcutChange}>
                            {this.state.products.map((pro) =>
                                <option key={pro} value={pro}>{pro}</option>
                            )}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-group">
                            <label>TEST SUITE</label>
                            <select className="form-control" id="test-suite-select" name="test_suite_select" onChange={this.handleTestChange}>
                                <option value="regress">regression</option>
                                <option value="bench">benchmark</option>
                            </select>
                        </div>
                    </div>
                </div>
                <input type="submit" value="submit" className="btn btn-primary" style={{float: 'left'}}/>
            </form>
            <br />
            <br />
            <hr />
            <div className="row">
                <table className="table table-striped table-bordered">
                    <thead>
                    <tr>
                      <th>version</th>
                      <th>nodata</th>
                      <th>nolevel</th>
                    </tr>
                    </thead>
                    <tbody>
                      {this.state.results.map((pro, i) => {
                          return (
                            <tr key={i.toString()}>
                              <td>{pro.version}</td>
                              <td>{pro.nodata}</td>
                              <td>{pro.nolevel}</td>
                            </tr>
                          )
                        }
                      )}
                    </tbody>
                </table>
            </div>
            <div className="row">
              <div id="chart">

              </div>
            </div>
        </div>
        );
    }
}

export default Form;
