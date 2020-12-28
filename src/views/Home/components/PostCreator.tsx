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

interface PostCreateProps {
  open?: boolean;
  headerTitle?: string;
  className?: string;
}

interface TopicCreatorProps {
  type: "Topic";
  onCreate: PostCreateCallback<TopicCreateData>;
}

interface CommentCreatorProps {
  type: "Comment";
  onCreate: PostCreateCallback<CommentCreateData>;
}

export default function PostCreator(props: PostCreateProps & (TopicCreatorProps | CommentCreatorProps)) {
  const [open, setOpen] = React.useState(props.open == true);
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

  const body = (
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
  );

  return (
    <div className={props.className}>
      {props.headerTitle &&
        <div
          className={`card-header d-flex flex-row justify-content-between align-items-center${open ? "" : " border-bottom-0"}`}
          onClick={() => !props.open && setOpen(!open)}>
          <b>{props.headerTitle}</b>
          {!props.open &&
            <button
              className={`btn btn-secondary btn-sm${open ? " active" : ""}`}>
              <i className="text-muted fa fa-chevron-down" aria-hidden="true"></i>
            </button>
          }
        </div>
      }
      {open && body}
    </div>
  );
}
