# How to Set a User as Admin

## Method 1: Using MongoDB (Recommended for First Admin)

1. Open MongoDB Compass or connect to your MongoDB database
2. Navigate to your database (usually `localnews` or similar)
3. Find the `users` collection
4. Find the user you want to make admin (by email or username)
5. Update the user document:
   - Set `role` field to `"admin"`
   - Example: `{ "role": "admin" }`

### Using MongoDB Shell:
```javascript
// Connect to your database
use localnews

// Update user by email
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

// Or update by username
db.users.updateOne(
  { username: "your-username" },
  { $set: { role: "admin" } }
)
```

## Method 2: Using Admin Dashboard (If you already have an admin)

1. Log in as an existing admin user
2. Go to `/admin/dashboard`
3. Click on "Users" in the sidebar
4. Find the user you want to promote
5. Use the role dropdown to change their role to "admin"
6. Click to save

## Method 3: Create a New Admin User via Registration

1. Register a new user normally
2. Then use Method 1 (MongoDB) to set their role to "admin"

## Accessing the Admin Dashboard

Once a user has `role: "admin"`:
- They will be automatically redirected to `/admin/dashboard` when they log in
- They can also directly navigate to `/admin/dashboard` or `/admin`
- Non-admin users will be redirected to the home page if they try to access `/admin/dashboard`

## Verify Admin Status

After setting a user as admin:
1. Log out (if logged in)
2. Log in again with that user's credentials
3. You should be automatically redirected to `/admin/dashboard`
4. You should see the admin panel with sidebar navigation

