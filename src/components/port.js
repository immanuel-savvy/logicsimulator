import React from "react";

class Port extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    let { style } = this.props;
    let { port } = this.state;
    let { state } = port || new Object();

    return (
      <div
        className="port"
        style={{
          ...style,
          cursor: "pointer",
          backgroundColor: state ? "green" : "grey",
        }}
      ></div>
    );
  }
}

export default Port;
