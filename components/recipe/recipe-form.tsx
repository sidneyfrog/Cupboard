import React, { useState } from 'react';
import { View, ScrollView, Text, Pressable, Alert } from 'react-native';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { RECIPE_STRINGS, COMMON_STRINGS } from '@/constants/strings';
import { UNITS } from '@/constants/categories';
import { PickerSelect } from '@/components/ui/picker-select';
import type { RecipeIngredient, RecipeSource } from '@/types';
import type { Unit } from '@/constants/categories';

interface RecipeFormProps {
  initialValues?: {
    title?: string;
    description?: string;
    ingredients?: RecipeIngredient[];
    steps?: string[];
    tags?: string[];
    source?: RecipeSource;
  };
  onSubmit: (values: {
    title: string;
    description: string;
    ingredients: RecipeIngredient[];
    steps: string[];
    tags: string[];
    source: RecipeSource;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

/** Form for creating or editing a recipe with ingredients and steps. */
export function RecipeForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: RecipeFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialValues?.ingredients ?? [{ name: '', quantity: 1, unit: 'units' as Unit }]
  );
  const [steps, setSteps] = useState<string[]>(initialValues?.steps ?? ['']);
  const [tagsText, setTagsText] = useState(initialValues?.tags?.join(', ') ?? '');

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 1, unit: 'units' as Unit }]);
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => setSteps([...steps, '']);

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert(COMMON_STRINGS.ERROR, 'Please enter a title.');
      return;
    }
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert(COMMON_STRINGS.ERROR, 'Please add at least one ingredient.');
      return;
    }
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      Alert.alert(COMMON_STRINGS.ERROR, 'Please add at least one step.');
      return;
    }
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      ingredients: validIngredients,
      steps: validSteps,
      tags,
      source: initialValues?.source ?? 'manual',
    });
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      <FormField
        label={RECIPE_STRINGS.TITLE_LABEL}
        placeholder={RECIPE_STRINGS.TITLE_PLACEHOLDER}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <FormField
        label={RECIPE_STRINGS.DESCRIPTION_LABEL}
        placeholder={RECIPE_STRINGS.DESCRIPTION_PLACEHOLDER}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text className="mb-2 text-sm font-medium text-neutral-700">
        {RECIPE_STRINGS.INGREDIENTS_LABEL}
      </Text>
      {ingredients.map((ing, index) => (
        <View key={index} className="mb-2 flex-row items-center">
          <View className="mr-1 w-16">
            <FormField
              label=""
              placeholder="Qty"
              value={String(ing.quantity)}
              onChangeText={(v) => updateIngredient(index, 'quantity', parseFloat(v) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View className="mr-1 w-20">
            <PickerSelect
              label=""
              value={ing.unit}
              options={UNITS}
              onValueChange={(v) => updateIngredient(index, 'unit', v)}
            />
          </View>
          <View className="mr-1 flex-1">
            <FormField
              label=""
              placeholder="Ingredient name"
              value={ing.name}
              onChangeText={(v) => updateIngredient(index, 'name', v)}
            />
          </View>
          <Pressable onPress={() => removeIngredient(index)} className="p-2">
            <Text className="text-lg text-red-400">✕</Text>
          </Pressable>
        </View>
      ))}
      <Pressable onPress={addIngredient} className="mb-4">
        <Text className="text-sm font-medium text-primary-500">+ Add ingredient</Text>
      </Pressable>

      <Text className="mb-2 text-sm font-medium text-neutral-700">
        {RECIPE_STRINGS.STEPS_LABEL}
      </Text>
      {steps.map((step, index) => (
        <View key={index} className="mb-2 flex-row items-center">
          <Text className="mr-2 text-sm font-medium text-neutral-400">{index + 1}.</Text>
          <View className="mr-1 flex-1">
            <FormField
              label=""
              placeholder={`Step ${index + 1}`}
              value={step}
              onChangeText={(v) => updateStep(index, v)}
              multiline
            />
          </View>
          <Pressable onPress={() => removeStep(index)} className="p-2">
            <Text className="text-lg text-red-400">✕</Text>
          </Pressable>
        </View>
      ))}
      <Pressable onPress={addStep} className="mb-4">
        <Text className="text-sm font-medium text-primary-500">+ Add step</Text>
      </Pressable>

      <FormField
        label={RECIPE_STRINGS.TAGS_LABEL}
        placeholder={RECIPE_STRINGS.TAGS_PLACEHOLDER}
        value={tagsText}
        onChangeText={setTagsText}
      />

      <View className="mt-4 mb-8 flex-row">
        <View className="mr-2 flex-1">
          <Button label={COMMON_STRINGS.CANCEL} onPress={onCancel} variant="outline" />
        </View>
        <View className="flex-1">
          <Button label={COMMON_STRINGS.SAVE} onPress={handleSubmit} loading={loading} />
        </View>
      </View>
    </ScrollView>
  );
}
