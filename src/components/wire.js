import React from "react";
import { emitter } from "../Simulator";

class Wire extends React.Component {
  constructor(props) {
    super(props);

    let { wire } = this.props;
    console.log(wire);
    this.state = { wire };
  }

  componentDidMount = () => {
    let { wire } = this.state;

    this.wire_current_endpoint = (path) => {
      this.setState({ wire: { ...this.state.wire, path } });
    };

    emitter.single_listener(
      `wire_current_endpoint_${wire._id}`,
      this.wire_current_endpoint
    );
  };

  render() {
    let { wire } = this.state;
    let { path } = wire;

    return path.map((wire_path) => (
      <div
        class="wire"
        style={{
          left: wire_path[0],
          top: wire_path[1],
          width: `${wire_path[2] || 2}px`,
          height: `${wire_path[3] || 2}px`,
          backgroundColor: "#000",
        }}
      ></div>
    ));
  }
}

export default Wire;
