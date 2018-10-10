import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import './Chart.css'

class Chart extends Component {
    constructor(props){
        super(props);
        // Define the state for the component
        this.state = {
            products: [],
            results: [],
            product_select: "spyglass",
            test_suite_select: "regress"
        }
        // Bind the functions 
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleProdcutChange = this.handleProdcutChange.bind(this);
        this.handleTestChange = this.handleTestChange.bind(this);
        this.drawChart = this.drawChart.bind(this);
    }

    // Life cycle hook to set the product names once the component is loaded
    componentDidMount() {
        // Get product names dynamically from database
        axios.get('http://localhost:4000/api/products')
            .then(res => {
            // Set the product names to the state array called products
            this.setState({products: res.data});
        })
    };

    // Function to send the input data to the backend
    handleSubmit(event) {
        event.preventDefault();
        var config = {
        headers: {
            // Set headers to avoid errors in fetching data
            Accept: "Access-Control-Allow-Headers",
            "Content-Type": "application/json"
        }
    };
    // Send a POST request
    axios.post('http://localhost:4000/api/search',
    {
        // Send the data to the serevr for a POST request
        product_select: this.state.product_select,
        test_suite_select: this.state.test_suite_select
    }, config)
        .then(res => {
            // Set the data to the state array called results
            this.setState({results: res.data.objArr});
            // Call drawChart function to draw the chart using incoming data
            this.drawChart(this.state.results);
        })
    }

    // Function to handle input changes in product selection
    handleProdcutChange(event) {
        this.setState({product_select: event.target.value});
    }

    // Function to handle input changes in suite selection
    handleTestChange(event){
        this.setState({test_suite_select: event.target.value});
    };

    // Function to draw the chart using fetched data from MongoDB
    drawChart(data){
        var chart = document.getElementById("chart");
        
        // check the HTML code stored in chart
        if(chart.innerHTML !== ""){
            // if it's not empty, make it empty - replace the chart when state is changed
            chart.innerHTML = "";
        }
        // set the margins for the svg and decide its dimensions
        var margin = {top: 100, right: 160, bottom: 100, left: 70};
        var width = 1200 - margin.left - margin.right,
            height = 1000 - margin.top - margin.bottom;

        // select the section with id chart from DOM and add the svg with dimensions
        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (margin.left+30) + "," + margin.top + ")");
        
        // Transpose the data into stacks
        var dataset = d3.layout.stack()(["dataType","nodataType"].map(function(y) {
            return data.map(function(d) {              
                return {x: d.category, y: +d[y]};
            });
        }));

        // Set x, y and colors
        var x = d3.scale.ordinal()
            .domain(dataset[0].map(function(d) { return d.x; }))
            .rangeRoundBands([0, width], 0.05);
        // Define data for y axis
        var y = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) {
                return d3.max(d, function(d) {
                    // enhance dataset output, if a collection count is not found
                    for (var i = 0; i < dataset.length; i++) {
                        for (var j = 0; j < dataset[i].length; j++) {
                            if (!(dataset[i][j].y > 0)) {
                                dataset[i][j].y = 0;
                            }
                            else if (!(dataset[i][j].y0 > 0)) {
                                dataset[i][j].y0 = 0;
                            }
                        }   
                    }
                    return d.y0 + d.y;
                });
            })])
            .range([height, 0]);

        // Define the colors for stacked bar chart
        var colors = ["#3498DB", "#1ABC9C"];

        // Define and draw y axis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
            .tickSize(-width, 0.5, 0.5)
            .tickPadding(10)
            .tickFormat( function(d) { return d } );    

        // Define and draw x axis
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(-width, 0.5, 0.5)
            .tickPadding(10)          

        // Append the y axis to the svg
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -80)
            .attr("dy", ".3em")
            .style("text-anchor", "end")
            .text("Total Count");

        // Append the x axis to the svg
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")             
            .attr('y', 60)
            .attr('x', (width/2))
            .text("Data Categories");

        // Create groups for each series, rects for each segment
        var groups = svg.selectAll("g.product-group")
            .data(dataset)
            .enter().append("g")
            .attr("class", "product-group")
            .attr("fill", function(d, i) { return colors[i]; })

        // Create stacked group columns
        groups.selectAll("rect")
            .data(function(d) { return d; })
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y0 + d.y); })
            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
            .attr("width", x.rangeBand)

        // Define the legend and its placement
        var legend = svg.selectAll(".legend")
            .data(colors)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

        // Draw legend key boxes
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", function(d, i) {return colors.slice().reverse()[i];})

        // Add legend text
        legend.append("text")
            .attr("x", width + 5)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d, i) {
            switch (i) {
                case 0: return "nodata";
                case 1: return "data";
                default: return "not match"
            }
        });

        // Add the title to the chart
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 3))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Test Results");
           
        // return the final svg to the DOM
        return svg;

    };

    render() {
        // Define some styling
        var style = {
            marginTop: '80px',
            minHeight: '3000px'
    };

    // Define data array
    var data = this.state.results;

    return (

        <div className="container" style={style}>
        <h3 className="text-center animated bounceInDown">SELECT A PRODUCT AND TYPE OF SUITE</h3><br/><br/><br/>
        <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label><i className="fas fa-wrench"></i> PRODUCT</label>
                            <select className="form-control" data-style="btn-primary" id="product-select" name="product_select" onChange={this.handleProdcutChange}>
                            {this.state.products.map((pro) =>
                                <option key={pro} value={pro}>{pro}</option>
                            )}
                            </select>
                        </div>
                    </div>

                    <div className="col">
                        <div className="form-group">
                            <label><i className="fas fa-toolbox"></i> TEST SUITE</label>
                            <select className="form-control" id="test-suite-select" name="test_suite_select" onChange={this.handleTestChange}>
                                <option value="regress">regression</option>
                                <option value="bench">benchmark</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button type="submit" value="" className="btn btn-outline-primary" style={{float: 'left', marginLeft: '0px'}}><i className="fas fa-search"></i> Find Results</button>
            </form>
            <a className="btn btn-outline-success download_btn" href="http://localhost:4000/api/download"><i className="far fa-file"></i> Download History</a>
            {data.length > 0 ? <a className="btn btn-outline-info download_btn" href="http://localhost:4000/api/getSearch"><i className="fas fa-save"></i> Save Result</a> : null}
            <br/>
            <br />
            <br />
            
            <div className="row">
                <table className="table table-striped table-bordered">
                    <thead>
                    <tr>
                      <th rowSpan="2">Data Category<br/></th>
                      <th colSpan="2">Data Type</th>                    
                      <th rowSpan="2">Total</th>
                    </tr>
                    <tr>                      
                        <th>data</th>
                        <th>nodata</th>                                             
                    </tr>         
                    </thead>
                    <tbody>
                        {data.length > 0 ? 

                        data.map((pro, i) => { 
                            pro.nodataType = pro.nodataType || 0;
                            pro.dataType = pro.dataType || 0;
                           
                            return (

                                <tr key={i.toString()} className="animated bounceIn">
                                    <td>{pro.category}</td>
                                    <td>{!(pro.dataType>0) ? 0 : pro.dataType}</td>
                                    <td>{!(pro.nodataType>0) ? 0 : pro.nodataType}</td>
                                    <td>{pro.dataType + pro.nodataType}</td>
                                </tr>

                            )}
                            
                        ) : <tr><td></td><td colSpan="2">- Nothing is Selected -</td><td></td></tr>}
                    </tbody>
                </table>
            </div>
            <div className="row">
                <div id="chart" className="chart animated bounceIn"> 
                
                </div> 
            </div>
        </div>
        );
    }
}

export default Chart;
