import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import ChildChart from './ChildChart';
import Test from './Test';

class Chart extends Component {
    constructor(props){
        super(props);
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
    };

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
            this.drawChart(this.state.results);          
            
        })
    }


    handleProdcutChange(event) {
        this.setState({product_select: event.target.value});
    }

    handleTestChange(event){
        this.setState({test_suite_select: event.target.value});
    };

    updateChart(){
        console.log('update')
        // this.drawChart(this.state.results);
    }

    drawChart(data){

        var margin = {top: 20, right: 160, bottom: 35, left: 30};
        var width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Transpose the data into layers
        var dataset = d3.layout.stack()(["nodata", "nolevel"].map(function(y) {
            return data.map(function(d) {
                return {x: d.version, y: +d[y]};
            });

        }));
        console.log(dataset)

        // Set x, y and colors
        var x = d3.scale.ordinal()
            .domain(dataset[0].map(function(d) { console.log(d.x); return d.x; }))
            .rangeRoundBands([0, width], 0.05);

        var y = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
            .range([height, 0]);

        var colors = ["#63C09F", "#55A8BC"];

        // Define and draw axes
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
            .tickSize(0.5, 0.5)
            .tickFormat( function(d) { return d } );

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(0.5, 0.5)

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Create groups for each series, rects for each segment
        var groups = svg.selectAll("g.product-group")
            .data(dataset)
            .enter().append("g")
            .attr("class", "product-group")
            .style("fill", function(d, i) { return colors[i]; });

        var rect = groups.selectAll("rect")
            .data(function(d) { return d; })
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y0 + d.y); })
            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
            .attr("width", x.rangeBand)

        var legend = svg.selectAll(".legend")
            .data(colors)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d, i) {return colors.slice().reverse()[i];});

        legend.append("text")
            .attr("x", width + 5)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d, i) {
            switch (i) {
                case 0: return "nolevel";
                case 1: return "nodata";
            }
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
            <br/>
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
                    {/* <ChildChart data={this.state.results} drawChart={this.drawChart}/> */}
              </div>
            </div>  
            <div>
                {/* <Test data={this.state.results}/> */}
            </div>      
        </div>
        );
    }
}

export default Chart;   
