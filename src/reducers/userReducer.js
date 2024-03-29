
const SET_USER = "SET_USER"
const LOGOUT = "LOGOUT"
const SET_ADMIN = "SET_ADMIN"

const defaultState ={
    currentUser:{},
    isAuth: false,
    isAdmin: false
}

export default function userReducer(state = defaultState, action){
    switch (action.type){

        case SET_USER:
            return {
                ...state,
                currentUser: action.payload.user,
                isAuth: true,
            }
        case SET_ADMIN:
            return {
                ...state,
                isAdmin: true
            }
        case LOGOUT:
            localStorage.removeItem('token')
            localStorage.removeItem('name')
            localStorage.removeItem('surname')
            return {
                ...state,
                currentUser: {},
                isAuth: false,
                isAdmin: false
            }
        default:
            return state
    }
}

export const setUser = user =>({type: SET_USER, payload: user})
export const logout = () =>({type: LOGOUT})
export const setAdmin = role =>({type: SET_ADMIN, payload: role})