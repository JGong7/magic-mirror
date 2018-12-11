import React, { Component } from "react";
import * as moment from "moment";
import { getApiUrl } from "../utils";
import * as Sentry from "@sentry/browser";
import "./cta.css";

export class CTA extends Component {
  constructor() {
    super();
    this.state = { trains: {} };
    setInterval(this.updateSchedule.bind(this), 15000);
  }

  async updateSchedule() {
    let body;
    try {
      let res = await fetch(getApiUrl("cta"));
      body = await res.json();
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
      return;
    }
    let trains = {};
    for (let train of body.trains) {
      if (!trains[train.route + train.stopDescription]) {
        trains[train.route + train.stopDescription] = [];
      }
      trains[train.route + train.stopDescription].push(train);
    }
    this.setState({ trains });
  }

  componentDidMount() {
    this.updateSchedule();
  }

  renderTrain(dest) {
    let train = this.state.trains[dest];
    let now = moment();
    let arrivals = train
      .map(t => {
        let diff = moment(t.arrivalTime, "YYYYMMDD HH:mm:ss").diff(
          now,
          "minutes"
        );
        return diff < 1 ? "Now" : diff;
      })
      .join(", ");
    return (
      <div className={`schedule ${train[0].route}`} key={train[0].runNumber}>
        <div className="route">{train[0].terminalDestinationName}: </div>
        <div className="arrivals">{arrivals} mins</div>
      </div>
    );
  }

  render() {
    return (
      <div className="cta">
        {Object.keys(this.state.trains)
          .sort()
          .map(dest => this.renderTrain(dest))}
      </div>
    );
  }
}
