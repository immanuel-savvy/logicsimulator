import React from "react";
import And_gate from "../components/and_gate";
import Not_gate from "../components/not_gate";
import Or_gate from "../components/or_gate";

class Sidepane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  onclick = (gate) => {
    this.props.add_gate(gate);
  };

  render() {
    let { title } = this.props;
    title = title || "Circuit Simulator";

    return (
      <div className="sidepane" style={{ margin: 15 }}>
        <h1 className="title">{title}</h1>

        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <And_gate sidepane />
          <Or_gate sidepane />
          <Not_gate sidepane />
        </div>
      </div>
    );
  }
}

export default Sidepane;
