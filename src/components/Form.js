import React, { Component } from 'react';

class Form extends Component {
state = {products: []}
  componentDidMount() {
    fetch('http://localhost:4000/api/getProducts')
      .then(res => res.json())
      .then(products => this.setState({ products }));
  }

  render() {
    var style = {
          marginTop: '80px'
    };

    return (

      <div className="container" style={style}>
        <form method="POST" action="">
          <div className="row">
              <div className="col">
                  <div className="form-group">
                      <label>PRODUCT</label>
                      <select className="form-control" id="product-select" name="product_select">
                        {this.state.products.map((pro) =>
                            <option>{pro}</option>
                        )}
                      </select>
                  </div>
              </div>
              <div className="col">
                  <div className="form-group">
                      <label>TEST SUITE</label>
                      <select className="form-control" id="test-suite-select" name="test_suite_select">
                          <option value="regress">regression</option>
                          <option value="bench">benchmark</option>
                      </select>
                  </div>
              </div>
          </div>
          <input type="submit" value="submit" className="btn btn-primary" style={{float: 'left'}}/>
        </form>
      </div>

    );

  }
}

export default Form;
