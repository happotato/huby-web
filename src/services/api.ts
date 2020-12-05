import * as React from "react";

export const APIEndpoint = process.env.API_ENDPOINT as string;

export interface Item {
  id: string;
  createdAt: string;
  lastModified: string;
}

export interface WithOwner {
  ownerId: string;
  owner: User;
}

export interface WithHub {
  hubId: string;
  hub: Hub;
}

export interface WithParent {
  parentId: string;
  parent: Post;
}

export interface UserBase {
  username: string;
  name: string;
}

export interface User extends Item, UserBase {
  imageUrl?: string;
  status?: string;
}

export interface UserToken {
  user: User;
  token: string;
}

export interface HubBase {
  name: string;
  description: string;
  imageUrl: string;
  isNSFW: boolean;
  bannerColor: number;
}

export interface Hub extends Item, WithOwner, HubBase {
  subscribersCount: number;
}

export interface Subscription extends Item {
  hubId: string;
  userId: string;
  hub: Hub;
  user: User;
}

export interface Permissions {
  canEdit: boolean;
  canDeletePosts: boolean;
}

export interface Moderator extends Item, Permissions {
  hub: Hub;
  hubId: string;
  user: User;
  userId: string;
}

export interface PostBase extends Item, WithOwner, WithHub {
  content: string;
  contentType: number;
  isNSFW: boolean;
  likes: number;
  dislikes: number;
  commentsCount: number;
}

export interface Topic extends PostBase {
  title: string;
  tags: string;
  stickied: boolean;
  locked: number;
  postType: "Topic";
}

export interface Comment extends PostBase, WithParent {
  postType: "Comment";
}

export type Post = Topic | Comment;

export interface LogInData {
  username: string;
  password: string;
}

export interface SignUpData extends LogInData, UserBase {
  email: string;
}

export interface QueryOptions {
  limit?: number;
  page?: number;
  after?: string;
  [prop: string]: string | number | boolean | undefined;
}

export interface UserQueryOptions extends QueryOptions {
  name?: string;
  username?: string;
}

export interface HubQueryOptions extends QueryOptions {
  name?: string;
  owner?: string;
}

export interface PostQueryOptions extends QueryOptions {
  type?: "Topic" | "Comment";
  title?: string;
  hub?: string;
  parent?: string;
  owner?: string;
  sort?: SortMode;
}

export interface ModeratorQueryOptions extends QueryOptions {
  hub?: string;
  username?: string;
}

export interface TopicCreateData {
  title: string;
  tags: string;
  content: string;
  contentType: number;
  isNSFW: boolean;
}

export interface CommentCreateData {
  content: string;
  contentType: number;
  isNSFW: boolean;
}

export interface ModeratorCreateData {
  hub: string;
  username: string;
  permissions: Permissions;
}

export interface UserPatch {
  name?: string;
  email?: string;
  status?: string;
  imageUrl?: string;
}

export interface HubPatch {
  description?: string;
  imageUrl?: string;
  bannerColor?: number;
}

export interface HubQueryResult {
  subscribed: boolean;
  permissions: Permissions;
  hub: Hub;
}

export interface PostQueryResult<T extends PostBase = Post> {
  reaction?: Reaction;
  post: T;
}

export const MarkdownContentType = 0;
export const ImageContentType = 1;

export type Reaction = "like" | "dislike";
export type SortMode = "new" | "hot" | "top";

function toReaction(value: number) {
  switch (value) {
      case 1:
        return "like";

      case 2:
        return "dislike";
  }

  return undefined;
}

function fillParams(params: URLSearchParams, options: QueryOptions) {
  for (const prop in options) {
    const opt = options[prop];

    if (typeof opt == "number") {
      params.append(prop, opt.toString(10));
    } else if (opt) {
      params.append(prop, opt.toString());
    }
  }
}

async function fetch2(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);

  if (!res.ok) {
    return Promise.reject(res.statusText);
  }

  return res;
}

export async function auth(token: string): Promise<UserToken> {
  const url = new URL("api/auth/jwt", APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  return await res.json();
}

export async function login(data: LogInData): Promise<UserToken> {
  const url = new URL("api/auth/jwt/signin", APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function createAccount(data: SignUpData): Promise<UserToken> {
  const url = new URL("api/auth/jwt/create", APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function createHub(token: string, data: HubBase): Promise<Hub> {
  const url = new URL("api/hub", APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function createTopic(token: string, name: string, data: TopicCreateData): Promise<Topic> {
  const url = new URL(`api/hub/${name}/topics`, APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function createComment(token: string, id: string, data: CommentCreateData): Promise<Comment> {
  const url = new URL(`api/post/${id}/comments`, APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function getUser(username: string, token?: string): Promise<User> {
  const url = new URL(`api/user/${username}`, APIEndpoint);
  const headers = new Headers();

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const res = await fetch2(url.toString(), {
    method: "GET",
    headers,
  });

  return await res.json();
}

export async function getUsers(query: UserQueryOptions = {}, token?: string): Promise<User[]> {
  const url = new URL("api/user", APIEndpoint);
  const headers = new Headers();

  fillParams(url.searchParams, query);

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const res = await fetch2(url.toString(), {
    method: "GET",
    headers,
  });

  return await res.json();
}

export async function patchUser(token: string, username: string, data: UserPatch): Promise<User> {
  const url = new URL(`api/user/${username}`, APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function getHub(name: string, token?: string): Promise<HubQueryResult> {
  const url = new URL(`api/hub/${name}`, APIEndpoint);
  const headers = new Headers();

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const res = await fetch2(url.toString(), {
    method: "GET",
    headers,
  });

  return await res.json();
}

export async function getHubs(query: HubQueryOptions = {}, token?: string): Promise<Hub[]> {
  const url = new URL("api/hub", APIEndpoint);
  const headers = new Headers();

  fillParams(url.searchParams, query);

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const res = await fetch2(url.toString(), {
    method: "GET",
    headers,
  });

  return await res.json();
}

export async function patchHub(token: string, name: string, data: HubPatch): Promise<Hub> {
  const url = new URL(`api/hub/${name}`, APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function deleteHub(token: string, name: string) {
  const url = new URL(`api/hub/${name}`, APIEndpoint);

  await fetch2(url.toString(), {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
}

export async function subscribe(token: string, hub: string): Promise<Subscription> {
  const url = new URL(`api/hub/${hub}/subscribe`, APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return await res.json();
}

export async function unsubscribe(token: string, hub: string) {
  const url = new URL(`api/hub/${hub}/unsubscribe`, APIEndpoint);

  await fetch2(url.toString(), {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
}

export async function getModerators(query: ModeratorQueryOptions = {}): Promise<Moderator[]> {
  const url = new URL(`api/moderator`, APIEndpoint);
  fillParams(url.searchParams, query);

  const res = await fetch2(url.toString(), {
    method: "GET",
  });

  return await res.json();
}

export async function createModerator(token: string, data: ModeratorCreateData): Promise<Moderator> {
  const url = new URL(`api/moderator`, APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function patchModerator(token: string, id: string, data: Permissions): Promise<Moderator> {
  const url = new URL(`api/moderator/${id}`, APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function deleteModerator(token: string, id: string): Promise<void> {
  const url = new URL(`api/moderator/${id}`, APIEndpoint);

  await fetch2(url.toString(), {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
}

export async function getPost<T extends PostBase>(id: string, token?: string): Promise<PostQueryResult<T>> {
  const url = new URL(`api/post/${id}`, APIEndpoint);
  const headers = new Headers();

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const res = await fetch2(url.toString(), {
    method: "GET",
    headers,
  });

  const json = await res.json();

  return {
    ...json,
    reaction: toReaction(json["reaction"]),
  };
}

export async function getPosts<T extends PostBase>(query: PostQueryOptions = {}, token?: string): Promise<PostQueryResult<T>[]> {
  const url = new URL("api/post", APIEndpoint);
  const headers = new Headers();

  fillParams(url.searchParams, query);

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const res = await fetch2(url.toString(), {
    method: "GET",
    headers,
  });

  const json: any[] = await res.json();

  return json.map(item => ({
    ...item,
    reaction: toReaction(item["reaction"]),
  }));
}

export async function deletePost(token: string, id: string) {
  const url = new URL(`api/post/${id}`, APIEndpoint);

  await fetch2(url.toString(), {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
}

export async function react(token: string, id: string, reaction: Reaction | "clear"): Promise<Post> {
  const url = new URL(`api/post/${id}/react/${reaction}`, APIEndpoint);

  const res = await fetch2(url.toString(), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return await res.json();
}

export async function uploadImage(token: string, bytes: ArrayBuffer, contentType: string): Promise<string> {
  const url = new URL("api/s3/image", APIEndpoint);
  url.searchParams.append("format", contentType);

  const res = await fetch2(url.toString(), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const json = await res.json();
  const putUrl = json["put"] as string;
  const getUrl = json["get"] as string;

  await fetch2(putUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: bytes,
  });

  return getUrl;
}

const Context = React.createContext<UserToken | undefined>(undefined);
const Provider = Context.Provider;

export default Provider;

export function useApi() {
  const userToken = React.useContext(Context);
  const user = userToken?.user;
  const token = userToken?.token;

  return {
    user,
    token,
    auth: () => token ? auth(token) : Promise.reject(), 
    login,
    getUser: (username: string) => getUser(username, token),
    getUsers: (query?: UserQueryOptions) => getUsers(query, token),
    getHub: (name: string) => getHub(name, token),
    getHubs: (query?: HubQueryOptions) => getHubs(query, token),
    getPost: <T extends PostBase> (id: string) => getPost<T>(id, token),
    getPosts: <T extends PostBase> (query?: PostQueryOptions) => getPosts<T>(query, token),
    getModerators: (query?: ModeratorQueryOptions) => getModerators(query),
    createAccount,
    createHub: (data: HubBase) => token ? createHub(token, data) : Promise.reject(),
    createTopic: (hub: string, data: TopicCreateData) => token ? createTopic(token, hub, data) : Promise.reject(),
    createComment: (id: string, data: CommentCreateData) => token ? createComment(token, id, data) : Promise.reject(),
    createModerator: (data: ModeratorCreateData) => token ? createModerator(token, data) : Promise.reject(),
    patchUser: (username: string, data: UserPatch) => token ? patchUser(token, username, data) : Promise.reject(),
    patchHub: (hub: string, data: HubPatch) => token ? patchHub(token, hub, data) : Promise.reject(),
    patchModerator: (id: string, data: Permissions) => token ? patchModerator(token, id, data) : Promise.reject(),
    subscribe: (hub: string) => token ? subscribe(token, hub) : Promise.reject(),
    unsubscribe: (hub: string) => token ? unsubscribe(token, hub) : Promise.reject(),
    react: (id: string, reaction: Reaction | "clear") => token ? react(token, id, reaction) : Promise.reject(),
    deletePost: (id: string) => token ? deletePost(token, id) : Promise.reject(),
    deleteHub: (name: string) => token ? deleteHub(token, name) : Promise.reject(),
    deleteModerator: (id: string) => token ? deleteModerator(token, id) : Promise.reject(),
    uploadImage: (bytes: ArrayBuffer, format: string) => token ? uploadImage(token, bytes, format) : Promise.reject(),
  };
}
