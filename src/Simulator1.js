import "./App.css";
import React from "react";
import Emitter from "semitter";
import { _id } from "./assets/js/utils";

const emitter = new Emitter();

class Simulator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      net_energy: 0,
      net_charge: 0,
      fundamental_particles: {},
      structure: {
        up_quarks: {
          amount: 14,
          mass: 2.4,
          charge: 2 / 3,
        },
        down_quarks: {
          amount: 7,
          mass: 4.8,
          charge: -1 / 3,
        },
      },
    };

    this.c = 1;
  }

  calculate_gross_energy_level = (structure) => {
    let gross_energy = 0,
      gross_charge = 0;

    for (const key in structure) {
      let struct = structure[key];
      gross_energy += this.c * this.c * struct.mass * struct.amount;
      gross_charge += struct.charge * struct.amount;
    }

    if (gross_charge.toString().split(".")[1].startsWith("999999"))
      gross_charge = Math.round(gross_charge);

    return { gross_energy, gross_charge };
  };

  charge_to_energy = (charge) => {};

  componentDidMount = () => {
    let { structure } = this.state;
    let { gross_charge, gross_energy } =
      this.calculate_gross_energy_level(structure);

    if (gross_charge !== 0) {
      gross_energy += Math.abs(gross_charge * (gross_energy / gross_charge));
    }

    this.setState({ gross_energy, gross_charge });
    setInterval(() => {
      let { net_energy, net_charge } = this.state;

      if (net_energy !== gross_energy) {
        console.log("unbalanced energy state");
      }
      if (net_charge !== gross_charge) {
        console.log("Uncharged verse");
      }
      if (net_charge) {
        console.log("biased charged verse");
      }
    }, 3000);
  };

  render = () => {
    let { gross_energy, gross_charge } = this.state;
    console.log(gross_energy, gross_charge);

    return (
      <div id="main" onClick={this.onclick}>
        <h1>My Verse</h1>
      </div>
    );
  };
}

export default Simulator;
export { emitter };
