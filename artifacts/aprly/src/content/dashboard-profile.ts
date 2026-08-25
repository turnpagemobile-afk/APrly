export const dashboardProfileContent = {
  pageTitle: "Account",
  accessCard: {
    getFullAccess: "Get full access",
    activate: "Activate APrly",
    activeTitle: "Your account is active",
    activeDescriptionFrom: "Your full access is activated from {date}.",
    activeDescriptionFallback: "Your full access is active.",
  },
  loginEmail: {
    title: "Login email",
    emailLabel: "Email",
  },
  personalInfo: {
    title: "Personal info",
    firstName: "First name",
    lastName: "Last name",
    save: "Save changes",
    successMessage: "Your personal info has been successfully changed.",
  },
  password: {
    title: "Account password",
    oldPassword: "Old password",
    newPassword: "New password",
    confirmPassword: "Confirm a new password",
    apply: "Change password",
    errorBanner: "Please check the passwords you entered.",
    successMessage: "Your account password has been successfully changed.",
    passwordLength: "Password must be 8–20 characters.",
    passwordsMustMatch: "Passwords must match.",
    currentPasswordIncorrect: "Current password is incorrect.",
  },
  actions: {
    logOut: "Log out",
  },
  fieldRequired: "This field is required",
  ok: "OK",
  logout: {
    title: "Log out",
    message: "Are you sure you want to log out?",
    confirm: "Confirm & log out",
  },
  deleteAccount: {
    title: "Delete account",
    message:
      "Are you sure you want to delete your account? This action cannot be undone.",
    button: "Delete account",
    confirm: "Confirm & delete account",
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
