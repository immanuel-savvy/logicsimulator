import React from "react";
import { emitter } from "../Simulator";

class Buttons extends React.Component {
  constructor(props) {
    super(props);
  }

  on_mount = () => {
    let { button } = this.props;

    this.toggle_input_on = (on) => {
      this.setState({ button: { ...this.state.button, on } });
    };

    this.component_position = (coords) => {
      this.setState({ button: { ...this.state.button, ...coords } });
    };

    emitter.single_listener(
      `component_position_${button._id}`,
      this.component_position
    );
    emitter.single_listener(
      `toggle_input_on${button._id}`,
      this.toggle_input_on
    );
  };
}

export default Buttons;
