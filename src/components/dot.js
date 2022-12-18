import React from "react";
import { emitter } from "../Simulator";

class Dot extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount = () => {
    let { _id } = this.props.dot;

    this.active_dot = () => {
      this.setState({ active: true });
    };

    this.remove_active_dot = () => {
      this.setState({ active: false });
    };

    emitter.single_listener(`active_dot_${_id}`, this.active_dot);
    emitter.single_listener(`remove_active_dot_${_id}`, this.remove_active_dot);
  };

  render() {
    let { active } = this.state;
    let { dot } = this.props;
    let { top, left, _id } = dot;

    return (
      <div
        id={_id}
        name={`${left},${top}`}
        style={{ top: top - 4, left: left - 4 }}
        className={"dot" + (active ? " active" : "")}
      >
        <div className="dot_inner"></div>
      </div>
    );
  }
}

export default Dot;
