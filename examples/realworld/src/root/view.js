import { Routing } from "meiosis-routing/state"

import { Header, Footer } from "../layout"
import { Home } from "../home"

const componentMap = {
  Home
}

export const Root = ({ state, actions }) => {
  const routing = Routing(state.route.current)
  const Component = componentMap[routing.localSegment.id]

  return ["div", Header({ state }), Component({ state, actions, routing }), Footer()]
}

