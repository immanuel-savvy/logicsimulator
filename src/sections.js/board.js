import React from "react";
import And_gate from "../components/and_gate";
import Dot from "../components/dot";
import Inputs_wrapper from "../components/inputs_wrapper";
import Not_gate from "../components/not_gate";
import Or_gate from "../components/or_gate";
import Output_wrapper from "../components/outputs_wrapper";
import Wire from "../components/wire";

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    let { dots, gates, inputs, outputs, wires } = this.props;

    return (
      <div id="board">
        {Object.keys(dots).map((key, index) => {
          return <Dot dot={dots[key]} key={index} />;
        })}

        {Object.keys(inputs).map((input_id) => (
          <Inputs_wrapper key={input_id} input={inputs[input_id]} />
        ))}

        {Object.keys(outputs).map((output_id) => (
          <Output_wrapper key={output_id} output={outputs[output_id]} />
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
