import { LitElement, html } from "lit-element"

import { conditions, Conditions } from "../conditions"
import { dateTime, DateTime } from "../dateTime"
import { temperature, Temperature } from "../temperature"
import { bootstrap } from "../util"

export const app = {
  Initial: () => ({
    dateTime: dateTime.Initial(),
    conditions: conditions.Initial(),
    "temperature:air": temperature.Initial(),
    "temperature:water": temperature.Initial()
  }),

  Actions: update =>
    Object.assign(
      {},
      conditions.Actions(update),
      dateTime.Actions(update),
      temperature.Actions(update)
    )
}

export const App = ({ initial, actions }) =>
  class extends LitElement {
    static get properties() {
      return {
        state: Object,
        actions: Object
      }
    }
    constructor() {
      super()
      this.state = initial
    }
    render() {
      const { state } = this
      return html`
        ${bootstrap}
        <div class="row">
          <div class="col-md-4">
            <date-time .state=${state} id="dateTime" .actions=${actions}></date-time>
          </div>
          <div class="col-md-4">
            <sky-conditions .state=${state} id="conditions" .actions=${actions}></sky-conditions>
            <temp-el .state=${state} id="temperature:air" .actions=${actions}></temp-el>
            <temp-el .state=${state} id="temperature:water" .actions=${actions}></temp-el>
          </div>
        </div>
      `
    }
  }

customElements.define("sky-conditions", Conditions)
customElements.define("date-time", DateTime)
customElements.define("temp-el", Temperature)
