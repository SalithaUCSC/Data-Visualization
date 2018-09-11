import React, { Component } from 'react';
import './App.css';
import Navbar from './components/Navbar';
// import Home from './components/Home';
import Form from './components/Form';
import './App.css';

class App extends Component {
  render() {
    var user = {
      name: "techpool",
      job: "Developer",
      hobbies: ["Reading", "Watching Movies", "Travelling"]
    }
    return (
      <div className="App">
        <Navbar/>
        {/*<Home name={"salitha"} status={"Undergraduate"} user={user}/>*/}
        <Form/>
      </div>
    );
  }
}

export default App;
