import React from "react";
import Gates from "./gates";
import Port from "./port";

class And_gate extends Gates {
  constructor(props) {
    super(props);

    let { properties } = this.props;
    this.state = { properties };
  }

  componentDidMount = () => {
    this.on_mount();
  };

  render() {
    let { sidepane } = this.props;
    let { properties } = this.state;

    let { top, left, _id } = properties || new Object();

    return (
      <div
        className={"gate"}
        style={
          sidepane ? { position: "relative", top: 0, left: 0 } : { top, left }
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div style={{ display: "inline" }}>
            <Port />
            <div style={{ height: 38 }}></div>
            <Port />
          </div>
          <div style={{ display: "inline" }}>
            <div
              name="and"
              id={_id}
              className={"and_gate gate_body" + (sidepane ? " add_gate" : "")}
            ></div>
          </div>
          <div style={{ display: "inline" }}>
            <Port />
          </div>
        </div>
      </div>
    );
  }
}

export default And_gate;
