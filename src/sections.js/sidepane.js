import React from "react";
import And_gate from "../components/and_gate";
import Coords from "../components/coord";
import Not_gate from "../components/not_gate";
import Or_gate from "../components/or_gate";
import Push_button from "../components/push_button";
import Switch from "../components/switch";
import Icon, { FontAwesome, Feather } from "react-web-vector-icons";

class Sidepane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  onclick = (gate) => {
    this.props.add_gate(gate);
  };

  render() {
    let { title, touch } = this.props;
    title = title || "Circuit Simulator";

    return (
      <div className="sidepane" style={{ margin: 15 }}>
        <h1 className="title">{title}</h1>

        <p>Pickers</p>
        <div
          id="touch_toggler"
          style={{
            cursor: "pointer",
            display: "inline",
            background: touch ? "grey" : "transparent",
            padding: 5,
          }}
        >
          <FontAwesome name="hand-pointer-o" color="#000" size={15} />
        </div>
        <p>Gates</p>
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <And_gate sidepane />
          <Or_gate sidepane />
          <Not_gate sidepane />
        </div>

        <p>Sources</p>
        <Push_button sidepane />
        <Switch />

        <br />
        <br />
        <br />
        <Coords />
      </div>
    );
  }
}

export default Sidepane;
