import React, { Component } from 'react';

export class Home extends Component {
  constructor(props){
    super();
    this.name = props.name;
  }

  changeName(){
    this.name = "pool";
    console.log(this.name);
  }
  render() {
    console.log(this.props);
    return (
      <div>
        <p>My name is {this.props.name}</p>
        <p>I am a {this.props.status}</p>
        <p>More Details: <br/>
            Blog: {this.props.user.name} <br/>
            Future Job: {this.props.user.job}
        </p>
        <p>Hobbies</p><br/>
        <ul className="list-group">
          {this.props.user.hobbies.map((hobby,i) => <li className="list-group-item" key={i}>{hobby}</li>)}
        </ul>
        <hr/>
        <p>Change Name : {this.name}</p>
        <button className="btn btn-primary" onClick={() => this.changeName()}>click me</button>
      </div>
    );
  }
}

export default Home;
