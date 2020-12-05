import * as React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { ApplicationState} from "~/services/store";
import { createHubUrl } from "~/services/utils";

export default function FavBar() {
  const { t } = useTranslation();
  const hubs = useSelector((store: ApplicationState) => store.favoriteHubs);

  return (
    <div className="d-flex flex-row align-items-center bg-dark border-bottom border-dark py-1 px-3">
      {hubs.length == 0 &&
        <span className="text-light">{t("label.noFavorites")}</span>
      }
      {hubs.map((name, i) => (
        <Link
          key={i}
          className="text-light mr-2"
          to={createHubUrl(name)}>
          {name}
        </Link>
      ))}
    </div>
  );
}
