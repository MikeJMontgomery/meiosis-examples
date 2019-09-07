import React, { Component } from "react"

import { conditions, Conditions } from "../conditions"
import { dateTime, DateTime } from "../dateTime"
import { temperature, Temperature } from "../temperature"

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

export class App extends Component {
  constructor(props) {
    super(props)
    this.state = props.states()
  }

  componentDidMount() {
    this.props.states.map(state => {
      this.setState(state)
    })
  }

  render() {
    const state = this.state
    const { actions } = this.props

    return (
      <div>
        <DateTime state={state} id="dateTime" actions={actions} />
        <Conditions state={state} id="conditions" actions={actions} />
        <Temperature state={state} id="temperature:air" actions={actions} />
        <Temperature state={state} id="temperature:water" actions={actions} />
      </div>
    )
  }
}
