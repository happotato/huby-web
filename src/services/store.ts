import { createStore, Action, applyMiddleware } from "redux";
import ReduxThunk, { ThunkAction } from "redux-thunk";
import {
  UserToken,
  LogInData,
  SignUpData,
  SortMode,
  auth,
  login,
  createAccount
} from "./api";

export type ViewMode = "minimal" | "image";
export type ApplicationActionType = "LOGGING_IN" | "LOGIN" | "LOGOUT" | "FAVORITE_HUB" | "UNFAVORITE_HUB" | "TOGGLE_NSFW" | "SET_VIEW" | "SET_SORT";

export interface ApplicationState {
  user?: UserToken;
  isLoadingUser: boolean;
  showNsfw: boolean;
  favoriteHubs: string[];
  view: ViewMode;
  sort: SortMode;
}

interface ApplicationAction extends Action<ApplicationActionType> {
  payload?: string | ViewMode | UserToken;
}

type ApplicationThunkAction<T> = ThunkAction<T, ApplicationState, never, ApplicationAction>;

const initialApplicationState: ApplicationState = {
  user: undefined,
  isLoadingUser: false,
  favoriteHubs: [],
  showNsfw: localStorage.getItem("nsfw") == "true",
  view: (localStorage.getItem("view") || "minimal") as ViewMode,
  sort: (localStorage.getItem("sort") || "hot") as SortMode,
};

export function authAction(): ApplicationThunkAction<void> {
  return async (dispatch) => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch({
        type: "LOGGING_IN",
      });

      try {
        const userToken = await auth(token);
        
        dispatch({
          type: "LOGIN",
          payload: userToken,
        });
      } catch (e) {
        dispatch({
          type: "LOGOUT",
        });

        console.error(e);
      }
    }
  };
}

export function createAccountAction(data: SignUpData): ApplicationThunkAction<void> {
  return async (dispatch) => {
    dispatch({
      type: "LOGGING_IN",
    });

    try {
      const userToken = await createAccount(data);

      dispatch({
        type: "LOGIN",
        payload: userToken,
      });
    } catch (e) {
      dispatch({
        type: "LOGOUT",
      });

      console.error(e);
    }
  };
}

export function loginAction(data: LogInData): ApplicationThunkAction<void> {
  return async (dispatch) => {
    dispatch({
      type: "LOGGING_IN",
    });

    try {
      const userToken = await login(data);

      dispatch({
        type: "LOGIN",
        payload: userToken,
      });
    } catch (e) {
      dispatch({
        type: "LOGOUT",
      });
    }
  };
}

export function logoutAction(): ApplicationAction {
  return {
    type: "LOGOUT",
  };
}

export function favoriteHubAction(name: string): ApplicationAction {
  return {
    type: "FAVORITE_HUB",
    payload: name,
  };
}

export function unfavoriteHubAction(name: string): ApplicationAction {
  return {
    type: "UNFAVORITE_HUB",
    payload: name,
  };
}

export function toggleNsfwAction(): ApplicationAction {
  return {
    type: "TOGGLE_NSFW",
  };
}

export function setViewAction(mode: ViewMode): ApplicationAction {
  return {
    type: "SET_VIEW",
    payload: mode,
  };
}

export function setSortAction(mode: SortMode): ApplicationAction {
  return {
    type: "SET_SORT",
    payload: mode,
  };
}

function reducer(state: ApplicationState = initialApplicationState, action: ApplicationAction) : ApplicationState {
  switch (action.type) {
    case "LOGGING_IN": {
      return {
        ...state,
        isLoadingUser: true,
      };
    };

    case "LOGIN": {
      const user = action.payload as UserToken;

      localStorage.setItem("token", user.token);

      const favoriteHubs = (localStorage.getItem("history") ?? "")
        .split(" ")
        .map(item => item.trim())
        .filter(item => item != "");

      return {
        ...state,
        isLoadingUser: false,
        user,
        favoriteHubs,
      };
    };

    case "LOGOUT": {
      localStorage.removeItem("token");
      return {
        ...state,
        user: undefined,
        isLoadingUser: false,
      };
    };

    case "SET_VIEW": {
      const view = action.payload as ViewMode;
      localStorage.setItem("view", view);

      return {
        ...state,
        view,
      };
    };

    case "SET_SORT": {
      const sort = action.payload as SortMode;
      localStorage.setItem("sort", sort);

      return {
        ...state,
        sort,
      };
    };

    case "FAVORITE_HUB": {
      if (action.payload) {
        const favoriteHubs = state.favoriteHubs
          .filter(name => name != action.payload)
          .concat([action.payload as string]);

        localStorage.setItem("history", favoriteHubs.join(" "));

        return {
          ...state,
          favoriteHubs,
        };
      }

      return state;
    };

    case "UNFAVORITE_HUB": {
      if (action.payload) {
        const favoriteHubs = state.favoriteHubs
          .filter(name => name != action.payload);

        localStorage.setItem("history", favoriteHubs.join(" "));

        return {
          ...state,
          favoriteHubs,
        };
      }

      return state;
    };

    case "TOGGLE_NSFW": {
      localStorage.setItem("nsfw", `${!state.showNsfw}`);

      return {
        ...state,
        showNsfw: !state.showNsfw,
      };
    };

    default: {
      return state;
    }
  }
}

const configureStore = () => createStore(reducer, initialApplicationState, applyMiddleware(ReduxThunk));

export default configureStore;
