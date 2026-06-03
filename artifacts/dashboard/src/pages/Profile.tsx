import { UserProfile } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Profile() {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your profile, email, and password
        </p>
      </div>
      <div className="flex-1 flex justify-center px-6 py-8">
        <UserProfile
          routing="path"
          path={`${basePath}/profile`}
          appearance={{
            elements: {
              rootBox: "w-full max-w-3xl",
              card: "shadow-none border border-border rounded-xl bg-card",
              navbar: "border-r border-border",
              navbarMobileMenuButton: "text-foreground",
              headerTitle: "text-foreground font-semibold",
              headerSubtitle: "text-muted-foreground",
              profileSectionTitle: "text-foreground font-medium",
              profileSectionTitleText: "text-foreground font-medium",
              profileSectionContent: "text-foreground",
              formFieldLabel: "text-foreground font-medium",
              formFieldInput: "border border-border bg-background text-foreground",
              formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90",
              formButtonReset: "text-muted-foreground hover:text-foreground",
              badge: "bg-primary/10 text-primary",
              breadcrumbsItem: "text-muted-foreground",
              breadcrumbsItemDivider: "text-muted-foreground",
              pageScrollBox: "p-6",
            },
          }}
        />
      </div>
    </div>
  );
}
