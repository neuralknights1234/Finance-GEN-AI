# Database Setup Guide

This guide will help you set up the database to ensure all profile data is properly saved and retrieved.

## Prerequisites

- Supabase project set up
- Access to Supabase SQL editor

## Step 1: Create the Profiles Table

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database_setup.sql`
4. Click "Run" to execute the script

This will create:
- A `profiles` table with all necessary fields
- Proper indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 2: Verify Table Creation

After running the script, you should see:
- A new `profiles` table in your database
- RLS policies applied
- A trigger for automatic timestamp updates

## Step 3: Test the Setup

1. Start your application
2. Create a new account or log in
3. Go to the Profile screen
4. Fill out and save your profile information
5. Log out and log back in
6. Verify that your profile data is still there

## Database Schema

The `profiles` table contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `persona` | TEXT | User persona (Student/Professional) |
| `age` | INTEGER | User age |
| `income` | TEXT | Income range |
| `goals` | TEXT | Financial goals |
| `display_name` | TEXT | Display name |
| `avatar_data_url` | TEXT | Avatar image data URL |
| `country` | TEXT | User's country |
| `currency` | TEXT | Preferred currency |
| `locale` | TEXT | User's locale |
| `risk_tolerance` | INTEGER | Risk tolerance (1-5) |
| `time_horizon` | TEXT | Investment time horizon |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## Security Features

- **Row Level Security (RLS)**: Users can only access their own profile data
- **Automatic cleanup**: When a user is deleted, their profile is automatically removed
- **Data validation**: Constraints ensure data integrity

## Troubleshooting

### Profile data not loading
- Check that the `profiles` table exists
- Verify RLS policies are enabled
- Check browser console for errors

### Cannot save profile
- Ensure you're authenticated
- Check that the `profiles` table has the correct structure
- Verify RLS policies allow INSERT/UPDATE

### Database connection issues
- Check your Supabase environment variables
- Verify your Supabase project is active
- Check network connectivity

## Migration from User Metadata

If you were previously storing profile data in `user_metadata`, the new system will:
1. Create a profile record when users log in
2. Maintain backward compatibility
3. Gradually migrate data to the dedicated profiles table

## Performance Considerations

- The `user_id` field is indexed for fast lookups
- Profile data is loaded only when needed
- Updates are batched to minimize database calls
