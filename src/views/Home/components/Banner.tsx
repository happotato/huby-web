import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  SortMode,
} from "~/services/api";

import {
  ApplicationState,
  ViewMode,
  favoriteHubAction,
  toggleNsfwAction,
  unfavoriteHubAction,
  setViewAction,
  setSortAction,
} from "~/services/store";

interface HubBannerProps {
  className?: string;
  children?: React.ReactNode;
  defaultButtons?: boolean;
  name?: string;
  imageUrl?: string;
  color?: number;
}

export default function Banner(props: HubBannerProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const showNsfw = useSelector((store: ApplicationState) => store.showNsfw);
  const favoriteHubs = useSelector((store: ApplicationState) => store.favoriteHubs);
  const view = useSelector((store: ApplicationState) => store.view);
  const sort = useSelector((store: ApplicationState) => store.sort);
  const isFavorite = props.name && favoriteHubs.includes(props.name);

  const classes = ["hub-banner"]
    .concat(props.className?.split(" ") ?? [])
    .join(" ");

  function onFavoriteButtonClick(_: React.MouseEvent<HTMLButtonElement>) {
    if (props.name) {
      if (isFavorite) {
        dispatch(unfavoriteHubAction(props.name));
      } else {
        dispatch(favoriteHubAction(props.name));
      }
    }
  }

  function onNsfwButtonClick(_: React.MouseEvent<HTMLButtonElement>) {
    dispatch(toggleNsfwAction());
  }

  return (
    <div className={classes} style={{
      backgroundColor: props.color ? `#${props.color.toString(16)}` : undefined,
      backgroundImage: props.imageUrl ? `url(${props.imageUrl})` : undefined,
    }}>
      <div className="d-flex flex-row mb-2 mt-auto">
        {props.defaultButtons &&
          <React.Fragment>
            {props.name &&
              <button
                className="btn btn-sm btn-light mr-2"
                onClick={onFavoriteButtonClick}>
                {isFavorite &&
                  <i className="fa fa-heart text-danger" aria-hidden="true"></i>
                }
                {!isFavorite &&
                  <i className="fa fa-heart" aria-hidden="true"></i>
                }
              </button>
            }
            <button
              className={`mr-2 btn btn-sm btn-${showNsfw ? "danger" : "light"}`}
              onClick={onNsfwButtonClick}>
              <b>{t("label.explicit")}</b>
            </button>
            <div className="btn-group btn-group-sm mr-2" role="group">
              {(["top", "hot", "new"] as SortMode[]).map(sortname =>
                <button
                  key={sortname}
                  aria-label={sortname}
                  className={`text-capitalize btn btn-light${sort == sortname ? ' active' : ''}`}
                  onClick={() => dispatch(setSortAction(sortname))}>
                  {sortname == "top" &&
                    <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>
                  }
                  {sortname == "hot" &&
                    <i className="fa fa-fire" aria-hidden="true"></i>
                  }
                  {sortname == "new" &&
                    <i className="fa fa-asterisk" aria-hidden="true"></i>
                  }
                </button>
              )}
            </div>
            <div className="btn-group btn-group-sm" role="group">
              {(["minimal", "image"] as ViewMode[]).map(viewname =>
                <button
                  key={viewname}
                  aria-label={viewname}
                  className={`text-capitalize btn btn-light${view == viewname ? ' active' : ''}`}
                  onClick={() => dispatch(setViewAction(viewname))}>
                  {viewname == "minimal" &&
                    <i className="fa fa-list" aria-hidden="true"></i>
                  }
                  {viewname == "image" &&
                    <i className="fa fa-th-large" aria-hidden="true"></i>
                  }
                </button>
              )}
            </div>
          </React.Fragment>
        }
        {props.children}
      </div>
    </div>
  );
}
