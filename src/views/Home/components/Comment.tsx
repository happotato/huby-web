import * as React from "react";
import { useTranslation } from "react-i18next";

import Async from "~/components/Async";
import Error from "~/components/Error";
import Spinner from "~/components/Spinner";
import Observer from "~/components/Observer";
import Post from "./Post";
import Popup from "./Popup";
import PostCreator from "./PostCreator";

import {
  PostQueryResult,
  Comment as ApiComment,
  CommentCreateData,
  Reaction,
  useApi,
} from "~/services/api";

import { useItems } from "~/services/utils";

interface CommentProps {
  comment: ApiComment;
  defaultReaction?: Reaction;
  bg?: number;
  fg?: number;
  className?: string;
}

interface CommentListProps {
  items: PostQueryResult<ApiComment>[];
  status: "err" | "loading" | "ok";
  hasMore: boolean;
  onMore: () => void;
  bg?: number;
  fg?: number;
  className?: string;
}

export default function Comment(props: CommentProps) {
  const [state, setState] = React.useState({
    showReplies: false,
    showReplyPopup: false,
  });

  const api = useApi();
  const { t } = useTranslation();
  const { items, status, hasMore, more, setItems } = useItems<PostQueryResult<ApiComment>>();

  async function createReply(data: CommentCreateData) {
    const post = await api.createComment(props.comment.id, data);
    setItems([{ post }].concat(items));
    setState({
      ...state,
      showReplyPopup: false,
    });
  }

  async function loadMoreReplies() {
    let after: string | undefined = undefined;

    if (items.length > 0) {
      after = items[items.length - 1].post.id;
    }

    await more(() => api.getPosts({
      parent: props.comment.id,
      after,
      limit: 10,
      type: "Comment",
    }));
  }

  return (
    <div className={props.className}>
      <Post
        className="rounded-0 border-0"
        post={props.comment}
        view="minimal"
        defaultReaction={props.defaultReaction}
        defaultExpanded>
        <div className="btn-group btn-group-sm mr-2">
          <button
            className={`btn btn-dark ${state.showReplies ? "active" : ""}`}
            onClick={() => setState({...state, showReplies: !state.showReplies})}>
            {t("label.reply_plural")}
          </button>
        </div>
        {api.user &&
          <div className="btn-group btn-group-sm">
            <button
              className="btn btn-dark"
              onClick={() => setState({...state, showReplyPopup: !state.showReplyPopup})}>
              {t("label.reply")}
            </button>
          </div>
        }
      </Post>
      <Popup
        open={state.showReplyPopup}
        onCloseRequest={() => setState({...state, showReplyPopup: !state.showReplyPopup})}
        title={t("label.createReply")}>
        <PostCreator
          type="Comment"
          onCreate={createReply}
          open/>
      </Popup>
      {state.showReplies &&
        <CommentList
          className="p-2"
          items={items}
          status={status}
          hasMore={hasMore}
          onMore={loadMoreReplies}
          bg={props.bg}
          fg={props.fg}/>
      }
    </div>
  );
}

export function CommentList(props: CommentListProps) {
  const { t } = useTranslation();

  const fg = (props.fg || 205) % 361;
  const bg = (props.bg || 0) % 50;

  return (
    <div className={props.className}>
      {props.items.length > 0 &&
        <div className="post-list-view"
          style={{
            backgroundColor: `hsl(0, 0%, ${100 - bg}%)`,
            borderLeft: `2px solid hsl(${fg}, 100%, 50%)`
          }}>
          {props.items.map(({ reaction, post }) => (
            <Comment
              key={post.id}
              className="border"
              comment={post}
              defaultReaction={reaction}
              fg={fg + (360 / 3)}
              bg={bg + 2}/>
          ))}
        </div>
      }
      {props.status == "loading" && <Spinner />}
      {props.status == "err" && <Error/>}
      {props.hasMore &&
        <Observer callback={() => {
          props.onMore();
        }} />
      }
      {props.items.length == 0 &&
        <div className="text-muted p-2">
          {t("label.noComments")}
        </div>
      }
    </div>
  );
}
