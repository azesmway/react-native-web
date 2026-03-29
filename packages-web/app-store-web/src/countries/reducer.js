import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  countries: [],
  hobby: [],
  agent: []
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CHANGE_COUNTRIES:
      return {
        ...state,
        countries: action.countries ? action.countries : []
      }
    case types.CHANGE_HOBBY:
      return {
        ...state,
        hobby: action.hobby ? action.hobby : []
      }
    case types.CHANGE_COUNTRIES_AGENT:
      return {
        ...state,
        agent: action.agent ? action.agent : []
      }
    default:
      return state
  }
}

export function getAllCountries(state) {
  return state.countries.countries
}

export function getAllHobby(state) {
  return state.countries.hobby
}

export function getAllAgent(state) {
  return state.countries.agent
}
