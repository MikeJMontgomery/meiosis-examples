import { append, assoc } from "ramda";
import { Action } from "./action";

const updateMeasurement = update => measurement =>
  update.id === measurement.id ? update : measurement;

const rnd = (min, max) => Math.round(Math.random() * min) + (max || 0);

// handler : Model -> [ model, Task Action ]
const handler = model => ({
  NoOp: () => [model],
  AddMeasurement: () => [
    assoc("nextId",
      model.nextId + 1,
      assoc("measurements",
        append({
          id: model.nextId,
          label: "Measurement",
          value: rnd(50),
          max: rnd(50,100),
          units: rnd(10) % 2 === 0 ? "cm" : "mm"
        }, model.measurements),
        model
      )
    )
  ],
  RemoveMeasurement: id => [
    assoc("measurements", model.measurements.filter(m => m.id !== id), model)
  ],
  UpdateMeasurement: measurement => [
    assoc("measurements", model.measurements.map(updateMeasurement(measurement)), model)
  ]
});

// update : (Model, Action) -> [ model, Maybe (Task Action) ]
const update = (model, action) => Action.case(handler(model), action);

export { update };
