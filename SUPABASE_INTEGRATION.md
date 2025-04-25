# Aether App - Supabase Integration

## What's Been Integrated

1. **Supabase Authentication**
   - Email/password login and registration
   - Secure token storage using Expo SecureStore
   - Authentication state management
   - Automatic session refresh

2. **User Profiles**
   - Basic profile retrieval through Supabase
   - User metadata storage

3. **App Configuration**
   - Added settings management with SecureStore
   - Environment variable setup for Supabase credentials

## Setup Instructions

1. **Create a Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Local Setup**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL and anon key
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Database Setup in Supabase**
   - Create a `profiles` table with the SQL below:

   ```sql
   create table public.profiles (
     id uuid references auth.users not null primary key,
     username text,
     avatar_url text,
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );

   -- Enable RLS
   alter table public.profiles enable row level security;

   -- Create a policy that allows users to read all profiles
   create policy "Profiles are viewable by everyone" on profiles
     for select using (true);

   -- Create a policy that allows users to update only their own profile
   create policy "Users can update their own profile" on profiles
     for update using (auth.uid() = id);

   -- Function to create a profile when a user signs up
   create or replace function public.handle_new_user()
   returns trigger as $$
   begin
     insert into public.profiles (id, username, avatar_url)
     values (new.id, new.raw_user_meta_data->>'username', null);
     return new;
   end;
   $$ language plpgsql security definer;

   -- Trigger to create a profile when a user signs up
   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();
   ```

## Next Steps

1. **Real-time Data Sync**
   - Set up Supabase Realtime for subscriptions
   - Implement data sync with React Query + Supabase

2. **Storage**
   - Implement Supabase Storage for file uploads (profile pictures, attachments)

3. **Offline Support**
   - Implement offline queue for mutations
   - Set up background sync

4. **Testing**
   - Create a test project in Supabase for CI/CD environments

## Implementation Details

### Authentication Flow

1. User enters credentials in login/register screen
2. Supabase SDK handles authentication
3. Supabase stores tokens in SecureStore
4. Authentication state is managed in _layout.tsx
5. Pages use authentication state to redirect as needed

### Profile Management

The `getUserProfile` function demonstrates how to:
1. Get the current authenticated user
2. Query their profile information from the database
3. Handle cases where the profile hasn't been created yet

### Logout Flow

The logout function:
1. Calls Supabase signOut
2. Clears session state
3. Redirects to login 

## Offline Support

We've implemented a comprehensive offline-first architecture using:

1. **React Query Persistence**
   - Queries are cached in AsyncStorage
   - Mutations are paused when offline and resumed when online
   - Cache is rehydrated on app restart

2. **Visual Indicators**
   - OfflineIndicator component shows network status
   - Pending items are marked with a visual badge

3. **Custom Offline Sync System**
   - Mutations are stored in AsyncStorage when offline
   - Automatic sync when the device reconnects
   - Support for create, update, and delete operations

### Using Offline Sync in Components

```tsx
import { useOfflineSync } from '@/hooks/useOfflineSync';

// In your component
function TaskList() {
  // Set up offline sync for the 'tasks' entity
  const { 
    isOnline, 
    pendingItems, 
    createItem, 
    updateItem, 
    deleteItem, 
    isItemPending 
  } = useOfflineSync<Task>('tasks');

  // Create a new task (works offline)
  const handleAddTask = async () => {
    const { id, isOffline } = await createItem({ 
      title: 'New Task',
      completed: false
    });
    
    // The task is created with a temporary ID if offline
    console.log(`Task created with ID: ${id}, offline: ${isOffline}`);
  };

  // In your render function, show pending state
  return (
    <View>
      {tasks.map(task => (
        <View key={task.id}>
          <Text>{task.title}</Text>
          {isItemPending(task.id) && (
            <Badge>Pending Sync</Badge>
          )}
        </View>
      ))}
    </View>
  );
}
``` 