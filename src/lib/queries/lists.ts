import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";

import type { Tables } from "@/lib/database.types";
import { albumKeys } from "@/lib/queries/albums";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase";

export type List = Tables<"lists">;

export const DEFAULT_LIST_NAME = "Listen List";

export const isDefaultList = (list: List) => list.name === DEFAULT_LIST_NAME;

export const getListStatus = (list: List) => {
  const visibility = list.public ? "Public" : "Private";
  return isDefaultList(list) ? `Default list · ${visibility}` : visibility;
};

export const findDefaultList = (lists: List[]) => lists.find(isDefaultList);

export const validateListName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "Enter a name for the list.";
  if (trimmed.toLowerCase() === DEFAULT_LIST_NAME.toLowerCase()) {
    return `“${DEFAULT_LIST_NAME}” is reserved for your default list.`;
  }
  return null;
};

const sortLists = (lists: List[]) =>
  [...lists].sort(
    (a, b) =>
      Number(isDefaultList(b)) - Number(isDefaultList(a)) ||
      a.created_at.localeCompare(b.created_at),
  );

export const listsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["lists", userId] as const,
    queryFn: async () => {
      const { data, error } = await supabase.from("lists").select("*").eq("user_id", userId);
      if (error) throw error;
      return sortLists(data);
    },
    enabled: userId !== "",
  });

const findCachedList = (listId: number) => {
  for (const [queryKey, lists] of queryClient.getQueriesData<List[]>({ queryKey: ["lists"] })) {
    const list = lists?.find((l) => l.id === listId);
    if (list) return { list, updatedAt: queryClient.getQueryState(queryKey)?.dataUpdatedAt };
  }
  return undefined;
};

export const listQueryOptions = (listId: number) =>
  queryOptions({
    queryKey: ["list", listId] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("*")
        .eq("id", listId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    initialData: () => findCachedList(listId)?.list,
    initialDataUpdatedAt: () => findCachedList(listId)?.updatedAt,
  });

const snapshotList = (client: QueryClient, listId: number) => ({
  lists: client.getQueriesData<List[]>({ queryKey: ["lists"] }),
  list: client.getQueryData(listQueryOptions(listId).queryKey),
});

const restoreList = (
  client: QueryClient,
  listId: number,
  snapshot: ReturnType<typeof snapshotList> | undefined,
) => {
  if (!snapshot) return;
  for (const [queryKey, lists] of snapshot.lists) client.setQueryData(queryKey, lists);
  client.setQueryData(listQueryOptions(listId).queryKey, snapshot.list);
};

const updateCachedList = async (
  client: QueryClient,
  listId: number,
  update: (list: List) => List | null,
) => {
  await client.cancelQueries({ queryKey: ["lists"] });
  await client.cancelQueries({ queryKey: listQueryOptions(listId).queryKey });
  const snapshot = snapshotList(client, listId);
  client.setQueriesData<List[]>({ queryKey: ["lists"] }, (lists) =>
    lists?.flatMap((list) => (list.id === listId ? (update(list) ?? []) : [list])),
  );
  client.setQueryData(listQueryOptions(listId).queryKey, (list) => list && update(list));
  return snapshot;
};

const invalidateList = (client: QueryClient, listId: number) =>
  Promise.all([
    client.invalidateQueries({ queryKey: ["lists"] }),
    client.invalidateQueries({ queryKey: listQueryOptions(listId).queryKey }),
  ]);

type CreateListVariables = { userId: string; name: string };

export const createListMutationOptions = mutationOptions({
  mutationFn: async ({ userId, name }: CreateListVariables) => {
    const validationError = validateListName(name);
    if (validationError) throw new Error(validationError);
    const { data, error } = await supabase
      .from("lists")
      .insert({ user_id: userId, name: name.trim() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  onSuccess: (list, { userId }, _result, { client }) => {
    client.setQueryData(listsQueryOptions(userId).queryKey, (lists) =>
      lists ? sortLists([...lists, list]) : lists,
    );
    client.invalidateQueries({ queryKey: ["lists"] });
  },
});

type RenameListVariables = { list: List; name: string };

export const renameListMutationOptions = mutationOptions({
  mutationFn: async ({ list, name }: RenameListVariables) => {
    if (isDefaultList(list)) throw new Error(`“${DEFAULT_LIST_NAME}” can't be renamed.`);
    const validationError = validateListName(name);
    if (validationError) throw new Error(validationError);
    const { error } = await supabase.from("lists").update({ name: name.trim() }).eq("id", list.id);
    if (error) throw error;
  },
  onMutate: ({ list, name }, { client }) =>
    updateCachedList(client, list.id, (cached) => ({ ...cached, name: name.trim() })),
  onError: (_error, { list }, snapshot, { client }) => restoreList(client, list.id, snapshot),
  onSettled: (_data, _error, { list }, _result, { client }) => {
    invalidateList(client, list.id);
  },
});

type SetListVisibilityVariables = { listId: number; isPublic: boolean };

export const setListVisibilityMutationOptions = mutationOptions({
  mutationFn: async ({ listId, isPublic }: SetListVisibilityVariables) => {
    const { error } = await supabase.from("lists").update({ public: isPublic }).eq("id", listId);
    if (error) throw error;
  },
  onMutate: ({ listId, isPublic }, { client }) =>
    updateCachedList(client, listId, (cached) => ({ ...cached, public: isPublic })),
  onError: (_error, { listId }, snapshot, { client }) => restoreList(client, listId, snapshot),
  onSettled: (_data, _error, { listId }, _result, { client }) => invalidateList(client, listId),
});

export const deleteListMutationOptions = mutationOptions({
  mutationFn: async (list: List) => {
    if (isDefaultList(list)) throw new Error(`“${DEFAULT_LIST_NAME}” can't be deleted.`);
    const { error } = await supabase.from("lists").delete().eq("id", list.id);
    if (error) throw error;
  },
  onMutate: (list, { client }) => updateCachedList(client, list.id, () => null),
  onError: (_error, list, snapshot, { client }) => restoreList(client, list.id, snapshot),
  onSuccess: (_data, list, _result, { client }) => {
    client.removeQueries({ queryKey: albumKeys.list(list.id) });
  },
  onSettled: (_data, _error, list, _result, { client }) => invalidateList(client, list.id),
});
