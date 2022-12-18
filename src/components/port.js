import React from "react";

class Port extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    let { style } = this.props;

    return <div className="port" style={{ ...style, cursor: "pointer" }}></div>;
  }
}

export default Port;
