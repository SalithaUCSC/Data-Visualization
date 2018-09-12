import React, { Component } from 'react';
import axios from 'axios';

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
    fetch('http://localhost:4000/api/getProducts')
      .then(res => res.json())
      .then(products => this.setState({ products }));
  }

  // componentDidMount() {
  //   axios.get('http://localhost:4000/api/getProducts')
      // .then(res => {
      //   const products = res.data;
      //   this.setState({products});
      // })
  // }

  // componentWillReceiveProps(props) {
  //   this.setState(props);
  // }

  handleSubmit(event) {
     event.preventDefault();
     // fetch('http://localhost:4000/api/search', {
     //   method: "POST",
       // headers: {
       //   Accept: "Access-Control-Allow-Headers",
       //   "Content-Type": "application/json"
       // },
       // body: {
       //   product_select: this.state.product_select,
       //   test_suite_select: this.state.test_suite_select
       // }
     //
     // }).then(res => res.json())
     //   .then(res =>console.log(res))
     //   .catch(error => console.error('Error:', error));
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
     }, config
     ).then(res =>console.log(res))
 }

  handleProdcutChange(event) {
    this.setState({product_select: event.target.value});
  }

  handleTestChange(event){
    this.setState({test_suite_select: event.target.value});
  }

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
        {this.state.results.map((result) =>
            <option key={result} value={result}>{result}</option>
        )}
      </div>

    );

  }
}

export default Form;
