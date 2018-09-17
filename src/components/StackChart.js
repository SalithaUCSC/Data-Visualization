import React, { Component } from 'react';

class StackChart extends Component {

  constructor(props){
    super();
    this.state = this.props;
  }

  render() {
    console.log(this.props);
    return (
      <div></div>
    );

  }
}

export default StackChart;
