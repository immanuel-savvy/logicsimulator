import "./App.css";
import React from "react";
import Sidepane from "./sections.js/sidepane";
import Board from "./sections.js/board";
import Emitter from "semitter";
import { is_child_of, round_nearest_20, _id } from "./assets/js/utils";

const emitter = new Emitter();

class Simulator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gates: new Object(),
      dots: new Object(),
      wires: new Object(),
      ports: new Object(),
      inputs: new Object(),
      outputs: new Object(),
    };
  }

  render_dots = () => {
    let num_rows = this.available_height / this.dot_distance;
    let num_cols = this.available_width / this.dot_distance;
    let dots = new Object(),
      top,
      left;

    this.default_top = 1;
    this.default_left = 10;

    for (let r = this.default_top; r < num_rows; r++) {
      for (let c = this.default_left; c < num_cols; c++) {
        top = round_nearest_20(r * this.dot_distance);
        left = round_nearest_20(c * this.dot_distance);

        dots[`${left},${top}`] = {
          _id: _id("dot"),
          left,
          top,
          wires: new Set(),
        };
      }
    }

    this.default_top *= this.dot_distance;
    this.default_left *= this.dot_distance;

    this.setState({ dots });
  };

  calculate_dot = (top, left, wire) => {
    let calculated_dot;
    let previous_dot;
    let { active_component } = this.state;
    if (active_component._id.startsWith("dot"))
      previous_dot = wire.path.slice(-1);
    else previous_dot = active_component.path.slice(-1);
    previous_dot = previous_dot[0];
    if (!previous_dot) return;

    let distance_from_x_axis = previous_dot[0] - left,
      distance_from_y_axis = previous_dot[1] - top;

    distance_from_x_axis = Math.abs(distance_from_x_axis);
    distance_from_y_axis = Math.abs(distance_from_y_axis);

    if (distance_from_x_axis > distance_from_y_axis) {
      calculated_dot = [left, previous_dot[1], distance_from_x_axis, 2];
    } else if (distance_from_x_axis < distance_from_y_axis) {
      calculated_dot = [previous_dot[0], top, 2, distance_from_y_axis];
    } else calculated_dot = previous_dot;

    return calculated_dot;
  };

  get_click_location = (e, actual = false) => {
    let top = Math.round(e.clientY / this.dot_distance) * this.dot_distance - 2;
    let left = Math.round(e.clientX / this.dot_distance) * this.dot_distance;
    if (left < this.allowed_left && !actual) left = this.allowed_left;

    top = round_nearest_20(top);
    left = round_nearest_20(left);

    return { top, left };
  };

  find_wire = (dot) => {
    let { wires } = this.state;
    let { left, top } = dot;
    let wires_ = new Array();

    for (const wire_id in wires) {
      let wire = wires[wire_id];
      let [start, end] = wire.path;

      if (start[0] === left && end[0] === left) {
        if (end[1] >= top && start[1] <= top) wires_.push(wire);
      } else if (start[1] === top && end[1] === top)
        if (end[0] >= left && start[0] <= left) wires_.push(wire);
    }

    return wires_;
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

    this.double_click = 0;
    this.onclick = (e) => {
      let { target } = e;

      let id = target.id,
        class_list = target.classList;
      let { active_component, touch } = this.state;

      if (active_component) {
        if (!touch && active_component._id.startsWith("wire")) {
          let left, top;
          target = is_child_of(target, "dot");
          if (!target) return;

          let dot = this.state.dots[target.getAttribute("name")];
          if (
            dot.top === this.recent_dot.top &&
            dot.left === this.recent_dot.left
          ) {
            emitter.emit(`remove_active_dot_${this.recent_dot._id}`);
            this.recent_dot = null;
            this.recent_wire = null;
            return this.setState({ active_component: null });
          }

          let wires = this.find_wire(dot),
            wire;

          if (wires.length) {
            let is_vertical_dot = this.recent_dot.left === dot.left;
            if (
              !active_component.vertical &&
              is_vertical_dot &&
              wires.find((wire) => wire.vertical)
            ) {
              active_component = wires.find((wire) => wire.vertical);
              this.setState({ active_component });
              wire = true;
            } else if (
              active_component.vertical &&
              !is_vertical_dot &&
              wires.find((wire) => !wire.vertical)
            ) {
              active_component = wires.find((wire) => !wire.vertical);
              this.setState({ active_component });
              wire = true;
            } else if (
              wires.find((wire) => wire._id === active_component._id)
            ) {
              wire = true;
            }
          }

          if (wire) {
            let trim_start, trim_end, dot_start, dot_end;
            if (
              this.recent_dot.left === active_component.path[0][0] &&
              this.recent_dot.top === active_component.path[0][1]
              /* Trim wire from start */
            ) {
              trim_start = true;
            }
            if (
              this.recent_dot.left === active_component.path[1][0] &&
              this.recent_dot.top === active_component.path[1][1]
              /* Trim wire from end */
            ) {
              trim_end = true;
            }

            if (
              dot.left === active_component.path[0][0] &&
              dot.top === active_component.path[0][1]
              /* Trim wire from start */
            ) {
              dot_start = true;
            }
            if (
              dot.left === active_component.path[1][0] &&
              dot.top === active_component.path[1][1]
              /* Trim wire from end */
            ) {
              dot_end = true;
            }

            if ((trim_start && dot_end) || (trim_end && dot_start)) {
              /* Remove wire */
              let { wires } = this.state;
              delete wires[active_component._id];
              emitter.emit(`remove_active_dot_${this.recent_dot._id}`);
              emitter.emit(`active_dot_${dot._id}`);
              this.recent_dot = dot;
              return this.setState({ wires, active_component: null });
            } else if (trim_start)
              active_component.path[0] = [dot.left, dot.top];
            else if (trim_end) active_component.path[1] = [dot.left, dot.top];
            else {
              /* Split wire */
              let lower_dot, higher_dot;
              if (this.recent_dot.left === dot.left) {
                if (this.recent_dot.top > dot.top) {
                  lower_dot = dot;
                  higher_dot = this.recent_dot;
                } else if (this.recent_dot.top < dot.top) {
                  higher_dot = dot;
                  lower_dot = this.recent_dot;
                }
                if (
                  higher_dot.left === active_component.path[1][0] &&
                  higher_dot.top === active_component.path[1][1]
                ) {
                } else {
                  this.add_wire([
                    [higher_dot.left, higher_dot.top],
                    active_component.path[1],
                  ]);
                }
                active_component.path[1] = [lower_dot.left, lower_dot.top];
              } else if (this.recent_dot.top === dot.top) {
                if (this.recent_dot.left > dot.left) {
                  lower_dot = dot;
                  higher_dot = this.recent_dot;
                } else if (this.recent_dot.left < dot.left) {
                  higher_dot = dot;
                  lower_dot = this.recent_dot;
                }
                if (
                  higher_dot.left === active_component.path[1][0] &&
                  higher_dot.top === active_component.path[1][1]
                ) {
                } else
                  this.add_wire([
                    [higher_dot.left, higher_dot.top],
                    active_component.path[1],
                  ]);
                active_component.path[1] = [lower_dot.left, lower_dot.top];
              }
            }
            if (!this.path_is_a_point(active_component.path))
              emitter.emit(
                `update_wire_path_${active_component._id}`,
                active_component.path
              );
            this.setState({ active_component: null });
            this.recent_wire = null;
            emitter.emit(`remove_active_dot_${this.recent_dot._id}`);
            emitter.emit(`active_dot_${dot._id}`);
            this.recent_dot = dot;
          } else {
            wires = this.add_wire([
              [this.recent_dot.left, this.recent_dot.top],
              [dot.left, dot.top],
            ]);

            active_component = dot;
            emitter.emit(`remove_active_dot_${this.recent_dot._id}`);
            emitter.emit(`active_dot_${dot._id}`);
            this.recent_dot = null;
          }

          this.setState({ active_component });
        } else if (!touch && active_component._id.startsWith("dot")) {
          target = is_child_of(target, "dot");
          if (!target) return;

          let dot = this.state.dots[target.getAttribute("name")];

          if (dot._id === active_component._id) {
            this.setState({ active_component: null });
            this.recent_wire = null;
            return emitter.emit(`remove_active_dot_${active_component._id}`);
          }

          let new_wire = true;
          if (this.recent_wire) {
            if (this.recent_wire.vertical) {
              // wire vertical continuation
              if (this.recent_wire.path[0][0] === dot.left) {
                if (this.recent_wire.path[0][1] === active_component.top) {
                  this.recent_wire.path[0][1] = dot.top;
                } else if (
                  this.recent_wire.path[1][1] === active_component.top
                ) {
                  this.recent_wire.path[1][1] = dot.top;
                }
                new_wire = false;
              } else new_wire = true;
            } else if (!this.recent_wire.vertical) {
              // wire horizontal continuation
              if (this.recent_wire.path[1][1] === dot.top) {
                if (this.recent_wire.path[0][0] === active_component.left) {
                  this.recent_wire.path[0][0] = dot.left;
                } else if (
                  this.recent_wire.path[1][0] === active_component.left
                ) {
                  this.recent_wire.path[1][0] = dot.left;
                }
                new_wire = false;
              } else new_wire = true;
            }
            if (!this.path_is_a_point(this.recent_wire.path))
              emitter.emit(
                `update_wire_path_${this.recent_wire._id}`,
                this.recent_wire.path
              );
            else {
              let { wires } = this.state;
              delete wires[this.recent_wire._id];
              this.recent_dot = dot;
              let wires_ = this.find_wire(dot);
              this.recent_wire = wires_.length ? wires_[0] : null;
              this.setState({ wires, active_component: dot });
              emitter.emit(`remove_wire_${this.recent_wire._id}`);
            }
          }
          if (new_wire)
            this.recent_wire = this.add_wire([
              [active_component.left, active_component.top],
              [dot.left, dot.top],
            ]);

          this.setState({ active_component: dot });
          emitter.emit(`remove_active_dot_${active_component._id}`);
          emitter.emit(`active_dot_${dot._id}`);
        } else if (class_list.contains("button")) {
          if (class_list.contains("add_button")) return;

          let { inputs } = this.state;
          let input = inputs[id];

          input.on = !input.on;

          emitter.emit(`toggle_input_on_${id}`, input.on);
          this.setState({ inputs });
        } else {
          let { left } = this.get_click_location(e, true);
          if (left < this.allowed_left) {
            let { gates } = this.state;
            delete gates[active_component._id];
          }
          let { ports } = this.state;

          this.setState({ active_component: null });
          emitter.emit(`remove_active_component_${active_component._id}`);
        }
        return;
      }
      if (touch || id === "touch_toggler") {
        if (touch && class_list.contains("button")) {
          let { inputs } = this.state;
          let input = inputs[id];
          input.on = !input.on;
          inputs[id] = input;
          input.port = this.setState({ inputs });
          emitter.emit(`toggle_input_on_${id}`, input.on);
          return;
        } else if (id !== "touch_toggler") return;

        this.setState({ touch: !this.state.touch });
      } else if (class_list.contains("port")) {
        this.setState({ active_component: this.state.wires[id] });
      } else if (is_child_of(target, "dot")) {
        let { dots } = this.state;
        target = is_child_of(target, "dot");

        let dot = dots[target.getAttribute("name")];
        let wires = this.find_wire(dot);
        if (wires.length) {
          this.recent_dot = dot;
          this.setState({ active_component: wires[0] });
        } else this.setState({ active_component: dot });

        emitter.emit(`active_dot_${dot._id}`);
      } else if (class_list.contains("gate_body")) {
        if (class_list.contains("add_gate"))
          this.add_gate(
            target.getAttribute("name"),
            this.get_click_location(e, true)
          );
        else this.setState({ active_component: this.state.gates[id] });
      } else if (class_list.contains("button")) {
        if (class_list.contains("add_button"))
          return this.add_button(
            target.getAttribute("name"),
            this.get_click_location(e, true)
          );

        if (touch) {
        } else this.setState({ active_component: this.state.inputs[id] });
      }
    };

    document.addEventListener("mousemove", (e) => {
      let { active_component } = this.state;
      let { top, left } = this.get_click_location(e, true);
      emitter.emit("update_coords", { top, left });

      if (!active_component) return;

      emitter.emit(`component_position_${active_component._id}`, {
        top,
        left,
      });
    });
  };

  add_wire = (dot_location) => {
    let { wires } = this.state;
    let wire_id = _id("wire");

    let [start, end] = dot_location;

    let top = start[1];
    let left = start[0];
    let width = end[0] - start[0] || 2;
    let height = end[1] - start[1] || 2;

    if (Math.abs(width) > Math.abs(height)) height = 2;
    else width = 2;

    if (width < 0) {
      left = left + width;
      width = width * -1;
    }
    if (height < 0) {
      top = top + height;
      height = height * -1;
    }

    dot_location = [
      [left, top],
      [round_nearest_20(left + width), round_nearest_20(top + height)],
    ];

    let wire = {
      _id: wire_id,
      path: dot_location,
      vertical: dot_location[0][0] === dot_location[1][0],
    };

    if (
      dot_location[0].find((l) => typeof l !== "number") ||
      dot_location[1].find((l) => typeof l !== "number") ||
      this.path_is_a_point(dot_location)
    )
      return;

    let found;
    while (true) {
      found = false;
      for (const wire_id in wires) {
        let wire_ = wires[wire_id];

        if (wire.vertical && wire_.vertical) {
          if (wire.path[0][1] === wire_.path[1][1]) {
            wire_.path[1] = wire.path[1];
            found = true;
          } else if (wire.path[1][1] === wire_.path[0][1]) {
            wire_.path[0] = wire.path[0];
            found = true;
          }
        } else if (!wire.vertical && !wire_.vertical) {
          if (wire.path[1][0] === wire_.path[0][0]) {
            wire_.path[0] = wire.path[0];
            found = true;
          } else if (wire.path[0][0] === wire_.path[1][0]) {
            wire_.path[1] = wire.path[1];
            found = true;
          }
        }
        if (found) {
          delete wires[wire_._id];
          wire = wire_;
        }
      }
      if (!found) break;
    }

    wires[wire._id] = wire;

    this.setState({ wires });

    return wire;
  };

  path_is_a_point = (dot_location) => {
    return (
      dot_location[0][0] === dot_location[1][0] &&
      dot_location[0][1] === dot_location[1][1]
    );
  };

  add_gate = (name, { top, left }) => {
    let { gates } = this.state;

    let gate_id = _id(name);
    let gate = {
      name,
      top,
      left,
      _id: gate_id,
    };

    gates[gate_id] = gate;
    this.setState({ gates, active_component: gate });
    this.recent_dot && emitter.emit(`remove_active_dot_${this.recent_dot._id}`);
  };

  add_button = (name, { top, left }) => {
    let { inputs, ports } = this.state;

    let input_id = _id(name);

    let port = {
      _id: _id("port"),
      source: input_id,
    };

    let input = {
      name,
      _id: input_id,
      top,
      left,
      port: port._id,
      on: new Array("constant", "ground").includes("name"),
    };

    port.state = input.on;

    inputs[input_id] = input;

    this.setState({ ports, inputs, active_component: input });
    this.recent_dot && emitter.emit(`remove_active_dot_${this.recent_dot._id}`);
  };

  render = () => {
    let { gates, inputs, touch, outputs, dots, wires } = this.state;

    return (
      <div
        id="main"
        onClick={this.onclick}
        style={{
          cursor: touch ? "pointer" : null,
        }}
      >
        <Sidepane touch={touch} />
        <Board
          inputs={inputs}
          outputs={outputs}
          gates={gates}
          dots={dots}
          wires={wires}
        />
      </div>
    );
  };
}

export default Simulator;
export { emitter };
