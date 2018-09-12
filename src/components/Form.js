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

  // componentDidMount() {
  //   fetch('http://localhost:4000/api/products')
  //     .then(res => res.json())
  //     .then(products => this.setState({ products }));
  // }

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
     }
    )
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
        <br />
        <br />
        <hr />
        <div className="row" style={{marginLeft: '-3px'}}>
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
      </div>
    );
  }
}

export default Form;
