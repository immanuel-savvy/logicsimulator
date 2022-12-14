import React from "react";

class Dot extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    let { id, top, left } = this.props;

    return (
      <div
        id={id}
        name={`${left},${top}`}
        style={{ top, left }}
        className="dot"
      ></div>
    );
  }
}

export default Dot;
