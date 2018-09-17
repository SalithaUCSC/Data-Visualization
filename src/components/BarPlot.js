import React, { Component } from 'react'
import * as d3 from "d3";
import { select } from 'd3-selection';

class BarPlot extends Component {
   constructor(props){
      super(props)
      this.state = {
          data : this.props.data
      };
      console.log(this.props.data);
      this.createChart = this.createChart.bind(this)
   }

    componentDidMount(){
      this.createChart()
    }

    componentDidUpdate(){
      this.createChart()
    }

    createChart(){



    }

    render(){
        return(
            <div>
                <svg width={500} height={500}>
                </svg>

            </div>
        );
    }
}
export default BarPlot;
