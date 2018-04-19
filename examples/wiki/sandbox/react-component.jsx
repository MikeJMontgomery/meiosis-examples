/*global $*/

import flyd from "flyd";
import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash/fp";
import { trace } from "meiosis";
import meiosisTracer from "meiosis-tracer";

const nestUpdate = (update, path) => func => update(_.update(path, func));

const nest = (create, update, path) => {
  const view = create(nestUpdate(update, path));

  // This is equivalent to:
  // return model => view(_.get(path, model));
  return _.flow([_.get(path), view]);
};

const entry = {
  model: () => ({
    value: ""
  }),

  create: update => {
    const actions = {
      editEntryValue: evt => update(_.set("value", evt.target.value))
    };

    return model => (
      <div>
        <span style={{marginRight: 8}}>Entry number:</span>
        <input type="text" size="2" value={model.value} onChange={actions.editEntryValue}/>
      </div>
    );
  }
};

class DateField extends React.Component {
  static model() {
    return {
      value: ""
    };
  }

  componentWillMount() {
    this.dateFieldRef = React.createRef();
    const update = this.props.update;

    const updates = {
      editDateValue: value => update(_.set("value", value))
    };

    this.actions = {
      editDateValue: evt => updates.editDateValue(evt.target.value)
    };
  }

  componentDidMount() {
    const update = this.props.update;

    const $datepicker = $(this.dateFieldRef.current);

    $datepicker
      .datepicker({ autoHide: true })
      .on("pick.datepicker", _evt =>
        update(_.set("value", $datepicker.datepicker("getDate", true)))
      )
  }

  render() {
    const model = this.props.model;
    const actions = this.actions;

    return (
      <div style={{marginTop: 8}}>
        <span style={{marginRight: 8}}>Date:</span>
        <input ref={this.dateFieldRef} type="text" size="10" value={model.value}
          onChange={actions.editDateValue}/>
      </div>
    );
  }

  componentWillUnmount() {
    $(this.dateFieldRef.current).datepicker("destroy");
  }
}

const temperature = {
  model: label => ({
    label,
    value: 20,
    units: "C"
  }),

  create: update => {
    const actions = {
      increase: value => evt => {
        evt.preventDefault();
        update(_.update("value", _.add(value)));
      },
      changeUnits: evt => {
        evt.preventDefault();
        update(model => {
          if (model.units === "C") {
            model.units = "F";
            model.value = Math.round( model.value * 9 / 5 + 32 );
          }
          else {
            model.units = "C";
            model.value = Math.round( (model.value - 32) / 9 * 5 );
          }
          return model;
        })
      }
    };

    return model => (
      <div className="row" style={{marginTop: 8}}>
        <div className="col-md-3">
          <span>{model.label} Temperature: {model.value}&deg;{model.units} </span>
        </div>
        <div className="col-md-6">
          <button className="btn btn-sm btn-default" onClick={actions.increase(1)}>Increase</button>{" "}
          <button className="btn btn-sm btn-default" onClick={actions.increase(-1)}>Decrease</button>{" "}
          <button className="btn btn-sm btn-info" onClick={actions.changeUnits}>Change Units</button>
        </div>
      </div>
    );
  }
};

const app = {
  model: () => ({
    entry: entry.model(),
    date: DateField.model(),
    temperature: {
      air: temperature.model("Air"),
      water: temperature.model("Water")
    },
    saved: ""
  }),

  create: update => {
    const displayTemperature = temperature => temperature.label + ": " +
      temperature.value + "\xB0" + temperature.units;

    const actions = {
      save: evt => {
        evt.preventDefault();
        update(model => {
          model.saved = " Entry #" + model.entry.value +
            " on " + model.date.value + ":" +
            " Temperatures: " +
            displayTemperature(model.temperature.air) + " " +
            displayTemperature(model.temperature.water);

          model.entry.value = "";
          model.date.value = "";

          return model;
        });
      }
    };

    const components = {
      entry: nest(entry.create, update, "entry"),
      temperature: {
        air: nest(temperature.create, update, "temperature.air"),
        water: nest(temperature.create, update, ["temperature", "water"])
      }
    };

    return model => (
      <form>
        {components.entry(model)}
        <DateField model={model.date} update={nestUpdate(update, "date")} />
        {components.temperature.air(model)}
        {components.temperature.water(model)}
        <div>
          <button className="btn btn-primary" onClick={actions.save}>Save</button>
          <span>{model.saved}</span>
        </div>
      </form>
    );
  }
};

const update = flyd.stream();
const models = flyd.scan((model, func) => func(model),
  app.model(), update);

const element = document.getElementById("app");
const view = app.create(update);
models.map(model => ReactDOM.render(view(model), element));

trace({ update, dataStreams: [ models ] });
meiosisTracer({ selector: "#tracer" });
