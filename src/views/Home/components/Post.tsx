import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Error from "~/components/Error";
import Spinner from "~/components/Spinner";
import Observer from "~/components/Observer";
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

import { ApplicationState, ViewMode } from "~/services/store";

interface PostProps {
  post: ApiPost;
  view: ViewMode;
  onTagClick?: (name: string) => void;
  onLiked?: (post: ApiPost) => void;
  onDisliked?: (post: ApiPost) => void;
  defaultReaction?: Reaction;
  defaultExpanded?: boolean;
  showNsfw?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface PostListProps {
  view: ViewMode;
  sort: SortMode;
  onSort: (sort: SortMode, view: ViewMode) => Promise<PostQueryResult[]>;
  onMore: (sort: SortMode, view: ViewMode, after?: string) => Promise<PostQueryResult[]>;
  onTopicCreate?: PostCreateCallback<TopicCreateData, Promise<Topic>>;
  className?: string;
}

interface PostListState {
  posts: PostQueryResult[];
  tags: string[];
  hasMore: boolean;
  showPostCreateCard: boolean;
  status: "error" | "loading" | "ok";
}

const Post = React.memo<PostProps>(props => {
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

  const showNsfw = props.showNsfw || false;

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
              className={!showNsfw && state.post.isNSFW ? "blur" : ""}
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
        {state.post.postType == "Topic" && thumbnailUrl &&
          <div className="col-3 col-md-2 mr-2">
            <div className="overflow-hidden rounded w-100">
              <img
                className={`w-100 h-100 ${!showNsfw && props.post.isNSFW ? "blur" : ""}`}
                loading="lazy"
                src={thumbnailUrl}
                style={{
                  objectFit: "cover",
                }} />
            </div>
          </div>
        }
        <div className="col">
          <div>
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
              {" · "}
              {t("label.commentWithCount", { count: state.post.commentsCount })}
            </small>
          </div>
          {state.post.postType == "Topic" &&
            <React.Fragment>
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
          <div className="btn-toolbar mt-1" role="toolbar">
            <div className="btn-group btn-group-sm mr-2" role="group">
              <button
                className={`btn btn-secondary${state.showContent ? " active" : ""}`}
                onClick={() => toggleShowContent()}>
                <i className="fa fa-expand" aria-hidden="true"></i>
              </button>
            </div>
            <div className="btn-group btn-group-sm mr-2" role="group">
              <button
                className={`btn btn-sm btn-${state.reaction == "like" ? "primary" : "secondary"}`}
                onClick={() => api.user && react("like")}>
                <i className="fa fa-chevron-up" aria-hidden="true"></i>
              </button>
              <div className="btn btn-sm btn-terciary active">
                <b>
                  {t("count", { value: state.post.likes - state.post.dislikes })}
                </b>
              </div>
              <button
                className={`btn btn-sm btn-${state.reaction == "dislike" ? "primary" : "secondary"}`}
                onClick={() => api.user && react("dislike")}>
                <i className="fa fa-chevron-down" aria-hidden="true"></i>
              </button>
            </div>
            {props.children}
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
});

export function PostList(props: PostListProps) {
  const [state, setState] = React.useState<PostListState>({
    posts: [],
    status: "ok",
    tags: [],
    hasMore: true,
    showPostCreateCard: false,
  });

  const { t } = useTranslation();
  const showNsfw = useSelector((state: ApplicationState) => state.showNsfw);
  const api = useApi();

  React.useEffect(() => {
    sort();
  }, [props.sort]);

  async function sort() {
    setState({
      ...state,
      posts: [],
      status: "loading",
    });

    const posts = await props.onSort(props.sort, props.view);

    setState({
      ...state,
      posts,
      status: "ok",
      hasMore: posts.length > 0,
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

    const posts = await props.onMore(props.sort, props.view, after);

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
      .filter(({post}) => {
        let tags: string[] = [];

        if (post.postType == "Topic") {
          tags = post.tags.split(" ");
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

  return (
    <div className={props.className}>
      {(api.user && props.onTopicCreate) &&
        <PostCreator className="mb-3" type="Topic" onCreate={onTopicCreate} />
      }
      {state.tags.length > 0 &&
        <button
          className="btn btn-sm btn-primary mr-2 mb-3"
          onClick={() => setTags([])}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      }
      {state.tags.map((tag, i) => (
        <button
          key={i}
          className="btn btn-sm btn-dark mr-2 mb-3"
          onClick={() => removeTag(tag)}>
          <b>{tag}</b>
        </button>
      ))}
      {props.view == "minimal" &&
        <div className="post-list-view">
          {getCurrentPosts().map(({ reaction, post }) => (
            <Post
              key={post.id}
              post={post}
              view={props.view}
              showNsfw={showNsfw}
              defaultReaction={reaction}
              onTagClick={addTag} />
          ))}
        </div>
      }
      {props.view == "image" &&
        <MasonryGrid items={getCurrentPosts()}>
          {({ reaction, post }) => (
            <Post
              key={post.id}
              className="mb-2"
              post={post}
              view={props.view}
              showNsfw={showNsfw}
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

export default Post;
