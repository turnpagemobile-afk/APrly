export const dashboardProfileContent = {
  pageTitle: "Profile",
  tabs: {
    profile: "Your Profile",
    password: "Password",
  },
  profileCard: {
    title: "Your Profile",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    save: "Save changes",
    delete: "Delete account",
  },
  passwordCard: {
    title: "Password",
    newPassword: "New password",
    verifyPassword: "Verify password",
    apply: "Apply a new password",
    hint: "Password must be 8–20 characters.",
  },
  logout: {
    title: "Log out",
    message: "Are you sure you want to log out?",
    confirm: "Log Out",
  },
  deleteAccount: {
    title: "Delete account",
    message:
      "Are you sure you want to delete your account? This action cannot be undone.",
    confirm: "Delete account",
    cancel: "Cancel",
  },
  toast: {
    profileSaved: {
      title: "Profile updated",
      description: "Your name has been saved.",
    },
    passwordSaved: {
      title: "Password updated",
      description: "Your new password is now active.",
    },
    profileError: {
      title: "Could not save profile",
      description: "Please try again.",
    },
    passwordError: {
      title: "Could not update password",
      description: "Check your input and try again.",
    },
    deleteError: {
      title: "Could not delete account",
      description: "Please try again.",
    },
  },
} as const;

export const accountMenuContent = {
  profile: "Profile",
  subscription: "Subscription",
  logOut: "Log out",
} as const;
