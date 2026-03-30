import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface FilterState {
  filterChat: Record<string, any>
  fileInstall: boolean
  selectHotel: Record<string, any>
  selectPlace: Record<string, any>
}

const initialState: FilterState = {
  filterChat: {
    selectedCountry: '-1',
    selectedHotel: '-1',
    selectedHobby: '-1',
    selectedPlace: '-1',
    selectedCountryName: '',
    selectedHotelName: '',
    selectedHobbyName: '',
    selectedPlaceName: '',
    selectedCountryHide: 0,
    selectedHotelHide: 0,
    selectedHobbyHide: 0,
    selectedPlaceHide: 0,
    selectedFav: '0',
    selectedFavName: '',
    searchFav: '',
    idUserFav: '0',
    nameUserFav: '',
    chatAgent: null,
    selectedAgent: '-1',
    selectedAgentName: '',
    selectCategory: {},
    selectSearch: {}
  },
  fileInstall: false,
  selectHotel: {},
  selectPlace: {}
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Record<string, any>>) {
      state.filterChat = action.payload
    },
    setFileInstall(state, action: PayloadAction<boolean>) {
      state.fileInstall = action.payload
    },
    setSelectHotel(state, action: PayloadAction<Record<string, any>>) {
      state.selectHotel = action.payload
    },
    setSelectPlace(state, action: PayloadAction<Record<string, any>>) {
      state.selectPlace = action.payload
    },
    setSelectCategory(state, action: PayloadAction<Record<string, any>>) {
      state.filterChat = { ...state.filterChat, selectCategory: action.payload }
    }
  }
})

//  filterAction, filterSelector
const filterAction = filterSlice.actions

// Selectors
const filterSelector = {
  getFilter: (state: any) => state.filter.filterChat,
  getSelectCategory: (state: any) => state.filter.filterChat?.selectCategory ?? null,
  getSelectSearch: (state: any) => state.filter.filterChat?.selectSearch ?? null,
  getFileInstall: (state: any) => state.filter.fileInstall,
  getSelectHotel: (state: any) => state.filter.selectHotel,
  getSelectPlace: (state: any) => state.filter.selectPlace
}

export { filterAction, filterSelector }
export default filterSlice.reducer
