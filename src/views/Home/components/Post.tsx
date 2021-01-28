import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Error from "~/components/Error";
import Spinner from "~/components/Spinner";
import Observer from "~/components/Observer";
import DropdownButton from "~/components/DropdownButton";
import MasonryGrid from "./MasonryGrid";
import PostCreator, { PostCreateCallback } from "./PostCreator";

import {
  Post as ApiPost,
  PostQueryResult,
  Topic,
  TopicCreateData,
  Comment,
  Reaction,
  SortMode,
  MarkdownContentType,
  ImageContentType,
  useApi,
} from "~/services/api";

import {
  createClassName,
  createHubUrl,
  createPostUrl,
  createUserUrl,
} from "~/services/utils";

import { ApplicationState } from "~/services/store";

type ViewMode = "minimal" | "image";

interface PostProps {
  post: ApiPost;
  view: ViewMode;
  onTagClick?: (name: string) => void;
  onLiked?: (post: ApiPost) => void;
  onDisliked?: (post: ApiPost) => void;
  defaultReaction?: Reaction;
  defaultExpanded?: boolean;
  showNSFW?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface PostListProps {
  onSort: (sort: SortMode, view: ViewMode) => Promise<PostQueryResult[]>;
  onMore: (sort: SortMode, view: ViewMode, after?: string) => Promise<PostQueryResult[]>;
  defaultView?: ViewMode;
  defaultSort?: SortMode;
  defaultShowNSFW?: boolean;
  onTopicCreate?: PostCreateCallback<TopicCreateData, Promise<Topic>>;
  className?: string;
}

interface PostListState {
  posts: PostQueryResult[];
  tags: string[];
  hasMore: boolean;
  showPostCreateCard: boolean;
  status: "error" | "loading" | "ok";
  sort: SortMode;
  view: ViewMode;
  showNSFW: boolean;
}

export default function Post(props: PostProps) {
  const [state, setState] = React.useState({
    post: props.post,
    reaction: props.defaultReaction,
    showContent: props.defaultExpanded ?? false,
  });

  const api = useApi();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!api.user) {
      setState({
        ...state,
        reaction: undefined,
      });
    }
  }, [api.user]);

  function toggleShowContent() {
    setState({
      ...state,
      showContent: !state.showContent,
    })
  }

  function getHint() {
    switch (state.post.contentType) {
      case MarkdownContentType:
        return "text";

      case ImageContentType:
        return "image";

      default:
        return "unknown";
    }
  }

  function getThumbnailUrl() {
    switch (state.post.contentType) {
      case ImageContentType:
        return state.post.content;
    }

    return undefined;
  }

  function getContent() {
    switch (state.post.contentType) {
      case MarkdownContentType: {
        return (
          <ReactMarkdown
            className="md-body p-2"
            source={state.post.content} />
        );
      };

      case ImageContentType: {
        return (
          <img
            className="w-max-content mw-100"
            src={state.post.content} />
        );
      };
    }

    return undefined;
  }

  async function react(reaction?: Reaction) {
    if (state.reaction == reaction) {
      const post = await api.react(state.post.id, "clear");
      setState({
        ...state,
        reaction: undefined,
        post,
      });
    } else {
      const post = await api.react(state.post.id, reaction ?? "clear");
      setState({
        ...state,
        reaction: reaction,
        post,
      });
    }
  }

  const className = createClassName("card", "overflow-hidden", "p-2", props.className);
  const thumbnailUrl = getThumbnailUrl();
  const hubUrl = createHubUrl(state.post.hub.name);
  const postUrl = createPostUrl(state.post.hub.name, state.post.id);
  const userUrl = createUserUrl(state.post.owner.username);

  if (props.view == "image") {
    return (
      <div className={className}>
        {thumbnailUrl &&
          <div className="rounded overflow-hidden mb-2">
            <a
              className={!props.showNSFW && state.post.isNSFW ? "blur" : ""}
              target="_blank"
              href={state.post.content}>
              <img className="card-img-top" src={thumbnailUrl} />
            </a>
          </div>
        }
        <div className="d-flex flex-column">
          <small className="text-muted">
            <Link to={hubUrl}>
              <b>{state.post.hub.name}</b>
            </Link>
            {" · "}
            <Link className="text-muted" to={userUrl}>
              {state.post.owner.username}
            </Link>
            {" · "}
            <React.Fragment>{t("label.submitted")} </React.Fragment>
            <React.Fragment>{t("datetime", { value: new Date(state.post.createdAt) })} </React.Fragment>
          </small>
          {state.post.postType == "Topic" &&
            <div>
              <Link className="text-dark" to={postUrl}>
                {state.post.stickied &&
                  <b>{state.post.title}</b>
                }
                {!state.post.stickied &&
                  <span>{state.post.title}</span>
                }
              </Link>
              <br />
              {state.post.isNSFW &&
                <span className="badge badge-danger mr-2 mb-1">
                  {t("label.explicit")}
                </span>
              }
              {state.post.tags.split(" ").map((tag, i) => (
                <span
                  key={i}
                  className="btn btn-secondary badge badge-pill mr-2 mb-1"
                  onClick={() => props.onTagClick?.(tag)}>
                  {tag}
                </span>
              ))}
            </div>
          }
          {state.post.postType == "Comment" &&
            <small>
              <Link className="text-muted" to={postUrl}>
                <b>{t("label.reply").toLowerCase()} </b>
              </Link>
              <React.Fragment>{t("label.to").toLowerCase()} </React.Fragment>
              <Link to={createPostUrl(state.post.parent.hub.name, state.post.parent.id)}>
                <b>{state.post.parent.id}</b>
              </Link>
            </small>
          }
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="row no-gutters">
        <div className="mr-2" style={{
          width: "2rem",
        }}>
          <div className="d-flex flex-column align-items-center justify-content-start">
            <button
              className="btn btn-transparent btn-sm"
              onClick={() => api.user && react("like")}>
              <i
                className={`fa fa-chevron-up${state.reaction == "like" ? " text-primary" : ""}`}
                aria-hidden="true" />
            </button>
            <small>
              <b className="text-muted">
                {t("count", { value: state.post.likes - state.post.dislikes })}
              </b>
            </small>
            <button
              className="btn btn-transparent btn-sm"
              onClick={() => api.user && react("dislike")}>
              <i
                className={`fa fa-chevron-down${state.reaction == "dislike" ? " text-primary" : ""}`}
                aria-hidden="true" />
            </button>
          </div>
        </div>
        {state.post.postType == "Topic" && !state.showContent && thumbnailUrl &&
          <div className="col-2 col-md-1 mr-2">
            <div className="overflow-hidden rounded w-100 h-100" style={{
              maxHeight: "5rem",
            }}>
              <img
                className={`w-100 h-100 ${!props.showNSFW && props.post.isNSFW ? "blur" : ""}`}
                loading="lazy"
                src={thumbnailUrl}
                style={{
                  objectFit: "cover",
                }} />
            </div>
          </div>
        }
        <div className="col">
          {state.post.postType == "Topic" &&
            <React.Fragment>
              {state.post.isNSFW &&
                <span className="badge badge-danger mr-2 mb-1">
                  {t("label.explicit")}
                </span>
              }
              {state.post.tags.split(" ").map((tag, i) => (
                <span
                  key={i}
                  className="btn btn-secondary badge badge-pill mr-2 mb-1"
                  onClick={() => props.onTagClick?.(tag)}>
                  {tag}
                </span>
              ))}
              <Link className="text-dark" to={postUrl}>
                {state.post.stickied &&
                  <b>{state.post.title}</b>
                }
                {!state.post.stickied &&
                  <span>{state.post.title}</span>
                }
              </Link>
            </React.Fragment>
          }
          {state.post.postType == "Comment" &&
            <small>
              <Link className="text-muted" to={postUrl}>
                <b>{t("label.reply").toLowerCase()} </b>
              </Link>
              <React.Fragment>{t("label.to").toLowerCase()} </React.Fragment>
              <Link to={createPostUrl(state.post.parent.hub.name, state.post.parent.id)}>
                <b>{state.post.parent.id}</b>
              </Link>
            </small>
          }
          <div className="d-flex flex-row align-items-start">
            <button
              className="btn btn-transparent btn-sm mr-2"
              onClick={() => toggleShowContent()}>
              {!state.showContent &&
                <i className="fa fa-expand" aria-hidden="true"></i>
              }
              {state.showContent &&
                <i className="fa fa-compress" aria-hidden="true"></i>
              }
            </button>
            <small className="text-muted">
              <Link to={hubUrl}>
                <b>{state.post.hub.name}</b>
              </Link>
              {" · "}
              <Link className="text-muted" to={userUrl}>
                {state.post.owner.username}
              </Link>
              {" · "}
              <React.Fragment>{t("label.submitted")} </React.Fragment>
              <React.Fragment>{t("datetime", { value: new Date(state.post.createdAt) })} </React.Fragment>
              <br />
              {t("label.commentWithCount", { count: state.post.commentsCount })}
              {props.children && " · "}
              {props.children}
            </small>
          </div>
        </div>
      </div>
      {state.showContent &&
        <React.Fragment>
          <hr />
          {getContent()}
        </React.Fragment>
      }
    </div>
  );
}

export function PostList(props: PostListProps) {
  const [state, setState] = React.useState<PostListState>({
    posts: [],
    status: "ok",
    tags: [],
    hasMore: true,
    showPostCreateCard: false,
    sort: props.defaultSort ?? "hot",
    view: props.defaultView ?? "minimal",
    showNSFW: props.defaultShowNSFW == true,
  });

  const { t } = useTranslation();
  const showNsfw = useSelector((state: ApplicationState) => state.showNsfw);
  const api = useApi();

  async function sort(sort: SortMode) {
    setState({
      ...state,
      posts: [],
      status: "loading",
    });

    const posts = await props.onSort(sort, state.view);

    setState({
      ...state,
      posts,
      status: "ok",
      hasMore: posts.length > 0,
      sort,
    });
  }

  async function more() {
    let after: string | undefined = undefined;

    if (state.posts.length > 0) {
      after = state.posts[state.posts.length - 1].post.id;
    }

    setState({
      ...state,
      status: "loading",
    });

    const posts = await props.onMore(state.sort, state.view, after);

    setState({
      ...state,
      posts: state.posts.concat(posts),
      status: "ok",
      hasMore: posts.length > 0,
    });
  }

  async function onTopicCreate(data: TopicCreateData) {
    if (props.onTopicCreate) {
      const post = await props.onTopicCreate(data);

      setState({
        ...state,
        posts: [{ post: post as ApiPost }].concat(state.posts),
      });
    }
  }

  function getCurrentPosts() {
    return state.posts
      .filter(({ post }) => {
        let tags: string[] = [];

        if (post.postType == "Topic") {
          tags = post.tags.split(" ");
        } else {
          return false;
        }

        return state.tags.every(tag => tags.includes(tag));
      });
  }

  function setTags(tags: string[]) {
    setState({
      ...state,
      tags,
    });
  }

  function addTag(name: string) {
    setTags(state.tags.filter(tag => tag != name).concat([name]));
  }

  function removeTag(name: string) {
    setTags(state.tags.filter(tag => tag != name));
  }

  function setView(view: ViewMode) {
    setState({
      ...state,
      view,
    });
  }

  function toggleShowExplicit() {
    setState({
      ...state,
      showNSFW: !state.showNSFW,
    });
  }

  return (
    <div className={props.className}>
      {(api.user && props.onTopicCreate) &&
        <PostCreator
          className="card mb-3"
          type="Topic"
          headerTitle={t("label.createTopic")}
          onCreate={onTopicCreate} />
      }
      <div className="row no-gutters">
        <DropdownButton className="col-auto d-inline-block mb-1" text={t("label.view")}>
          {(close) => (
            <div className="p-2 d-flex flex-column">
              <button
                className="btn btn-transparent btn-sm text-left"
                onClick={() => {
                  setView("minimal");
                  close();
                }}>
                {t("label.list")}
              </button>
              <button
                className="btn btn-transparent btn-sm text-left"
                onClick={() => {
                  setView("image");
                  close();
                }}>
                {t("label.gallery")}
              </button>
            </div>
          )}
        </DropdownButton>
        <DropdownButton className="col-auto d-inline-block mb-1" text={"Sort"}>
          {(close) => (
            <div className="p-2 d-flex flex-column">
              <button
                className="btn btn-transparent btn-sm text-left"
                onClick={() => {
                  sort("top");
                  close();
                }}>
                {"Top"}
              </button>
              <button
                className="btn btn-transparent btn-sm text-left"
                onClick={() => {
                  sort("hot");
                  close();
                }}>
                {"Hot"}
              </button>
              <button
                className="btn btn-transparent btn-sm text-left"
                onClick={() => {
                  sort("new");
                  close();
                }}>
                {"New"}
              </button>
            </div>
          )}
        </DropdownButton>
        <div className="ml-auto">
          <button
            className="btn btn-sm btn-transparent"
            onClick={() => toggleShowExplicit()}>
            <span className={state.showNSFW == true ? "text-dark" : undefined}>
              {t("label.explicit")}
            </span>
          </button>
        </div>
      </div>
      {state.tags.length > 0 &&
        <button
          className="btn btn-sm btn-primary mr-2 mb-2"
          onClick={() => setTags([])}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      }
      {state.tags.map((tag, i) => (
        <button
          key={i}
          className="btn btn-sm btn-dark mr-2 mb-2"
          onClick={() => removeTag(tag)}>
          <b>{tag}</b>
        </button>
      ))}
      {state.view == "minimal" &&
        <div className="post-list-view">
          {getCurrentPosts().map(({ reaction, post }) => (
            <Post
              key={post.id}
              post={post}
              view={state.view}
              showNSFW={state.showNSFW}
              defaultReaction={reaction}
              onTagClick={addTag} />
          ))}
        </div>
      }
      {state.view == "image" &&
        <MasonryGrid items={getCurrentPosts()}>
          {({ reaction, post }) => (
            <Post
              key={post.id}
              className="mb-2"
              post={post}
              view={state.view}
              showNSFW={state.showNSFW}
              defaultReaction={reaction}
              onTagClick={addTag} />
          )}
        </MasonryGrid>
      }
      {state.status == "loading" && <Spinner />}
      {state.status == "error" && <Error />}
      {(state.status == "ok" && state.posts.length == 0) &&
        <p className="text-muted">
          {t("label.empty")}
        </p>
      }
      {(state.status == "ok" && state.hasMore) &&
        <Observer className="p-2" callback={() => more()} />
      }
    </div>
  );
}
