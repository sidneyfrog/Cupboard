import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMMON_STRINGS } from '@/constants/strings';

interface PickerSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onValueChange: (value: string) => void;
}

/** A modal-based picker that works consistently on iOS and Android. */
export function PickerSelect({ label, value, options, onValueChange }: PickerSelectProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-neutral-700">{label}</Text>
      <Pressable
        onPress={() => setVisible(true)}
        className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
      >
        <Text className="text-base text-neutral-800">{value || 'Select...'}</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide">
        <SafeAreaView className="flex-1 justify-end bg-black/40">
          <View className="max-h-96 rounded-t-2xl bg-white">
            <View className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3">
              <Text className="text-lg font-semibold text-neutral-800">{label}</Text>
              <Pressable onPress={() => setVisible(false)}>
                <Text className="text-base font-medium text-primary-500">
                  {COMMON_STRINGS.DONE}
                </Text>
              </Pressable>
            </View>
            <FlatList
              data={options as unknown as string[]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onValueChange(item);
                    setVisible(false);
                  }}
                  className={`border-b border-neutral-50 px-4 py-3.5 ${
                    item === value ? 'bg-primary-50' : ''
                  }`}
                >
                  <Text
                    className={`text-base ${
                      item === value ? 'font-semibold text-primary-600' : 'text-neutral-700'
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
