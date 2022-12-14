import React from "react";
import And_gate from "../components/and_gate";
import Dot from "../components/dot";
import Not_gate from "../components/not_gate";
import Or_gate from "../components/or_gate";
import Wire from "../components/wire";

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    let { dots, gates, wires } = this.props;

    return (
      <div id="board">
        {dots.map(({ top, left }, index) => (
          <Dot top={top} left={left} id={index} key={index} />
        ))}

        {Object.keys(wires).map((wire_id) => (
          <Wire key={wire_id} wire={wires[wire_id]} />
        ))}

        {Object.keys(gates).map((gate_id, index) => {
          let gate = gates[gate_id];
          return gate.name === "and" ? (
            <And_gate properties={gate} key={index} />
          ) : gate.name === "or" ? (
            <Or_gate properties={gate} key={index} />
          ) : gate.name === "not" ? (
            <Not_gate properties={gate} key={index} />
          ) : null;
        })}
      </div>
    );
  }
}

export default Board;
