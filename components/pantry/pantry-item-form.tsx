import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { PickerSelect } from '@/components/ui/picker-select';
import { PANTRY_CATEGORIES, UNITS } from '@/constants/categories';
import { PANTRY_STRINGS, COMMON_STRINGS } from '@/constants/strings';
import type { PantryItem } from '@/types';
import type { PantryCategory, Unit } from '@/constants/categories';

interface PantryItemFormProps {
  initialValues?: Partial<PantryItem>;
  onSubmit: (values: {
    name: string;
    quantity: number;
    unit: Unit;
    category: PantryCategory;
    expiryDate?: string;
    barcode?: string;
    imageUrl?: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

/** Form for creating or editing a pantry item. */
export function PantryItemForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: PantryItemFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [quantity, setQuantity] = useState(String(initialValues?.quantity ?? ''));
  const [unit, setUnit] = useState<Unit>(initialValues?.unit ?? 'units');
  const [category, setCategory] = useState<PantryCategory>(initialValues?.category ?? 'Other');
  const [expiryDate, setExpiryDate] = useState(initialValues?.expiryDate ?? '');
  const [barcode] = useState(initialValues?.barcode ?? '');
  const [imageUrl] = useState(initialValues?.imageUrl);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert(COMMON_STRINGS.ERROR, 'Please enter a name.');
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert(COMMON_STRINGS.ERROR, 'Please enter a valid quantity.');
      return;
    }

    onSubmit({
      name: name.trim(),
      quantity: qty,
      unit,
      category,
      expiryDate: expiryDate || undefined,
      barcode: barcode || undefined,
      imageUrl,
    });
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      <FormField
        label={PANTRY_STRINGS.NAME_LABEL}
        placeholder={PANTRY_STRINGS.NAME_PLACEHOLDER}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <View className="flex-row">
        <View className="mr-2 flex-1">
          <FormField
            label={PANTRY_STRINGS.QUANTITY_LABEL}
            placeholder="1"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <PickerSelect
            label={PANTRY_STRINGS.UNIT_LABEL}
            value={unit}
            options={UNITS}
            onValueChange={(v) => setUnit(v as Unit)}
          />
        </View>
      </View>

      <PickerSelect
        label={PANTRY_STRINGS.CATEGORY_LABEL}
        value={category}
        options={PANTRY_CATEGORIES}
        onValueChange={(v) => setCategory(v as PantryCategory)}
      />

      <FormField
        label={PANTRY_STRINGS.EXPIRY_LABEL}
        placeholder="YYYY-MM-DD"
        value={expiryDate}
        onChangeText={setExpiryDate}
      />

      <View className="mt-4 flex-row">
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
