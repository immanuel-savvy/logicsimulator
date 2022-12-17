import React from "react";
import { emitter } from "../Simulator";

class Wire extends React.Component {
  constructor(props) {
    super(props);

    let { wire } = this.props;
    this.state = { wire };
  }

  componentDidMount = () => {
    let { wire } = this.state;

    this.wire_current_endpoint = (path) => {
      this.setState({ wire: { ...this.state.wire, path } });
    };

    this.persist_floating_wire = () => {
      let { wire, floating_wire } = this.state;
      floating_wire.pop();
      wire.path.push(floating_wire);
      this.setState({ wire, floating_wire: null });
    };

    this.pop_floating_wire = () => {
      this.setState({ floating_wire: null });
    };

    this.pop_wire_node = () => {
      let { wire } = this.state;
      wire.path.pop();
      this.setState({ wire });
    };

    this.floating_wire = (floating_wire) => {
      this.setState({ floating_wire });
    };

    emitter.single_listener(
      `wire_current_endpoint_${wire._id}`,
      this.wire_current_endpoint
    );
    emitter.single_listener(`pop_wire_node_${wire._id}`, this.pop_wire_node);
    emitter.single_listener(`floating_wire_${wire._id}`, this.floating_wire);
    emitter.single_listener(
      `pop_floating_wire_${wire._id}`,
      this.pop_floating_wire
    );
    emitter.single_listener(
      `persist_floating_wire_${wire._id}`,
      this.persist_floating_wire
    );
  };

  render() {
    let { wire, floating_wire } = this.state;
    let { path } = wire;

    console.log(path, "Holla");

    return new Array(...path, floating_wire).map((wire_path, index) => {
      if (!wire_path) return;

      let [start_x, start_y, offset_x, offset_y] = wire_path;
      if (offset_x < 0) {
        start_x = start_x + offset_x;
        offset_x = Math.abs(offset_x);
      }
      if (offset_y < 0) {
        start_y = start_y + offset_y;
        offset_y = Math.abs(offset_y);
      }
      return (
        <div
          key={index}
          className="wire"
          style={{
            left: start_x,
            top: start_y,
            width: `${offset_x || 2}px`,
            height: `${offset_y || 2}px`,
            backgroundColor: "green",
          }}
        ></div>
      );
    });
  }
}

export default Wire;
