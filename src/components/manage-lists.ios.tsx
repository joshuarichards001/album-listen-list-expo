import {
  Button,
  HStack,
  Image,
  List,
  Section,
  Spacer,
  SwipeActions,
  Text,
  Toggle,
  VStack,
} from "@expo/ui/swift-ui";
import {
  contentShape,
  font,
  foregroundStyle,
  labelsHidden,
  listRowBackground,
  onTapGesture,
  opacity,
  scrollContentBackground,
  shapes,
  tint,
} from "@expo/ui/swift-ui/modifiers";

import type { ManageListsProps } from "@/components/manage-lists";
import { DEFAULT_LIST_NAME, getListStatus, isDefaultList } from "@/lib/queries/lists";
import { Host, useCSSVariable } from "@/tw";

const secondaryStyle = { type: "color", color: "secondaryLabel" } as const;

export function ManageLists({
  lists,
  onRename,
  onDelete,
  onSetPublic,
  onDefaultListPress,
}: ManageListsProps) {
  const fontFamily = useCSSVariable("--font-gotham");
  const rowColor = useCSSVariable("--color-background-highlight");
  const accentColor = useCSSVariable("--color-spotify-green");
  const renameColor = useCSSVariable("--color-background-hover");

  return (
    <Host colorScheme="dark" className="flex-1">
      <List modifiers={[scrollContentBackground("hidden")]}>
        <Section
          footer={
            <Text
              modifiers={[font({ family: fontFamily, size: 13 }), foregroundStyle(secondaryStyle)]}
            >
              {`Anyone with the link can view a public list. Swipe left on a list to rename or delete it. “${DEFAULT_LIST_NAME}” is your default list, so it can't be renamed or deleted.`}
            </Text>
          }
        >
          {lists.map((list) => {
            const isDefault = isDefaultList(list);
            return (
              <SwipeActions key={list.id} modifiers={[listRowBackground(rowColor)]}>
                <HStack spacing={12}>
                  <VStack
                    alignment="leading"
                    spacing={2}
                    modifiers={[
                      contentShape(shapes.rectangle()),
                      onTapGesture(() => (isDefault ? onDefaultListPress() : onRename(list))),
                    ]}
                  >
                    <HStack spacing={6}>
                      <Text modifiers={[font({ family: fontFamily, size: 17 })]}>{list.name}</Text>
                      {isDefault ? (
                        <Image systemName="lock.fill" size={12} modifiers={[opacity(0.6)]} />
                      ) : null}
                    </HStack>
                    <Text
                      modifiers={[
                        font({ family: fontFamily, size: 13 }),
                        // foregroundStyle is ignored inside SwipeActions rows.
                        opacity(0.6),
                      ]}
                    >
                      {getListStatus(list)}
                    </Text>
                  </VStack>
                  <Spacer />
                  <Toggle
                    label="Public"
                    isOn={list.public}
                    onIsOnChange={(isPublic) => onSetPublic(list, isPublic)}
                    modifiers={[labelsHidden(), tint(accentColor)]}
                  />
                </HStack>
                {isDefault ? null : (
                  <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
                    <Button
                      role="destructive"
                      label="Delete"
                      systemImage="trash"
                      onPress={() => onDelete(list)}
                    />
                    <Button
                      label="Rename"
                      systemImage="pencil"
                      onPress={() => onRename(list)}
                      modifiers={[tint(renameColor)]}
                    />
                  </SwipeActions.Actions>
                )}
              </SwipeActions>
            );
          })}
        </Section>
      </List>
    </Host>
  );
}
