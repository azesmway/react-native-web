import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CountriesState {
  countries: any[]
  hobby: any[]
  agent: any[]
}

const initialState: CountriesState = {
  countries: [],
  hobby: [],
  agent: []
}

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    setAllCountries(state, action: PayloadAction<any[]>) {
      state.countries = action.payload ?? []
    },
    setAllHobby(state, action: PayloadAction<any[]>) {
      state.hobby = action.payload ?? []
    },
    setAllAgent(state, action: PayloadAction<any[]>) {
      state.agent = action.payload ?? []
    }
  }
})

const countriesAction = countriesSlice.actions

// Selectors
const countriesSelector = {
  getAllCountries: (state: any) => state.countries.countries,
  getAllHobby: (state: any) => state.countries.hobby,
  getAllAgent: (state: any) => state.countries.agent
}

export { countriesAction, countriesSelector }
export default countriesSlice.reducer
