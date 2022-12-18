import React from "react";
import { emitter } from "../Simulator";
import Buttons from "./buttons";
import Port from "./port";

class Push_button extends Buttons {
  constructor(props) {
    super(props);

    let { button } = this.props;
    this.state = { button };
  }

  componentDidMount = () => {
    let { button, sidepane } = this.props;
    if (sidepane) return;

    this.on_mount();

    this.button_property = (button) => {
      this.setState({ button: { ...this.state.button, ...button } });
    };

    emitter.single_listener(
      `button_property_${button._id}`,
      this.button_property
    );
  };

  render() {
    let { sidepane } = this.props;
    let { button } = this.state;
    let { on, top, _id, left, port } = button || new Object();

    return (
      <>
        <div
          id={_id}
          className={"button" + (sidepane ? " add_button" : "")}
          name="push_button"
          style={
            sidepane
              ? { cursor: "grab" }
              : {
                  position: "absolute",
                  top: top - 8,
                  left: left - 20,
                  backgroundColor: on ? "lightgreen" : "grey",
                }
          }
        >
          <span>{on ? 1 : 0}</span>

          <Port port={port} style={{ position: "relative", left: 5 }} />
        </div>

        {sidepane ? (
          <>
            <span>
              Push <br />
              Button
            </span>
          </>
        ) : null}
      </>
    );
  }
}

export default Push_button;
