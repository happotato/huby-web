import * as React from "react";
import { useSelector, useDispatch } from "react-redux";

import { PostList } from "../components/Post";

import { useApi } from "~/services/api";
import { ApplicationState } from "~/services/store";

interface HomePageProps {
  className?: string;
}

export default function HomePage(props: HomePageProps) {
  const dispatch = useDispatch();
  const api = useApi();

  document.title = process.env.NAME as string;

  return (
    <main className={props.className}>
      <PostList
        onSort={(sort) => api.getPosts({
          sort,
          limit: 20,
          hub: "_subscriptions",
          type: "Topic",
        })}
        onMore={(sort, _, after) => api.getPosts({
          after,
          sort,
          limit: 20,
          hub: "_subscriptions",
          type: "Topic",
        })}/>
    </main>
  );
}
