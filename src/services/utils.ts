import * as React from "react";

export function abbrvNumber(num: number) {
  const si = ["", "k", "M", "G", "T", "P", "E"];
  const tier = Math.log10(Math.abs(num)) / 3 | 0;

  if (tier == 0) {
    return num.toString(10);
  }

  const suffix = si[tier];
  const scaled = num / Math.pow(10, tier * 3);

  return scaled.toFixed(1) + suffix;
}

export function createClassName(...classes: (string | undefined)[]) {
  return classes
    .filter(str => str && str.length > 0)
    .join(" ");
}

export function createHomeUrl() {
  return `/`;
}

export function createHubUrl(name: string) {
  return `/h/hub/${name}`;
}

export function createPostUrl(hubName: string, id: string) {
  return `/h/hub/${hubName}/posts/${id}`;
}

export function createUserUrl(username: string) {
  return `/h/user/${username}`;
}

export function createCreateHubUrl() {
  return `/h/createhub`;
}

export function createLoginUrl(location: string = "") {
  return `/login?location=${location}`;
}

export function createCreateAccountUrl(location: string = "") {
  return `/create?location=${location}`;
}

export function useItems<T>(defaultItems: T[] = []) {
  const [state, setState] = React.useState({
    items: defaultItems,
    status: "loading" as "err" | "loading" | "ok",
    hasMore: true,
  });

  async function more(promiseFn: () => Promise<T[]>) {
    setState({
      ...state,
      status: "loading",
      hasMore: false,
    });

    try {
      const items = await promiseFn();

      setState({
        ...state,
        items: state.items.concat(items),
        status: "ok",
        hasMore: items.length > 0,
      });
    } catch {
      setState({
        items: [],
        status: "err",
        hasMore: false,
      });
    }
  }

  function setItems(items: T[]) {
    setState({
      ...state,
      items,
    });
  }

  return {
    ...state,
    more,
    setItems,
  };
}
