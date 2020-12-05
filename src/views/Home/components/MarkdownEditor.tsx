import * as React from "react";
import * as ReactMarkdown from "react-markdown";

import { createClassName } from "~/services/utils";

interface MarkdownEditorProps {
  onChange?: (text: string) => void;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  const [text, setText] = React.useState(props.defaultValue ?? props.value ?? "");
  const [showPreview, setShowPreview] = React.useState(false);

  React.useEffect(() => {
    if (props.onChange) {
      props.onChange(text);
    }
  }, [text]);

  function onChange(text: string) {
    if (props.value) {
      props.onChange?.(text);
    } else {
      setText(text);
    }
  }

  return (
    <div className={createClassName("md", props.className)}>
      <div className="card-header d-flex flex-row justify-content-between align-items-center">
        <b>{"Markdown"}</b>
        <button
          type="button"
          className={`btn btn-secondary btn-sm${showPreview ? " active" : ""}`}
          onClick={() => setShowPreview(!showPreview)}>
          {"Preview"}
        </button>
      </div>
      {!showPreview &&
       <React.Fragment>
        <textarea
          rows={10}
          value={props.value ?? text}
          placeholder={props.placeholder}
          onChange={e => onChange(e.currentTarget.value)}/>
        <div className="card-footer">
          <div className="btn-toolbar" role="toolbar">
            <div className="btn-group btn-group-sm mr-2" role="group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onChange("")}>
                <i className="fa fa-eraser" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
       </React.Fragment>
      }
      {showPreview &&
        <ReactMarkdown className="md-body" source={text}/>
      }
    </div>
  );
}
