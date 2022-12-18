import React from "react";
import Push_button from "./push_button";

class Inputs_wrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    let { input } = this.props;
    return (
      <>
        {input.name === "push_button" ? <Push_button button={input} /> : null}
      </>
    );
  }
}

export default Inputs_wrapper;
