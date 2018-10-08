import React, { Component } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Chart from './components/Chart';
import './App.css';

class App extends Component {

  render() {

    return (
      <div className="App">
        <Navbar/>
        <Chart/>
      </div>
    );
  }
}

export default App;
