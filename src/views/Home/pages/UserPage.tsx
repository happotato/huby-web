import * as React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Error from "~/components/Error";
import Spinner from "~/components/Spinner";
import { useAsync } from "~/components/Async";
import { PostList } from "../components/Post";
import Banner from "../components/Banner";

import {
  User,
  UserPatch,
  SortMode,
  useApi,
} from "~/services/api";

import { ApplicationState, updateUserAction } from "~/services/store";
import { createHubUrl } from "~/services/utils";

export interface UserPageProps {
  className?: string;
  user: User;
}

export default function UserPage(props: UserPageProps) {
  const [currentUser, setCurrentUser] = React.useState(props.user);
  const [edit, setEdit] = React.useState(false);
  const [patch, setPatch] = React.useState<UserPatch>({
    name: props.user.name,
    status: props.user.status,
    imageUrl: props.user.imageUrl,
  });

  const view = useSelector((store: ApplicationState) => store.view);
  const sort = useSelector((store: ApplicationState) => store.sort);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const api = useApi();

  const [hubs, hubsErr, isLoadingHubs] = useAsync(() => api.getHubs({
    owner: props.user.username,
  }), []);

  React.useEffect(() => {
    if (!edit) {
      setPatch({
        name: currentUser.name,
        status: currentUser.status,
        imageUrl: currentUser.imageUrl,
      });
    }
  }, [edit]);

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;

    if (files) {
      const file = files[0];
      const imageUrl = await api.uploadImage(await file.arrayBuffer(), file.type);

      setPatch({
        ...patch,
        imageUrl,
      });
    }
  }

  async function saveChanges() {
    const user = await api.patchUser(currentUser.username, patch);

    setCurrentUser(user);
    setEdit(false);
    dispatch(updateUserAction());
  }

  const isSelf = api.user?.id == props.user.id;

  return (
    <main className={props.className}>
      <div className="row">
        <div className="col-sm col-md-3">
          <div className="card">
            <div className="card-header overflow-hidden p-0">
              <img className="w-100" src={patch.imageUrl ?? "/assets/avatar.webp"} />
              {edit &&
                <input
                  type="file"
                  className="form-control-file border-top p-2"
                  accept="image/*"
                  onChange={onImageChange} />
              }
            </div>
            <div className="card-header">
              {edit &&
                <input
                  className="form-control"
                  type="text"
                  placeholder={t("placeholder.name")}
                  onChange={e => setPatch({ ...patch, name: e.currentTarget.value })}
                  value={patch.name} />
              }
              {!edit &&
                <React.Fragment>
                  <h5 className="card-title">
                    <b>{currentUser.name}</b>
                  </h5>
                  <h6 className="card-subtitle text-muted">
                    {currentUser.username}
                  </h6>
                </React.Fragment>
              }
            </div>
            <div className="card-body">
              <p className="card-text text-muted">
                {edit &&
                  <textarea
                    className="form-control"
                    placeholder={t("placeholder.status")}
                    onChange={e => setPatch({ ...patch, status: e.currentTarget.value })}
                    value={patch.status} />
                }
                {!edit &&
                  <React.Fragment>
                    {(currentUser.status && currentUser.status.length > 0) &&
                      currentUser.status
                    }
                    {(!currentUser.status || currentUser.status.length == 0) &&
                      t("label.noStatus")
                    }
                  </React.Fragment>
                }
              </p>
            </div>
            {isSelf &&
              <div className="card-footer">
                {!edit &&
                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => setEdit(true)}>
                    <b>{t("label.edit")}</b>
                  </button>
                }
                {edit &&
                  <div className="d-flex flex-row align-items-center">
                    <button
                      className="btn btn-primary btn-sm w-100 mr-2"
                      onClick={() => saveChanges()}>
                      <b>{t("label.save")}</b>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEdit(false)}>
                      <i className="fa fa-close" aria-hidden="true"></i>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
          <div className="card my-2">
            <div className="card-header">
              <b>{t("label.hub_plural")}</b>
            </div>
            {isLoadingHubs &&
              <div className="card-body">
                <Spinner />
              </div>
            }
            {hubsErr &&
              <div className="card-body">
                <Error />
              </div>
            }
            {hubs &&
              <React.Fragment>
                {hubs.length > 0 &&
                  <ul className="list-group list-group-flush">
                    {hubs.map((hub, i) => (
                      <Link
                        key={i}
                        className="list-group-item list-group-item-action"
                        to={createHubUrl(hub.name)}>
                        <b className="text-muted">{hub.name}</b>
                      </Link>
                    ))}
                  </ul>
                }
                {hubs.length == 0 &&
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item text-muted">{t("label.empty")}</li>
                  </ul>
                }
              </React.Fragment>
            }
          </div>
        </div>
        <div className="col">
          <Banner
            className="mb-3"
            defaultButtons />
          <PostList
            onSort={(sort) => api.getPosts({
              sort,
              owner: props.user.username,
              limit: 20,
            })}
            onMore={(sort, _, after) => api.getPosts({
              sort,
              after,
              owner: props.user.username,
              limit: 20,
            })}
            sort={sort}
            view={view} />
        </div>
      </div>
    </main>
  );
}
