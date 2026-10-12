import { useMutation } from "@tanstack/react-query";

import { ListNameForm } from "@/components/list-name-form";
import { createListMutationOptions } from "@/lib/queries/lists";
import { useRootStore } from "@/stores/root-store";

export default function NewListSheet() {
  const userId = useRootStore((state) => state.id);
  const setSelectedListId = useRootStore((state) => state.setSelectedListId);
  const createList = useMutation(createListMutationOptions);

  return (
    <ListNameForm
      title="New List"
      submitLabel="Create"
      onSubmit={async (name) => {
        const list = await createList.mutateAsync({ userId, name });
        setSelectedListId(list.id);
      }}
    />
  );
}
