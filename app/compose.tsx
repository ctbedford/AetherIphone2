// app/compose.tsx
import React from 'react';
import { ScrollView } from 'react-native'; // Using RN ScrollView directly
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { YStack, XStack, Form, Input, Label, TextArea, Button, Switch, Paragraph, Spinner } from 'tamagui';
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'; // Import ControllerRenderProps
import { zodResolver } from '@hookform/resolvers/zod';
import { useToastController } from '@tamagui/toast'; // Assuming ToastProvider is set up

import { trpc, type RouterInputs } from '@/utils/trpc'; // Assuming inputs are exported like this
import { haptics } from '@/utils/haptics'; // Assuming haptics helper exists

// Assuming your Zod schemas are exported like this. Adjust if necessary.
type CreateValueInput = RouterInputs['value']['createValue'];
type CreateStateInput = RouterInputs['state']['createDefinition'];

// 1️⃣ Define tagged types for discriminated union
type CreateValueInputTagged = CreateValueInput & { __type: 'value' };
type CreateStateInputTagged = CreateStateInput & { __type: 'state' };
type FormValues = CreateValueInputTagged | CreateStateInputTagged;

export default function ComposeModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: string }>();
  const type = params.type === 'value' || params.type === 'state' ? params.type : undefined;
  const toast = useToastController();
  const utils = trpc.useUtils();

  const isValue = type === 'value';

  // 2️⃣ Define stricter default values using tagged types
  const defaultValueValues: CreateValueInputTagged = {
    __type: 'value',
    title: '', // Use 'title' instead of 'name' - Patch #4
    description: ''
  };
  const defaultStateValues: CreateStateInputTagged = {
    __type: 'state',
    name: '',
    scale: '1-5',
    description: '',
    active: true,
    priority: 50
  };

  // --- Separate useMutation hooks ---
  const createValueMutation = trpc.value.createValue.useMutation({
    onSuccess: (data) => handleSuccess(data),
    onError: (error) => handleError(error),
  });
  const createStateDefMutation = trpc.state.createDefinition.useMutation({
    onSuccess: (data) => handleSuccess(data),
    onError: (error) => handleError(error),
  });

  // --- Form setup ---
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    // Note: ZodResolver might need specific configuration if schemas differ vastly
    // or consider not using it if relying solely on backend validation for this dynamic form.
    // Use the new stricter default value constants
    defaultValues: isValue ? defaultValueValues : defaultStateValues,
  });

  // Reset form if the type changes dynamically
  React.useEffect(() => {
    // Use the new stricter default value constants for reset
    reset(isValue ? defaultValueValues : defaultStateValues);
  }, [isValue, reset]);

  // --- Shared success/error handlers ---
  const handleSuccess = (data: any) => {
      toast.show('Created successfully!', { native: true });
      haptics.success();
      if (isValue) {
        utils.value.getValues.invalidate();
      } else {
        utils.state.getDefinitions.invalidate();
      }
      if (router.canGoBack()) {
        router.dismiss(); // Apply patch #5 - Use dismiss for modals
      } else {
        router.replace('/(tabs)/compass');
      }
  }

  const handleError = (error: any) => {
       toast.show(`Error: ${error.message}`, { type: 'error', native: true });
       haptics.error();
  }

  // --- Corrected onSubmit ---
  const onSubmit = (formData: FormValues) => {
    // 3️⃣ Use discriminant (__type) for type safety, remove casts
    if (formData.__type === 'value') {
      createValueMutation.mutate(formData);
    } else { // formData.__type === 'state'
      createStateDefMutation.mutate(formData);
    }
  };

  // Handle invalid type parameter gracefully
  if (!type) {
    return (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
            <Paragraph color="$error">Invalid type specified.</Paragraph> {/* Use $error */}
            <Button onPress={() => router.back()} marginTop="$4">Go Back</Button>
        </YStack>
    );
  }

  // Determine current mutation state for button
  const isPending = isValue ? createValueMutation.isPending : createStateDefMutation.isPending;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Form onSubmit={handleSubmit(onSubmit)} flex={1} padding="$4" space="$4" backgroundColor="$background">
        <Stack.Screen options={{ title: isValue ? 'Add Principle' : 'Define State' }} />

        {/* Conditionally render form fields */}
        {isValue ? (
          <>
            {/* --- Fields for Principle/Value --- */}
            <YStack space="$2">
              <Label htmlFor="title">Title</Label> {/* Patch #4: name -> title */}
              <Controller
                name="title" /* Patch #4: name -> title */
                control={control}
                rules={{ required: 'Title is required' }} /* Patch #4 */
                render={({ field }) => ( /* Use inferred types from FormValues */
                  <Input
                    id="title"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange} // Use onChangeText
                    value={field.value}
                    placeholder="Principle Title"
                  />
                )}
              />
              {/* Use $error token */}
              {errors.title && <Paragraph color="$error">{errors.title?.message}</Paragraph>}
            </YStack>

            <YStack space="$2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => ( // Use inferred types
                  <TextArea
                    id="description"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange} // Use onChangeText
                    value={field.value ?? ''}
                    placeholder="Describe the principle..."
                    numberOfLines={3}
                  />
                )}
              />
              {errors.description && <Paragraph color="$error">{errors.description?.message}</Paragraph>}
            </YStack>
          </>
        ) : (
          <>
            {/* --- Fields for State Definition --- */}
            <YStack space="$2">
              <Label htmlFor="name">State Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => ( // Use inferred types // Explicit type
                  <Input
                    id="name"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange} // Use onChangeText
                    value={field.value}
                    placeholder="e.g., Energy Level, Mood" />
                )}
              />
              {errors.name && <Paragraph color="$error">{errors.name?.message}</Paragraph>}
            </YStack>

             <YStack space="$2">
               <Label htmlFor="scale">Scale</Label>
               <Controller
                 name="scale"
                 control={control}
                 rules={{ required: 'Scale is required' }}
                 render={({ field }) => ( // Use inferred types
                   <>
                    <Paragraph>Scale Selector Placeholder (Selected: {field.value})</Paragraph>
                    <XStack space="$2">
                      {/* Removed invalid theme prop */}
                      <Button size="$2" onPress={() => field.onChange('1-5')} theme={field.value === '1-5' ? 'active' : undefined}>1-5</Button>
                      <Button size="$2" onPress={() => field.onChange('1-10')} theme={field.value === '1-10' ? 'active' : undefined}>1-10</Button>
                    </XStack>
                   </>
                 )}
               />
                {errors.scale && <Paragraph color="$error">{errors.scale?.message}</Paragraph>}
             </YStack>

             <YStack space="$2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => ( // Use inferred types
                  <TextArea
                    id="description"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange} // Use onChangeText
                    value={field.value ?? ''}
                    placeholder="Describe when/how to track this state..."
                    numberOfLines={3}
                  />
                )}
              />
              {errors.description && <Paragraph color="$error">{errors.description?.message}</Paragraph>}
            </YStack>

            <XStack space="$4" alignItems="center">
               <Label htmlFor="active" flex={1}>Active</Label>
               <Controller
                 name="active"
                 control={control}
                 render={({ field }: { field: ControllerRenderProps<FieldValues, 'active'> }) => ( // Explicit type
                    <Switch
                      id="active"
                      checked={!!field.value} // Use checked
                      onCheckedChange={field.onChange} // Use onCheckedChange
                      size="$3"
                    >
                        <Switch.Thumb animation="quick" />
                    </Switch>
                 )}
               />
            </XStack>
          </>
        )}

        {/* Removed invalid theme prop */}
        <Form.Trigger asChild disabled={isPending}>
          <Button icon={isPending ? <Spinner /> : undefined}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </Form.Trigger>
      </Form>
    </ScrollView>
  );
}