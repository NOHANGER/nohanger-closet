import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type TagData = {
  tag: string;
  count: number;
}[];

interface TagChipProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
  count: number;
}

interface Props {
  tagData: TagData;
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  containerStyle?: object;
}

const TagChip = ({ name, isSelected, onPress, count }: TagChipProps) => (
  <Pressable style={[styles.tagChip, isSelected && styles.tagChipSelected]} onPress={onPress}>
    <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
      {name} ({count})
    </Text>
  </Pressable>
);

const TagFilterSection = ({ tagData, selectedTags, onTagPress, containerStyle }: Props) => {
  if (tagData.length === 0) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {tagData.map(({ tag, count }) => (
          <TagChip
            key={tag}
            name={tag}
            isSelected={selectedTags.includes(tag)}
            onPress={() => onTagPress(tag)}
            count={count}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 44,
    marginTop: 8,
    paddingBottom: 10,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  tagChip: {
    height: 32,
    flexDirection: "row",
    backgroundColor: colors.tag_light,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  tagChipSelected: {
    backgroundColor: colors.light_yellow,
    borderColor: colors.primary_yellow,
  },
  tagChipText: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: colors.text_gray,
  },
  tagChipTextSelected: {
    color: colors.text_primary,
    fontFamily: typography.medium,
  },
});

export default TagFilterSection;
