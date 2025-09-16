# Dual Authentication System Implementation

## Overview

This implementation allows the same email address to be used for both seller and buyer accounts in Bloxable. Users can have multiple profiles (seller and buyer) associated with a single Supabase authentication account.

## Architecture

### Database Schema

**New Table: `user_profiles`**

- `id`: UUID primary key
- `user_id`: References auth.users(id)
- `profile_type`: 'seller' | 'buyer'
- `full_name`: User's display name
- `avatar_url`: Profile picture URL
- `bio`: User biography
- `company_name`: For sellers only
- `website`: For sellers only
- `phone`: Contact information
- `address`: JSONB for address data
- `preferences`: JSONB for user preferences
- `is_verified`: For seller verification
- `is_active`: Currently active profile
- `created_at`, `updated_at`: Timestamps

**Key Features:**

- One profile per type per user (UNIQUE constraint)
- Row Level Security (RLS) enabled
- Automatic profile switching functions
- Profile creation functions

### Authentication Flow

1. **Single Sign-In**: Users authenticate once with Supabase
2. **Profile Management**: Users can have both seller and buyer profiles
3. **Role Switching**: Users can switch between profiles without re-authentication
4. **Automatic Profile Creation**: Profiles are created when needed

## Components

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

Enhanced with:

- `currentProfile`: Currently active profile
- `availableProfiles`: All user profiles
- `switchProfile()`: Switch between profiles
- `createProfile()`: Create new profiles
- `isSeller`/`isBuyer`: Computed properties

### 2. AuthModal (`src/components/auth/AuthModal.tsx`)

Unified authentication modal supporting:

- Both seller and buyer registration
- User type selection
- Single sign-in for both types
- Automatic profile creation

### 3. RoleSwitcher (`src/components/auth/RoleSwitcher.tsx`)

UI component for:

- Switching between seller/buyer modes
- Creating new profiles on demand
- Visual indication of current role

### 4. Protected Routes

- `ProtectedRoute`: Generic protection with profile type filtering
- `SellerProtectedRoute`: Seller-specific protection
- `BuyerProtectedRoute`: Buyer-specific protection

### 5. Authentication Pages

- `SellerAuth`: Seller-specific authentication
- `BuyerAuth`: Buyer-specific authentication

## Usage Examples

### Creating a Seller Account

```typescript
// User signs up and selects "seller" in AuthModal
// System creates:
// 1. Supabase auth user
// 2. Seller profile with company_name field
```

### Creating a Buyer Account

```typescript
// User signs up and selects "buyer" in AuthModal
// System creates:
// 1. Supabase auth user (if new)
// 2. Buyer profile with preferences field
```

### Switching Roles

```typescript
const { switchProfile, createProfile } = useAuth();

// Switch to existing seller profile
await switchProfile("seller");

// Create new buyer profile if doesn't exist
await createProfile("buyer", "John Doe", { preferences: {} });
```

## Database Functions

### `switch_user_profile(user_uuid, new_profile_type)`

- Deactivates all profiles for user
- Activates the requested profile type
- Returns boolean success status

### `create_user_profile(user_uuid, profile_type, full_name, additional_data)`

- Creates new profile for user
- Validates profile type
- Sets as active if first profile
- Returns profile ID

### `get_user_active_profile_type(user_uuid)`

- Returns currently active profile type
- Defaults to 'buyer' if no active profile

## Security Features

1. **Row Level Security**: Users can only access their own profiles
2. **Profile Validation**: Server-side validation of profile types
3. **Automatic Cleanup**: Profiles deleted when user account is deleted
4. **Type Safety**: TypeScript interfaces for all profile data

## UI/UX Features

1. **Role Switcher**: Easy switching between seller/buyer modes
2. **Contextual Navigation**: Different nav items based on current role
3. **Unified Auth Modal**: Single modal for both user types
4. **Mobile Support**: Role switching works on mobile devices
5. **Visual Indicators**: Clear indication of current role

## Migration Steps

1. **Run Database Migration**:

   ```sql
   -- Execute supabase-dual-auth-schema.sql
   ```

2. **Update Existing Users**:

   ```sql
   -- Create buyer profiles for existing users
   INSERT INTO user_profiles (user_id, profile_type, is_active)
   SELECT id, 'buyer', true FROM auth.users;
   ```

3. **Deploy Updated Code**:
   - All components are backward compatible
   - Existing users will automatically get buyer profiles

## Benefits

1. **Single Email**: Users don't need separate accounts
2. **Seamless Switching**: No re-authentication required
3. **Data Separation**: Seller and buyer data kept separate
4. **Flexible Growth**: Easy to add new profile types
5. **Better UX**: Unified authentication experience

## Future Enhancements

1. **Profile Merging**: Merge duplicate accounts
2. **Role Permissions**: Fine-grained permissions per role
3. **Profile Analytics**: Track profile usage patterns
4. **Bulk Operations**: Manage multiple profiles efficiently
5. **Profile Templates**: Pre-configured profile types

## Testing

The system has been designed to be:

- **Backward Compatible**: Existing users continue to work
- **Type Safe**: Full TypeScript support
- **Error Resilient**: Graceful handling of edge cases
- **Performance Optimized**: Efficient database queries

## Conclusion

This dual authentication system provides a robust foundation for supporting both seller and buyer users with the same email address, while maintaining data separation and providing an excellent user experience.
