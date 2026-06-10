import {combineReducers} from 'redux';
import UserinfoReducer from './UserinfoReducer';
import loadingReducer from './loadingRedux';
import restaurantReducer from './restaurantReducer';
import sessionExpiryReducer from './sessionExpiryRedux';
import globalErrorReducer from './globalErrorRedux';

const appReducer = combineReducers({
  Userinfo: UserinfoReducer,
  loading: loadingReducer,
  restaurant: restaurantReducer,
  sessionExpiry: sessionExpiryReducer,
  globalError: globalErrorReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    // Reset the state to undefined
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
