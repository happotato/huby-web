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
}

interface CommentCreatorProps {
  type: "Comment";
  onCreate: PostCreateCallback<CommentCreateData>;
}

type PostCreatorProps = (TopicCreatorProps | CommentCreatorProps) & {
  open?: boolean;
  headerTitle?: string;
  className?: string;
};

export default function PostCreator(props: PostCreatorProps) {
  const [open, setOpen] = React.useState(props.open == true);
  const [content, setContent] = React.useState("");
  const [contentType, setContentType] = React.useState(0);
  const { t } = useTranslation();

  React.useEffect(() => {
    setContent("");
  }, [contentType]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    switch (props.type) {
      case "Topic": {
        props.onCreate({
            title: data.get("title") as string,
            isNSFW: data.get("isNSFW") == "on",
            tags: data.get("tags") as string,
            content,
            contentType,
        });
      } break;

      case "Comment": {
        props.onCreate({
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
        <select
          name="contentType"
          className="form-control"
          onChange={e => setContentType(parseInt(e.currentTarget.value, 10))}
          defaultValue={contentType}>
          <option value={0}>{"Markdown"}</option>
          <option value={1}>{"Image"}</option>
        </select>
        <small
          id="contentHelp"
          className="form-text text-muted">
          {t("help.content")}
        </small>
      </div>
      <div className="form-group">
        {contentType == 0 &&
          <MarkdownEditor onChange={setContent}/>
        }
        {contentType == 1 &&
          <input
            type="url"
            className="form-control"
            placeholder="URL"
            value={content}
            onChange={e => setContent(e.currentTarget.value)}/>
        }
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
              className="btn btn-transparent btn-sm">
              <i className={`text-muted fa fa-chevron-${open ? "up" : "down"}`} aria-hidden="true"></i>
            </button>
          }
        </div>
      }
      {open && body}
    </div>
  );
}
