import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import * as tip from 'd3-tip/dist/index'
import './Chart.css'

class Chart extends Component {
    constructor(props){
        super(props);
        this.state = {
            products: [],
            results: [],
            product_select: "spyglass",
            test_suite_select: "regress",
            chart: ''
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
            // this.setState({chart: this.drawChart(this.state.results)});
            this.drawChart(this.state.results);

        })
    }


    handleProdcutChange(event) {
        this.setState({product_select: event.target.value});
    }

    handleTestChange(event){
        this.setState({test_suite_select: event.target.value});
    };

    drawChart(data){

        var margin = {top: 100, right: 160, bottom: 100, left: 70};
        var width = 1200 - margin.left - margin.right,
            height = 1000 - margin.top - margin.bottom;

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (margin.left+30) + "," + margin.top + ")");

        // Transpose the data into layers
        var dataset = d3.layout.stack()(["nolevel","nodata"].map(function(y) {
            return data.map(function(d) {
                
                return {x: d.version, y: +d[y]};
            });

        }));
        console.log("dataset : ", dataset)

        // Set x, y and colors
        var x = d3.scale.ordinal()
            .domain(dataset[0].map(function(d) { return d.x; }))
            .rangeRoundBands([0, width], 0.05);

        var y = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) {
                return d3.max(d, function(d) {
                    // enhance dataset output
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

        var colors = ["#3498DB", "#1ABC9C"];

        // Define and draw axes
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
            .tickSize(-width, 0.5, 0.5)
            .tickPadding(10)
            .tickFormat( function(d) { return d } );

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(-width, 0.5, 0.5)
            .tickPadding(10)


        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -80)
            .attr("dy", ".3em")
            .style("text-anchor", "end")
            .text("Total Count");

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

        groups.selectAll("rect")
            .data(function(d) { return d; })
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y0 + d.y); })
            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
            .attr("width", x.rangeBand)
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none"); })
            .on("mousemove", function(d) {
              var xPosition = d3.mouse(this)[0] - 15;
              var yPosition = d3.mouse(this)[1] - 25;
              tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
              tooltip.select("text").text(d.y);
            });

        var legend = svg.selectAll(".legend")
            .data(colors)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", function(d, i) {return colors.slice().reverse()[i];})


        legend.append("text")
            .attr("x", width + 5)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d, i) {
            switch (i) {
                case 0: return "nodata";
                case 1: return "data";
            }
        });

        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 3))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Test Results");

        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");
              
        var toolRect =   tooltip.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("fill", "white")
            .style("opacity", 0.5);
          
            toolRect.append("text")
            .attr("x", -15)
            .attr("y", height)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

    };

    render() {

        var style = {
            marginTop: '80px',
            minHeight: '3000px'
    };
    
    var data = this.state.results;

    return (

        <div className="container" style={style}>
        <h3 className="text-center animated bounceInDown">SELECT A PRODUCT AND TYPE OF SUITE</h3><br/><br/><br/>
        <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label><i className="fas fa-wrench"></i> PRODUCT</label>
                            <select className="form-control" id="product-select" name="product_select" onChange={this.handleProdcutChange}>
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
                <input type="submit" value="Find Results" className="btn btn-primary" style={{float: 'left'}}/>
            </form>
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
                            pro.nodata = pro.nodata || 0;
                            pro.nolevel = pro.nolevel || 0;
                           
                            return (

                                <tr key={i.toString()} className="animated bounceIn">
                                    <td>{pro.version}</td>
                                    <td>{!(pro.nolevel>0) ? 0 : pro.nolevel}</td>
                                    <td>{!(pro.nodata>0) ? 0 : pro.nodata}</td>
                                    <td>{pro.nolevel + pro.nodata}</td>
                                </tr>

                            )}
                            
                        ) : <tr><td></td><td colSpan="2">- Nothing is Selected -</td><td></td></tr>}
                    </tbody>
                </table>
            </div>
            <div className="row">
                <div id="chart" className="chart animated bounceIn">
            {/* {data.length > 0 ? (<ChildChart data={this.state.results}/>) : null} */}
                
                </div> 
            </div>
        </div>
        );
    }
}

export default Chart;
