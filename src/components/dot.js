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
        style={{ top: top - 4, left: left - 4 }}
        className="dot"
      >
        <div className="dot_inner"></div>
      </div>
    );
  }
}

export default Dot;
