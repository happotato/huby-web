import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Route, Switch, Link, useHistory, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Async, { useAsync } from "~/components/Async";
import Error from "~/components/Error";
import Spinner from "~/components/Spinner";
import Banner from "../components/Banner";
import Post, { PostList } from "../components/Post";
import { CommentList } from "../components/Comment";
import PostCreator from "../components/PostCreator";
import Popup from "../components/Popup";
import MarkdownEditor from "../components/MarkdownEditor";

import {
  Hub,
  HubQueryResult,
  HubPatch,
  Post as ApiPost,
  PostQueryResult,
  Comment,
  CommentCreateData,
  Moderator,
  ModeratorCreateData,
  SortMode,
  getPost,
  getPosts,
  useApi
} from "~/services/api";

import {
  setViewAction,
  setSortAction,
  ApplicationState,
  ViewMode,
} from "~/services/store";

import {
  useItems,
  createHubUrl,
  createUserUrl,
} from "~/services/utils";

interface PostDetailsProps {
  id: string;
  canDelete: boolean;
}

interface HubEditorProps {
  hub: Hub;
  canDelete?: boolean;
  onDeleted?: () => void;
  onSaved?: (hub: Hub) => void;
}

interface HubPageProps {
  className?: string;
  hub: HubQueryResult;
}

interface HubPageState {
  hub: Hub;
  subscribed: boolean;
  editing: boolean;
}

function PostDetails(props: PostDetailsProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const api = useApi();

  const [showReplyPopup, setShowReplyPopup] = React.useState(false);
  const [result, err, isLoading] = useAsync(() => api.getPost<ApiPost>(props.id), []);
  const { items, status, hasMore, more, setItems } = useItems<PostQueryResult<Comment>>();

  async function deletePost() {
    if (result) {
      await api.deletePost(result.post.id);
      history.push(createHubUrl(result.post.hub.name));
    }
  }

  async function createReply(data: CommentCreateData) {
    if (result) {
      const post = await api.createComment(result.post.id, data);
      setItems([{ post }].concat(items));
      setShowReplyPopup(false);
    }
  }

  async function loadMoreReplies() {
    let after: string | undefined = undefined;

    if (items.length > 0) {
      after = items[items.length - 1].post.id;
    }

    if (result) {
      await more(() => api.getPosts({
        parent: result.post.id,
        after,
        limit: 10,
        type: "Comment",
      }));
    }
  }

  if (err) return <Error/>;
  if (isLoading || !result) return <Spinner />;

  const canDelete = result.post.ownerId == api.user?.id || props.canDelete;

  return (
    <React.Fragment>
      <Post
        className="mb-3"
        post={result.post}
        view="minimal"
        showNsfw
        defaultReaction={result.reaction}
        defaultExpanded>
        {api.user &&
          <React.Fragment>
            <a
              href="#"
              className="text-muted p-0 mr-1"
              onClick={e => {
                e.preventDefault();
                setShowReplyPopup(true);
              }}>
              {t("label.reply").toLowerCase()}
            </a>
            {canDelete &&
              <a
                href="#"
                className="text-danger p-0 mr-1"
                onClick={e => {
                  e.preventDefault();
                  deletePost();
                }}>
                <b>
                  {t("label.delete").toLowerCase()}
                </b>
              </a>
            }
          </React.Fragment>
        }
      </Post>
      <Popup
        open={showReplyPopup}
        onCloseRequest={() => setShowReplyPopup(false)}
        title={t("label.createReply")}>
        <PostCreator
          type="Comment"
          onCreate={createReply}
          open/>
      </Popup>
      <CommentList
        className="mb-3"
        items={items}
        onMore={loadMoreReplies}
        hasMore={hasMore}
        status={status}/>
    </React.Fragment>
  );
}

function HubEditor(props: HubEditorProps) {
  const [state, setState] = React.useState({
    description: props.hub.description,
    bannerColor: props.hub.bannerColor,
    imageUrl: props.hub.imageUrl,
  });

  const { t } = useTranslation();
  const api = useApi();

  const [mods, modsErr, isLoadingMods, setMods] = useAsync(() => api.getModerators({
    hub: props.hub.name,
  }), []);

  function reset() {
    setState({
      ...state,
      description: props.hub.description,
      bannerColor: props.hub.bannerColor,
      imageUrl: props.hub.imageUrl,
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const hub = await api.patchHub(props.hub.name, {...state});
    props.onSaved?.(hub);
  }

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;

    if (files) {
      const file = files[0];
      const imageUrl = await api.uploadImage(await file.arrayBuffer(), file.type);

      setState({
        ...state,
        imageUrl,
      });
    }
  }

  async function onDeleteButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    await api.deleteHub(props.hub.name);
    props.onDeleted?.();
  }

  async function onModeratorSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const username = data.get("username") as string;
    const canEdit = data.get("canEdit") == "on";
    const canDeletePosts = data.get("canDeletePosts") == "on";

    if (mods?.find(mod => mod.user.username == username)
        || props.hub.owner.username == username) {
      return;
    }

    const mod = await api.createModerator({
      hub: props.hub.name,
      username: data.get("username") as string,
      permissions: {
        canEdit,
        canDeletePosts,
      },
    });

    setMods(mods?.concat([mod]));
  }

  async function removeModerator(mod: Moderator) {
    await api.deleteModerator(mod.id);
    setMods(mods?.filter(m => m.id != mod.id));
  }

  return (
    <div className="card">
      <div className="card-header">
        <b>{t("label.edit")}</b>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <Banner
              imageUrl={state.imageUrl}
              color={state.bannerColor} />
          </div>
          <div className="form-group">
            <label>{t("label.description")}</label>
            <MarkdownEditor
              value={state.description}
              placeholder={t("placeholder.description")}
              onChange={description => setState({ ...state, description, })}/>
            <small
              id="descHelp"
              className="form-text text-muted">
              {t("help.description")}
            </small>
          </div>
          <div className="form-row">
            <div className="form-group col">
              <label>{t("label.image")}</label>
              <input
                className="form-control-file"
                type="file"
                accept="image/webp,image/jpeg,image/png,image/gif"
                aria-describedby="imgHelp"
                onChange={onImageChange} />
              <small
                id="imgHelp"
                className="form-text text-muted">
                {t("help.image")}
              </small>
            </div>
            <div className="form-group col">
              <label>{t("label.bannerColor")}</label>
              <br />
              <input
                type="color"
                aria-describedby="colorHelp"
                defaultValue={"#" + state.bannerColor.toString(16)}
                onChange={e => setState({
                  ...state,
                  bannerColor: parseInt(e.currentTarget.value.replace("#", "0x"), 16),
                })}
                onSubmit={e => setState({
                  ...state,
                  bannerColor: parseInt(e.currentTarget.value.replace("#", "0x"), 16),
                })} />
              <small
                id="colorHelp"
                className="form-text text-muted">
                {t("help.bannerColor")}
              </small>
            </div>
          </div>
          <div className="d-flex">
            <button type="submit" className="btn btn-primary btn-sm">
              {t("label.save")}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm ml-2"
              onClick={() => reset()}>
              {t("label.reset")}
            </button>
            {props.canDelete &&
              <button
                type="button"
                className="btn btn-danger btn-sm ml-auto"
                onClick={onDeleteButtonClick}>
                {t("label.delete")}
              </button>
            }
          </div>
        </form>
        <hr/>
        <h5 className="card-title">{t("label.advanced")}</h5>
        <form onSubmit={onModeratorSubmit}>
          <h6>{t("label.moderator_plural")}</h6>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">{"#"}</th>
                <th scope="col">{t("label.username")}</th>
                <th scope="col">{t("label.edit")}</th>
                <th scope="col">{t("label.delete")}</th>
              </tr>
            </thead>
            <tbody className="table-striped">
              {mods?.map((mod, i) => (
                <tr key={i}>
                  <th scope="row">{i + 1}</th>
                  <td>{mod.user.username}</td>
                  <td>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input position-static"
                        disabled
                        checked={mod.canEdit}/>
                    </div>
                  </td>
                  <td>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input position-static"
                        disabled
                        checked={mod.canDeletePosts}/>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0"
                      onClick={() => removeModerator(mod)}>
                      {t("label.remove")}
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="text-muted">
                <th scope="row">{0}</th>
                <td>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder={t("placeholder.username")}
                    pattern="[a-zA-Z0-9]+"/>
                </td>
                <td className="align-middle">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="canEdit"
                      className="form-check-input position-static"/>
                  </div>
                </td>
                <td className="align-middle">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="canDeletePosts"
                      className="form-check-input position-static"/>
                  </div>
                </td>
                <td className="align-middle">
                  <button
                    type="submit"
                    className="btn btn-sm btn-link p-0">
                    {t("label.add")}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}

export default function HubPage(props: HubPageProps) {
  const [state, setState] = React.useState<HubPageState>({
    hub: props.hub.hub,
    subscribed: props.hub.subscribed,
    editing: false,
  });

  const { t } = useTranslation();
  const view = useSelector((store: ApplicationState) => store.view);
  const sort = useSelector((store: ApplicationState) => store.sort);
  const dispatch = useDispatch();
  const history = useHistory();
  const api = useApi();

  React.useEffect(() => {
    if (!api.user) {
      setState({
        ...state,
        editing: false,
      });
    }
  }, [api.user]);

  const [mods, modsErr, isLoadingMods] = useAsync(() => api.getModerators({
    hub: state.hub.name,
  }), [state.hub]);

  async function toggleSubscription() {
    if (state.subscribed) {
      await api.unsubscribe(state.hub.name);
      setState({
        ...state,
        hub: {
          ...state.hub,
          subscribersCount: state.hub.subscribersCount - 1,
        },
        subscribed: false,
      });
    } else {
      const sub = await api.subscribe(state.hub.name);
      setState({
        ...state,
        hub: sub.hub,
        subscribed: true,
      });
    }
  }

  function onEditSaved(hub: Hub) {
    setState({
      ...state,
      editing: false,
      hub,
    });
  }

  function onDeleted() {
    history.push("/");
  }

  const isOwner = api.user?.id == state.hub.ownerId;

  return (
    <main className={props.className}>
      <Banner
        className="mb-3"
        name={state.hub.name}
        imageUrl={state.hub.imageUrl}
        color={state.hub.bannerColor}
        defaultButtons/>
      <div className="row">
        <div className="col">
          {state.editing &&
            <HubEditor
              hub={state.hub}
              canDelete={isOwner}
              onDeleted={onDeleted}
              onSaved={onEditSaved}/>
          }
          {!state.editing &&
            <Switch>
              <Route exact path="/h/hub/:id">
                <PostList
                  onSort={(sort) => api.getPosts({
                    sort,
                    limit: 20,
                    hub: state.hub.name,
                    type: "Topic",
                  })}
                  onMore={(sort, _, after) => api.getPosts({
                    after,
                    sort,
                    limit: 20,
                    hub: state.hub.name,
                    type: "Topic",
                  })}
                  onTopicCreate={base => api.createTopic(state.hub.name, base)}
                  sort={sort}
                  view={view} />
              </Route>
              <Route exact path="/h/hub/:hubName/posts/:postId">
                {({match}) => (
                  <PostDetails
                    key={match?.params.postId}
                    id={match?.params.postId}
                    canDelete={props.hub.permissions.canDeletePosts}/>
                )}
              </Route>
            </Switch>
          }
        </div>
        <div className="col-3 d-none d-lg-block">
          <div className="card mb-2">
            <div className="card-body">
              <h5 className="card-title m-0">
                <b>{state.hub.name}</b>
              </h5>
              <div className="text-muted">
                <Link to={createHubUrl(state.hub.name)}>
                  <b>{state.hub.name}</b>
                </Link>
                {" - "}
                <span>
                  {t("label.subscriberWithCount", { count: state.hub.subscribersCount })}
                </span>
              </div>
            </div>
            {api.user &&
              <div className="card-body bg-light border-top">
                {props.hub.permissions.canEdit &&
                  <button
                    className={`btn btn-primary btn-sm w-100 mb-2${state.editing ? " active" : ""}`}
                    onClick={() => setState({...state, editing: !state.editing})}>
                    {t("label.edit")}
                  </button>
                }
                <button
                  className="btn btn-primary btn-sm w-100"
                  onClick={() => toggleSubscription()}>
                  {state.subscribed ? t("label.unsubscribe") : t("label.subscribe")}
                </button>
              </div>
            }
            <div className="card-body border-top">
              <ReactMarkdown className="card-text mt-2" source={state.hub.description} />
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <b>{t("label.moderator_plural")}</b>
            </div>
            {isLoadingMods &&
              <Spinner/>
            }
            {modsErr &&
              <Error/>
            }
            {mods &&
              <ul className="list-group list-group-flush">
                {[state.hub.owner].concat(mods.map(mod => mod.user)).map((user, i) => (
                  <Link
                    key={i}
                    className="list-group-item list-group-item-action"
                    to={createUserUrl(user.username)}>
                    <b className="text-muted">{user.name} </b>
                    <small className="text-muted">{`(${user.username})`}</small>
                  </Link>
                ))}
              </ul>
            }
          </div>
        </div>
      </div>
    </main >
  );
}
