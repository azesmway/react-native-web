import * as types from './actionTypes'

export function setAllCountries(countries) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_COUNTRIES, countries: countries })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setAllHobby(hobby) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_HOBBY, hobby: hobby })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setAllAgent(agent) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_COUNTRIES_AGENT, agent: agent })
    } catch (error) {
      console.error(error)
    }
  }
}

