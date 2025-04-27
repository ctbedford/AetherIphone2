// Settings screen with account, preferences, and app settings
import React, { useState } from 'react';
import { YStack, XStack, Text, Button, Switch, Separator, ScrollView, Card, H1 } from 'tamagui';
import { SafeAreaView, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUiStore } from '@/stores/uiStore';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection = ({ title, icon, children }: SettingsSectionProps) => {
  return (
    <YStack marginVertical="$2">
      <XStack alignItems="center" space="$2" marginBottom="$2">
        {icon}
        <Text fontSize="$5" fontWeight="bold">{title}</Text>
      </XStack>
      <Card padding="$3" bordered>
        {children}
      </Card>
    </YStack>
  );
};

interface SettingsRowProps {
  label: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

const SettingsRow = ({ label, icon, rightElement, onPress, showChevron = false }: SettingsRowProps) => {
  return (
    <XStack
      paddingVertical="$3"
      justifyContent="space-between"
      alignItems="center"
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.7 } : undefined}
    >
      <XStack space="$3" alignItems="center" flex={1}>
        {icon}
        <Text fontSize="$4">{label}</Text>
      </XStack>
      <XStack space="$2" alignItems="center">
        {rightElement}
        {showChevron && <Ionicons name="chevron-forward" size={18} color="#A0A0A0" />}
      </XStack>
    </XStack>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { isDarkMode, toggleTheme } = useUiStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <ScrollView>
        <YStack flex={1} padding="$4">
          <H1 marginBottom="$4">Settings</H1>
          
          {/* Account Section */}
          <SettingsSection
            title="Account"
            icon={<Ionicons name="person-circle-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Edit Profile"
                icon={<Ionicons name="person-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/profile' as any)}
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="Security"
                icon={<Ionicons name="lock-closed-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/security' as any)}
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="Data & Privacy"
                icon={<Ionicons name="shield-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/privacy' as any)}
              />
            </YStack>
          </SettingsSection>
          
          {/* Appearance Section */}
          <SettingsSection
            title="Appearance"
            icon={<Ionicons name="color-palette-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Dark Mode"
                icon={<Ionicons name="moon-outline" size={20} color="#A0A0A0" />}
                rightElement={
                  <Switch
                    size="$3"
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                  />
                }
              />
            </YStack>
          </SettingsSection>
          
          {/* Notifications Section */}
          <SettingsSection
            title="Notifications"
            icon={<Ionicons name="notifications-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Push Notifications"
                icon={<Ionicons name="push-outline" size={20} color="#A0A0A0" />}
                rightElement={
                  <Switch
                    size="$3"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                }
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="Notification Settings"
                icon={<Ionicons name="options-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/notifications' as any)}
              />
            </YStack>
          </SettingsSection>
          
          {/* Privacy Section */}
          <SettingsSection
            title="Privacy & Data"
            icon={<Ionicons name="analytics-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Analytics Tracking"
                icon={<Ionicons name="trending-up-outline" size={20} color="#A0A0A0" />}
                rightElement={
                  <Switch
                    size="$3"
                    checked={trackingEnabled}
                    onCheckedChange={setTrackingEnabled}
                  />
                }
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="Export Data"
                icon={<Ionicons name="download-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => {
                  Alert.alert(
                    'Export Data',
                    'Your data will be prepared for export and sent to your email address.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Export', onPress: () => {
                        // Would call an API endpoint to initiate export
                        Alert.alert('Export Initiated', 'Check your email for the export file.');
                      }}
                    ]
                  );
                }}
              />
            </YStack>
          </SettingsSection>
          
          {/* Support Section */}
          <SettingsSection
            title="Support & About"
            icon={<Ionicons name="help-circle-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Help Center"
                icon={<Ionicons name="help-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/help' as any)}
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="About Aether"
                icon={<Ionicons name="information-circle-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/about' as any)}
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="App Version"
                icon={<Ionicons name="code-outline" size={20} color="#A0A0A0" />}
                rightElement={<Text color="$gray10">1.0.0</Text>}
              />
            </YStack>
          </SettingsSection>
          
          {/* Logout Button */}
          <Button
            marginTop="$6"
            marginBottom="$8"
            size="$4"
            themeInverse
            onPress={handleLogout}
          >
            Log Out
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
