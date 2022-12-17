import React from "react";
import { emitter } from "../Simulator";

class Coords extends React.Component {
  constructor(props) {
    super(props);

    this.state = { coords: { top: 0, left: 0 } };
  }

  componentDidMount = () => {
    this.update_coords = (coords) => this.setState({ coords });

    emitter.listen("update_coords", this.update_coords);
  };

  render() {
    let { coords } = this.state;
    let { top, left } = coords;

    return <span style={{}}>{`${left} X ${top}`}</span>;
  }
}

export default Coords;
