import "./App.css";
import React from "react";
import Sidepane from "./sections.js/sidepane";
import Board from "./sections.js/board";
import Emitter from "semitter";
import { _id } from "./assets/js/utils";

const emitter = new Emitter();

class Simulator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gates: new Object(),
      dots: new Array(),
      wires: new Object(),
    };
  }

  render_dots = () => {
    let num_rows = this.available_height / this.dot_distance;
    let num_cols = this.available_width / this.dot_distance;
    let dots = new Array(),
      top,
      left;

    this.default_top = 1;
    this.default_left = 10;

    for (let r = this.default_top; r < num_rows; r++) {
      for (let c = this.default_left; c < num_cols; c++) {
        top = r * this.dot_distance;
        left = c * this.dot_distance;

        dots.push({ top, left });
      }
    }

    this.default_top *= this.dot_distance;
    this.default_left *= this.dot_distance;

    this.setState({ dots });
  };

  componentDidMount = () => {
    this.canvas = document.getElementById("board");
    let screen_props = window.screen;
    this.available_height = screen_props.availHeight;
    this.available_width = screen_props.availWidth;
    this.dot_distance = 20;
    this.allowed_left = this.dot_distance * 10;

    this.render_dots();

    this.active_component = (active_component) => {
      this.setState({ active_component });
    };

    this.remove_active_component = () =>
      this.setState({ active_component: null });

    this.onclick = (e) => {
      let { target } = e;

      let id = target.id,
        class_list = target.classList;
      let { active_component } = this.state;

      if (active_component) {
        this.setState({ active_component: null });
        return emitter.emit(`remove_active_component_${active_component._id}`);
      }
      if (class_list.contains("port")) {
        this.setState({ active_component: this.state.wires[id] });
      } else if (class_list.contains("dot")) {
        this.add_wire(target.getAttribute("name").split(","));
      } else if (class_list.contains("gate_body")) {
        if (class_list.contains("add_gate"))
          this.add_gate(target.getAttribute("name"));
        else this.setState({ active_component: this.state.gates[id] });
      }
    };

    document.addEventListener("mousemove", (e) => {
      let { active_component } = this.state;
      if (!active_component) return;

      let top =
        Math.round(e.clientY / this.dot_distance) * this.dot_distance - 2;
      let left = Math.round(e.clientX / this.dot_distance) * this.dot_distance;
      if (left < this.allowed_left) left = this.allowed_left;

      if (active_component._id.startsWith("wire")) {
        let previous_dot = active_component.path.slice(-1)[0];
        let coords = previous_dot.length === 2;

        console.log(active_component.path, "previous path");

        let calculated_dot;
        let distance_from_x_axis = previous_dot[0] - left,
          distance_from_y_axis = previous_dot[1] - top;

        let neg_y = distance_from_y_axis,
          neg_x = distance_from_x_axis;

        distance_from_x_axis = Math.abs(distance_from_x_axis);
        distance_from_y_axis = Math.abs(distance_from_y_axis);

        if (neg_x < 0) {
          distance_from_x_axis -= this.dot_distance;
          left -= this.dot_distance;
        }
        if (neg_y < 0) {
          distance_from_y_axis -= this.dot_distance;
          top -= this.dot_distance;
        } else distance_from_y_axis += this.dot_distance;

        if (previous_dot[0] === left && previous_dot[1] === top) return;

        if (distance_from_x_axis === distance_from_y_axis) {
          return;
        } else if (distance_from_x_axis > distance_from_y_axis) {
          calculated_dot = [left, previous_dot[1], distance_from_x_axis, 2];
        } else if (distance_from_x_axis < distance_from_y_axis) {
          calculated_dot = [previous_dot[0], top, 2, distance_from_y_axis];
        }

        if (calculated_dot[0] === previous_dot[0]) {
          previous_dot[3] = top;
          active_component.path.splice(-1, 1, previous_dot);
        } else if (calculated_dot[1] === previous_dot[1]) {
          previous_dot[2] = left;
          active_component.path.splice(-1, 1, previous_dot);
        } else active_component.path.push(calculated_dot);

        console.log(active_component.path);

        emitter.emit(
          `wire_current_endpoint_${active_component._id}`,
          active_component.path
        );
        this.setState({ active_component });
      } else
        emitter.emit(`component_position_${active_component._id}`, {
          top,
          left,
        });
    });
  };

  add_wire = (dot_location) => {
    let { wires } = this.state;
    let wire_id = _id("wire");

    let wire = {
      _id: wire_id,
      path: new Array([...dot_location.map((d) => Number(d)), 0, 0]),
    };

    wires[wire_id] = wire;
    this.setState({ wires, active_component: wire });
  };

  add_gate = (name) => {
    let { gates } = this.state;

    let gate_id = _id(name);
    let gate = {
      name,
      top: this.default_top,
      left: this.default_left,
      _id: gate_id,
    };

    gates[gate_id] = gate;
    this.setState({ gates });
  };

  render = () => {
    let { gates, dots, wires } = this.state;

    return (
      <div id="main" onClick={this.onclick}>
        <Sidepane />
        <Board gates={gates} dots={dots} wires={wires} />
      </div>
    );
  };
}

export default Simulator;
export { emitter };
