import React from "react";
import { emitter } from "../Simulator";

class Wire extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      wire: this.props.wire,
    };
  }

  componentDidMount = () => {
    let { wire } = this.state;

    this.update_wire_path = (path) =>
      this.setState({ wire: { ...this.state.wire, path } });

    emitter.single_listener(
      `update_wire_path_${wire._id}`,
      this.update_wire_path
    );
  };

  resolve_path = (path) => {
    let [start, end] = path;

    let top = start[1];
    let left = start[0];
    let width = end[0] - start[0] || 2;
    let height = end[1] - start[1] || 2;

    return { top, left, width, height };
  };

  render() {
    let { wire } = this.state;
    let { path } = wire;

    let { top, left, height, width } = this.resolve_path(path);

    return (
      <div
        className="wire"
        style={{
          top,
          left,
          height,
          width,
          backgroundColor: "green",
        }}
      ></div>
    );
  }
}

export default Wire;
