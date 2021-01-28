import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  ApplicationState,
  favoriteHubAction,
  toggleNsfwAction,
  unfavoriteHubAction,
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
          </React.Fragment>
        }
        {props.children}
      </div>
    </div>
  );
}
