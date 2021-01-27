import * as React from "react";
import { useTranslation } from "react-i18next";

interface SearchBarProps<T> {
  className?: string;
  placeholder?: string;
  delay?: number;
  onRequest: (text: string) => Promise<T>;
  onChange?: (text: string) => void;
  onSubmit?: (text: string) => void;
  children?: (text: string, data: T) => JSX.Element | undefined;
}

export default function SearchBar<T>(props: SearchBarProps<T>) {
  const [text, setText] = React.useState("");
  const [popup, setPopup] = React.useState<JSX.Element | undefined>();

  const { t } = useTranslation();

  const inputRef = React.createRef<HTMLInputElement>();
  const popupRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    let cancel = false;

    const timeout = setTimeout(() => {
      if (props.onRequest && !cancel) {
        props.onRequest(text)
          .then(data => {
            if (!cancel && props.children) {
              setPopup(props.children(text, data));
            }
          });
      }
    }, props.delay || 300);

    return () => {
      cancel = true;
      clearTimeout(timeout);
    };
  }, [text]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    if (props.onSubmit) {
      props.onSubmit(data.get("search") as string);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    setText(e.currentTarget.value);

    if (props.onChange) {
      props.onChange(text);
    }
  }

  return (
    <div className={`searchbar ${props.className || ""}`}>
      <form
        className="form-inline"
        onSubmit={onSubmit}>
        <input
          ref={inputRef}
          name="search"
          className="form-control form-control-sm"
          type="text"
          placeholder={props.placeholder}
          spellCheck="false"
          autoComplete="off"
          aria-label={props.placeholder}
          onChange={onChange}
          value={text} />
      </form>
      {popup &&
        <div>
          <div className="card shadow-sm overflow-auto mt-2  ref={popupRef}">
            {popup}
          </div>
        </div>
      }
    </div>
  );
}
