import { createStore, Action, applyMiddleware } from "redux";
import ReduxThunk, { ThunkAction } from "redux-thunk";
import {
  User,
  UserToken,
  LogInData,
  SignUpData,
  SortMode,
  auth,
  login,
  createAccount,
  getUser,
} from "./api";

export type ViewMode = "minimal" | "image";

export interface ApplicationState {
  user?: UserToken;
  isLoadingUser: boolean;
  showNsfw: boolean;
  favoriteHubs: string[];
  view: ViewMode;
  sort: SortMode;
}

interface LoggingInAction extends Action<"LOGGING_IN"> {}
interface LogoutAction extends Action<"LOGOUT"> {}
interface ToggleExplicitAction extends Action<"TOGGLE_NSFW"> {}

interface LoginAction extends Action<"LOGIN"> {
  userToken: UserToken;
}

interface UpdateUserAction extends Action<"UPDATE_USER"> {
  user: User;
}

interface FavoriteHubAction extends Action<"FAVORITE_HUB"> {
  name: string;
}

interface UnfavoriteHubAction extends Action<"UNFAVORITE_HUB"> {
  name: string;
}

interface SetViewAction extends Action<"SET_VIEW"> {
  view: ViewMode;
}

interface SetSortAction extends Action<"SET_SORT"> {
  sort: SortMode;
}

type ApplicationAction = LoggingInAction | LoginAction | LogoutAction | UpdateUserAction | FavoriteHubAction | UnfavoriteHubAction | ToggleExplicitAction | SetViewAction | SetSortAction;
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
          userToken,
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
        userToken,
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
        userToken,
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

export function updateUserAction(): ApplicationThunkAction<void> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.user) {
      const user = await getUser(state.user.user.username, state.user.token);

      dispatch({
        type: "UPDATE_USER",
        user,
      });
    }
  };
}

export function favoriteHubAction(name: string): ApplicationAction {
  return {
    type: "FAVORITE_HUB",
    name,
  };
}

export function unfavoriteHubAction(name: string): ApplicationAction {
  return {
    type: "UNFAVORITE_HUB",
    name,
  };
}

export function toggleNsfwAction(): ApplicationAction {
  return {
    type: "TOGGLE_NSFW",
  };
}

export function setViewAction(view: ViewMode): ApplicationAction {
  return {
    type: "SET_VIEW",
    view,
  };
}

export function setSortAction(sort: SortMode): ApplicationAction {
  return {
    type: "SET_SORT",
    sort,
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
      const user = action.userToken;

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

    case "UPDATE_USER": {
      if (!state.user) return state;

      return {
        ...state,
        user: {
          ...state.user,
          user: action.user,
        }
      };
    };

    case "SET_VIEW": {
      const view = action.view;
      localStorage.setItem("view", view);

      return {
        ...state,
        view,
      };
    };

    case "SET_SORT": {
      const sort = action.sort;
      localStorage.setItem("sort", sort);

      return {
        ...state,
        sort,
      };
    };

    case "FAVORITE_HUB": {
      const favoriteHubs = state.favoriteHubs
        .filter(name => name != action.name)
        .concat([action.name as string]);

      localStorage.setItem("history", favoriteHubs.join(" "));

      return {
        ...state,
        favoriteHubs,
      };
    };

    case "UNFAVORITE_HUB": {
      const favoriteHubs = state.favoriteHubs
        .filter(name => name != action.name);

      localStorage.setItem("history", favoriteHubs.join(" "));

      return {
        ...state,
        favoriteHubs,
      };
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
