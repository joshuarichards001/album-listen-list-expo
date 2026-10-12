import { router } from "expo-router";
import { useRef, useState } from "react";

import { validateListName } from "@/lib/queries/lists";
import { Pressable, Text, TextInput, useCSSVariable, View } from "@/tw";

type Props = {
  title: string;
  submitLabel: string;
  initialName?: string;
  onSubmit: (name: string) => Promise<unknown>;
};

export function ListNameForm({ title, submitLabel, initialName = "", onSubmit }: Props) {
  const placeholderColor = useCSSVariable("--color-text-muted");
  const selectionColor = useCSSVariable("--color-spotify-green");
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  // State updates too late to stop a double tap from submitting twice.
  const isSubmitting = useRef(false);

  const submit = async () => {
    if (isSubmitting.current) return;
    const validationError = validateListName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    isSubmitting.current = true;
    setIsPending(true);
    try {
      await onSubmit(name.trim());
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      isSubmitting.current = false;
      setIsPending(false);
    }
  };

  return (
    <View className="gap-4 px-6 pt-8 pb-10">
      <Text className="text-title text-text-base">{title}</Text>
      <TextInput
        autoFocus
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
        placeholder="List name"
        placeholderTextColor={placeholderColor}
        selectionColor={selectionColor}
        returnKeyType="done"
        submitBehavior="submit"
        onSubmitEditing={submit}
        maxLength={100}
        className="rounded-lg bg-background-highlight px-4 py-3 text-body text-text-base"
      />
      {error ? <Text className="text-subhead text-danger">{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={isPending}
        className={`items-center rounded-full bg-spotify-green py-3 active:bg-spotify-green-active ${isPending ? "opacity-50" : ""}`}
        onPress={submit}
      >
        <Text className="text-body text-black">{isPending ? "Saving…" : submitLabel}</Text>
      </Pressable>
    </View>
  );
}
