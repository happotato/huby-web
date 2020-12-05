import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

import Banner from "../components/Banner";
import MarkdownEditor from "../components/MarkdownEditor";

import { useApi, HubBase } from "~/services/api";
import { createHubUrl } from "~/services/utils";

export interface CreateHubPageProps {
  className?: string;
}

export default function CreateHubPage(props: CreateHubPageProps) {
  const [state, setState] = React.useState<HubBase>({
    name: "",
    description: "",
    bannerColor: 0,
    imageUrl: "",
    isNSFW: false,
  });

  const { t } = useTranslation();
  const history = useHistory();
  const api = useApi();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const hub = await api.createHub(state);
    history.push(createHubUrl(hub.name));
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

  document.title = `${process.env.NAME} - ${t("label.createHub")}`;

  return (
    <main className={props.className}>
      <h5 className="text-muted">
        <b>{t("label.createHub")}</b>
      </h5>
      <Banner
        className="my-3"
        name={state.name}
        imageUrl={state.imageUrl}
        color={state.bannerColor} />
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>{t("label.name")}</label>
          <input
            type="text"
            className="form-control"
            aria-describedby="nameHelp"
            required
            placeholder={t("placeholder.name")}
            value={state.name}
            pattern="[a-zA-Z0-9]+"
            onChange={e => setState({ ...state, name: e.currentTarget.value })} />
          <small
            id="nameHelp"
            className="form-text text-muted">
            {t("help.name")}
          </small>
        </div>
        <div className="form-group">
          <label>{t("label.description")}</label>
          <MarkdownEditor
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
        <div className="form-group form-check">
          <input
            type="checkbox"
            className="form-check-input"
            aria-describedby="nsfwHelp"
            checked={state.isNSFW}
            onChange={e => setState({ ...state, isNSFW: e.currentTarget.checked })} />
          {t("label.explicit")}
          <small
            id="nsfwHelp"
            className="form-text text-muted">
            {t("help.explicit")}
          </small>
        </div>
        <button type="submit" className="btn btn-sm btn-primary">
          <b>{t("label.create")}</b>
        </button>
      </form>
    </main>
  );
}
