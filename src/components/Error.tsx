import * as React from "react";
import { useTranslation } from "react-i18next";

interface ErrorProps {
  msg?: string;
}

export default function Error(props: ErrorProps) {
  const { t } = useTranslation();

  return (
    <p>{props.msg ?? t("label.error")}</p>
  );
}
