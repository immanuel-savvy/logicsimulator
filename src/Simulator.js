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
      dots: new Array(),
      wires: new Object(),
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
        top = r * this.dot_distance;
        left = c * this.dot_distance;

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

  resort_dot_wires = (dot, wire, filter = false) => {
    const sort_dot_wires = ({ left, top }) => {
      let dot = this.state.dots[`${left},${top}`];
      if (filter) dot.wires.delete(wire);
      else dot.wires.add(wire);

      // console.log(dot);
      return dot;
    };

    const clean_dot_wires = (dot) => {
      if (!dot) return dot;

      let wires = Array.from(dot.wires);

      for (let w = 0; w < wires.length; w++) {
        let wire = this.state.wires[wires[w]];
        let found = false;
        for (let p = 0; p < wire.path.length; p++) {
          let path = wire.path[p];
          if (path[3] === 2) {
            if (path[2] > 0)
              for (
                let i = path[0];
                i <= path[0] + path[2];
                i += this.dot_distance
              ) {
                if (i === dot[0]) {
                  found = true;
                  break;
                }
              }
            else if (path[2] < 0)
              for (
                let i = path[0];
                i >= path[0] + path[2];
                i -= this.dot_distance
              ) {
                if (i === dot[0]) {
                  found = true;
                  break;
                }
              }
          } else if (path[2] === 2) {
            if (path[3] > 0)
              for (
                let i = path[1];
                i <= path[1] + path[3];
                i += this.dot_distance
              ) {
                if (i === dot[1]) {
                  found = true;
                  break;
                }
              }
            else if (path[3] < 0)
              for (
                let i = path[1];
                i >= path[1] + path[3];
                i -= this.dot_distance
              ) {
                if (i === dot[1]) {
                  found = true;
                  break;
                }
              }
          }
          if (found) break;
        }
        if (!found) dot.wires.delete(wire._id);
      }
    };

    let res;
    if (dot[2] === 2) {
      if (dot[3] < 0) {
        for (let i = dot[1]; i >= dot[1] + dot[3]; i -= this.dot_distance)
          res = sort_dot_wires({ left: dot[0], top: i });
      } else if (dot[3] > 0) {
        for (let i = dot[1]; i <= dot[1] + dot[3]; i += this.dot_distance)
          res = sort_dot_wires({ left: dot[0], top: i });
      }
    } else if (dot[3] === 2) {
      if (dot[2] < 0) {
        for (let i = dot[0]; i >= dot[0] + dot[2]; i -= this.dot_distance)
          res = sort_dot_wires({ top: dot[1], left: i });
      } else if (dot[2] > 0) {
        for (let i = dot[0]; i <= dot[0] + dot[2]; i += this.dot_distance)
          res = sort_dot_wires({ top: dot[1], left: i });
      }
    }

    return clean_dot_wires(res);
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

  get_click_location = (e) => {
    let top = Math.round(e.clientY / this.dot_distance) * this.dot_distance - 2;
    let left = Math.round(e.clientX / this.dot_distance) * this.dot_distance;
    if (left < this.allowed_left) left = this.allowed_left;
    top = round_nearest_20(top);
    left = round_nearest_20(left);

    return { top, left };
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
      let { active_component } = this.state;

      if (active_component) {
        if (active_component._id.startsWith("wire")) {
          let top, left;
          target = is_child_of(target, "dot");

          if (target) {
            let name = target
              .getAttribute("name")
              .split(",")
              .map((n) => Number(n));
            top = name[1];
            left = name[0];
          } else {
            return;
          }

          let calculated_dot = this.calculate_dot(top, left);
          let previous_dot = active_component.path.slice(-1)[0];

          if (
            calculated_dot &&
            Math.abs(calculated_dot[0]) === Math.abs(previous_dot[0]) &&
            Math.abs(calculated_dot[1]) === Math.abs(previous_dot[1]) &&
            Math.abs(calculated_dot[2]) === Math.abs(previous_dot[2]) &&
            Math.abs(calculated_dot[3]) === Math.abs(previous_dot[3])
          ) {
            emitter.emit(`pop_wire_node_${active_component._id}`);

            return this.setState({ active_component: null });
          }

          calculated_dot && active_component.path.push(calculated_dot);

          emitter.emit(
            `wire_current_endpoint_${active_component._id}`,
            active_component.path
          );

          this.setState({ active_component });
        } else if (active_component._id.startsWith("dot")) {
          let coords = this.get_click_location(e);
          if (this.recent_click_coords) {
            if (
              coords.top === this.recent_click_coords.top &&
              coords.left === this.recent_click_coords.left
            ) {
              this.recent_click_coords = null;
              this.floating_wire = null;
              this.wire_path = null;
              return this.setState({ active_component: null });
            } else {
              let wire = this.floating_wire[4];
              this.floating_wire.pop();
              if (!this.floating_wire[3])
                emitter.emit(`pop_floating_wire_${wire}`);
              else {
                wire = this.state.wires[wire].path.push(this.floating_wire);
                emitter.emit(`persist_floating_wire_${this.floating_wire[4]}`);
              }

              this.floating_wire = null;
              this.wire_path = null;
            }
          }

          this.recent_click_coords = coords;
        } else {
          this.setState({ active_component: null });
          emitter.emit(`remove_active_component_${active_component._id}`);
        }
        return;
      }
      if (class_list.contains("port")) {
        this.setState({ active_component: this.state.wires[id] });
      } else if (is_child_of(target, "dot")) {
        console.log(target);
        let { dots } = this.state;
        let { top, left } = this.get_click_location(e);
        let position_id = `${left},${top}`;
        let dot = dots[position_id];
        console.log(dot, position_id);

        if (dot.wires.size || active_component) {
          this.recent_click_coords = { top, left };
          return this.setState({ active_component: dot });
        }

        let { wire, dot_location } = this.add_wire(
          is_child_of(target, "dot").getAttribute("name").split(",")
        );
        dots[`${dot_location[0]},${dot_location[1]}`].wires.add(wire);
        this.setState({ dots });
        console.log(this.state.active_component);
      } else if (class_list.contains("gate_body")) {
        if (class_list.contains("add_gate"))
          this.add_gate(target.getAttribute("name"));
        else this.setState({ active_component: this.state.gates[id] });
      }
    };

    document.addEventListener("mousemove", (e) => {
      let { active_component } = this.state;
      let { top, left } = this.get_click_location(e);
      emitter.emit("update_coords", { top, left });
      console.log(active_component);

      if (!active_component) return;

      if (active_component._id.startsWith("wire")) {
        let previous_dot = this.state.active_component.path.slice(-1)[0];
        let calculated_dot = this.calculate_dot(top, left);

        if (!previous_dot[0]) return;

        this.resort_dot_wires(previous_dot, active_component._id, true);

        if (calculated_dot[0] === previous_dot[0]) {
          previous_dot[3] = top - previous_dot[1];
          previous_dot[2] = 2;
          active_component.path.splice(-1, 1, previous_dot);
        } else if (calculated_dot[1] === previous_dot[1]) {
          previous_dot[2] = left - previous_dot[0];
          active_component.path.splice(-1, 1, previous_dot);
          previous_dot[3] = 2;
        }

        emitter.emit(
          `wire_current_endpoint_${active_component._id}`,
          active_component.path
        );

        this.resort_dot_wires(
          active_component.path.slice(-1)[0],
          active_component._id,
          false
        );

        this.setState({ active_component });
      } else if (active_component._id.startsWith("dot")) {
        let wires = Array.from(active_component.wires);
        let { top, left } = this.get_click_location(e);

        wires.map((wire) => {
          wire = this.state.wires[wire];
          let calculated_dot = this.calculate_dot(top, left, wire);
          let vertical;
          for (let p = 0; p < (this.wire_path ? 1 : wire.path.length); p++) {
            let path = this.wire_path || wire.path[p];
            if (path[0] === calculated_dot[0]) {
              let wire_length = path[1] + path[3];
              if (!this.wire_path) {
                console.log("isityou");
                if (
                  path[3] > 0 &&
                  (calculated_dot[1] < path[1] ||
                    calculated_dot[1] > wire_length)
                ) {
                  console.log(calculated_dot, path);
                  continue;
                }
                if (
                  path[3] < 0 &&
                  (calculated_dot[1] > path[1] ||
                    calculated_dot[1] < wire_length)
                ) {
                  console.log(calculated_dot, path, "NEGATIF");
                  continue;
                }
                this.wire_path = path;
              }
              console.log(path, "Holla me nau");

              vertical = true;
              if (path[3] > 0) {
                if (path[1] + path[3] >= this.recent_click_coords.top) {
                  let diff = path[1] + path[3] - this.recent_click_coords.top;
                  if (this.floating_wire) {
                  } else
                    this.floating_wire = [
                      path[0],
                      this.recent_click_coords.top,
                      2,
                      diff,
                      wire._id,
                    ];
                } else
                  console.log(
                    path[0],
                    path[1],
                    path[2],
                    path[3],
                    this.recent_click_coords,
                    "ELSE WHAT!"
                  );

                path[3] = top - path[1];
                console.log("HHHHHEEEELLLLLOOOOO");
              } else if (path[3] < 0) {
                console.log("EVERHERE");
                let diff;
                if (
                  path[1] >= this.recent_click_coords.top &&
                  path[1] + path[3] <= this.recent_click_coords.top
                ) {
                  diff = path[1] + path[3] - this.recent_click_coords.top;

                  if (this.floating_wire) {
                  } else
                    this.floating_wire = [
                      path[0],
                      this.recent_click_coords.top + diff,
                      2,
                      diff,
                      wire._id,
                    ];
                } else
                  console.log(
                    path[0],
                    path[1],
                    path[2],
                    path[3],
                    this.recent_click_coords,
                    "ELSE WHAT!"
                  );
                console.log(diff, this.floating_wire, "HOLLA ME");
                path[3] = diff * -1;
              }
            } else if (path[1] === calculated_dot[1]) {
              console.log("HORIZONTALLLLL");
              vertical = false;

              let wire_horizontal_length = path[0] + path[2];
              if (
                !this.wire_path &&
                (calculated_dot[0] < path[0] ||
                  calculated_dot[0] > wire_horizontal_length)
              )
                continue;
              else this.wire_path = path;

              if (path[0] + path[2] >= this.recent_click_coords.left) {
                let diff = path[0] + path[2] - this.recent_click_coords.left;
                if (this.floating_wire) {
                } else
                  this.floating_wire = [
                    this.recent_click_coords.left,
                    path[1],
                    diff,
                    2,
                    wire._id,
                  ];
              }

              path[2] = left - path[0];
            }
            if (vertical !== undefined) {
              wire.path[p] = path;
              break;
            }
          }
          if (vertical !== undefined) {
            console.log("ever got in here????????");
            emitter.emit(`wire_current_endpoint_${wire._id}`, wire.path);
            emitter.emit(`floating_wire_${wire._id}`, this.floating_wire);
            return;
          }
        });
      } else
        emitter.emit(`component_position_${active_component._id}`, {
          top,
          left,
        });
    });
  };

  add_wire = (dot_location) => {
    let { wires, dots } = this.state;
    let wire_id = _id("wire");

    let wire = {
      _id: wire_id,
      path: new Array([...dot_location.map((d) => Number(d)), 0, 0]),
    };

    wires[wire_id] = wire;
    dots[`${dot_location[0]},${dot_location[1]}`].wires.add(wire_id);

    this.setState({ wires, active_component: wire, dots });

    return { wire: wire_id, dot_location };
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
