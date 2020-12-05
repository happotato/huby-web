import * as React from "react";;
import { useTranslation } from "react-i18next";

import MarkdownEditor from "./MarkdownEditor";

import {
  Post,
  TopicCreateData,
  CommentCreateData,
} from "~/services/api";

import { createClassName } from "~/services/utils";

export type PostCreateCallback<T extends TopicCreateData | CommentCreateData, E = void> = (base: T) => E;

interface TopicCreatorProps {
  type: "Topic";
  onCreate: PostCreateCallback<TopicCreateData>;
  expanded?: boolean;
  className?: string;
}

interface CommentCreatorProps {
  type: "Comment";
  onCreate: PostCreateCallback<TopicCreateData>;
  expanded?: boolean;
  className?: string;
}

export default function PostCreator(props: TopicCreatorProps | CommentCreatorProps) {
  const [expand, setExpand] = React.useState(props.expanded == true);
  const [content, setContent] = React.useState("");
  const { t } = useTranslation();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const contentType = parseInt(data.get("contentType") as string, 10);

    switch (props.type) {
      case "Topic": {
        (props.onCreate as any)({
            title: data.get("title"),
            isNSFW: data.get("isNSFW") == "on",
            tags: data.get("tags"),
            content,
            contentType,
        });
      } break;

      case "Comment": {
        (props.onCreate as any)({
            content,
            contentType,
            isNSFW: data.get("isNSFW") == "on",
        });
      } break;
    }

  }

  return (
    <div className={createClassName("card", props.className)}>
      <div
        className={`card-header d-flex flex-row justify-content-between align-items-center${expand ? "" : " border-bottom-0"}`}
        onClick={() => !props.expanded && setExpand(!expand)}>
        {props.type == "Topic" &&
          <b>{t("label.createTopic")}</b>
        }
        {props.type == "Comment" &&
          <b>{t("label.createComment")}</b>
        }
        {!props.expanded &&
          <button
            className={`btn btn-secondary btn-sm${expand ? " active" : ""}`}>
            <i className="text-muted fa fa-chevron-down" aria-hidden="true"></i>
          </button>
        }
      </div>
      {expand &&
        <form className="card-body" onSubmit={onSubmit}>
          {props.type == "Topic" &&
            <div className="form-group">
              <label>{t("label.title")}</label>
              <input
                name="title"
                type="text"
                className="form-control"
                aria-describedby="titleHelp"
                required
                placeholder={t("placeholder.title")} />
              <small
                id="titleHelp"
                className="form-text text-muted">
                {t("help.title")}
              </small>
            </div>
          }
          {props.type == "Topic" &&
            <div className="form-group">
              <label>{t("label.tag_plural")}</label>
              <input
                name="tags"
                type="text"
                className="form-control"
                aria-describedby="tagsHelp"
                placeholder={t("label.tag_plural")} />
              <small
                id="tagsHelp"
                className="form-text text-muted">
                {t("help.tag")}
              </small>
            </div>
          }
          <div className="form-group">
            <label>{t("label.content")}</label>
            <select name="contentType" className="form-control">
              <option value="0">{"Markdown"}</option>
              <option value="1">{"Image"}</option>
            </select>
            <small
              id="contentHelp"
              className="form-text text-muted">
              {t("help.content")}
            </small>
          </div>
          <div className="form-group">
            <MarkdownEditor onChange={setContent}/>
          </div>
          <div className="form-group form-check">
            <input
              name="isNSFW"
              type="checkbox"
              className="form-check-input"
              aria-describedby="nsfwHelp" />
              {t("label.explicit")}
            <small
              id="nsfwHelp"
              className="form-text text-muted">
              {t("help.explicit")}
            </small>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            {t("label.create")}
          </button>
        </form>
      }
    </div>
  );
}
