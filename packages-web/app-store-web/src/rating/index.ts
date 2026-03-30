import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface RatingFilter {
  selectedCountries: any[]
  selectedPlaces: any[]
  indexCategory: number
}

interface RatingState {
  hotels: any[]
  myRatingLocal: any[]
  myRatingServer: any[]
  time: string
  filter: RatingFilter
  alertHotels: any
  alertMyHotels: any
  criteriaRating: any[]
  saveRatingCache: any
  selectedRatingCategory: number
  changeMyRating: boolean
  editRating: boolean
}

const initialState: RatingState = {
  hotels: [],
  myRatingLocal: [],
  myRatingServer: [],
  time: '',
  filter: { selectedCountries: [], selectedPlaces: [], indexCategory: 0 },
  alertHotels: null,
  alertMyHotels: null,
  criteriaRating: [],
  saveRatingCache: null,
  selectedRatingCategory: 0,
  changeMyRating: false,
  editRating: true
}

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    setHotels(state, action: PayloadAction<any[]>) {
      state.hotels = action.payload
    },
    changeMyRatingLocal(state, action: PayloadAction<any[]>) {
      state.myRatingLocal = action.payload
    },
    changeMyRatingServer(state, action: PayloadAction<any[]>) {
      state.myRatingServer = action.payload
    },
    setTime(state, action: PayloadAction<string>) {
      state.time = action.payload
    },
    changeRatingFilter(state, action: PayloadAction<RatingFilter>) {
      state.filter = action.payload
    },
    setAlertHotels(state, action: PayloadAction<any>) {
      state.alertHotels = action.payload
    },
    setAlertMyHotels(state, action: PayloadAction<any>) {
      state.alertMyHotels = action.payload
    },
    changeCriteria(state, action: PayloadAction<any[]>) {
      state.criteriaRating = action.payload
    },
    saveRatingCache(state, action: PayloadAction<any>) {
      state.saveRatingCache = action.payload
    },
    setSelectedRatingCategory(state, action: PayloadAction<number>) {
      state.selectedRatingCategory = action.payload
    },
    setChangeMyRating(state, action: PayloadAction<boolean>) {
      state.changeMyRating = action.payload
    },
    setEditRating(state, action: PayloadAction<boolean>) {
      state.editRating = action.payload
    }
  }
})

// ratingAction, ratingSelector
const ratingAction = ratingSlice.actions

// Selectors
const ratingSelector = {
  getHotels: (state: any) => state.rating.hotels,
  getMyRatingLocal: (state: any) => state.rating.myRatingLocal,
  getMyRatingServer: (state: any) => state.rating.myRatingServer,
  getRatingTime: (state: any) => state.rating.time,
  getRatingFilter: (state: any) => state.rating.filter,
  getAlertHotels: (state: any) => state.rating.alertHotels,
  getAlertMyHotels: (state: any) => state.rating.alertMyHotels,
  getCriteria: (state: any) => state.rating.criteriaRating,
  getSaveRatingCache: (state: any) => state.rating.saveRatingCache,
  getSelectedRatingCategory: (state: any) => state.rating.selectedRatingCategory,
  getChangeMyRating: (state: any) => state.rating.changeMyRating,
  getEditRating: (state: any) => state.rating.editRating
}

export { ratingAction, ratingSelector }
export default ratingSlice.reducer
