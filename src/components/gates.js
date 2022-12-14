import React from "react";
import { emitter } from "../Simulator";

class Gates extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  events = new Array("component_position", "remove_active_component");

  action = () => {
    let { active_component } = this.state;
  };

  remove_active_component = () => this.setState({ active_component: false });

  component_position = (position) => {
    let { properties } = this.state;
    properties = { ...properties, ...position };
    this.setState({ properties });
  };

  listen = () => {
    if (this.props.sidepane) return;
    let { properties } = this.state;

    let { _id } = properties;

    this.events.map((event) => emitter.listen(`${event}_${_id}`, this[event]));
  };

  on_mount = () => {
    this.listen();
  };
}

export default Gates;
