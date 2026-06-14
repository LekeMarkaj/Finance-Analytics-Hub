import { UserProfile } from "@clerk/react";
import { Settings } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Profile() {
  const { isDark } = useTheme();

  const colors = isDark
    ? {
        primary: "hsl(195, 100%, 52%)",
        background: "hsl(218, 44%, 8%)",
        foreground: "hsl(210, 20%, 95%)",
        mutedForeground: "hsl(207, 20%, 55%)",
        border: "hsl(196, 30%, 22%)",
        cardBg: "hsl(218, 44%, 11%)",
        inputBg: "hsl(218, 44%, 10%)",
        mutedBg: "hsl(218, 44%, 13%)",
      }
    : {
        primary: "hsl(195, 100%, 40%)",
        background: "hsl(210, 20%, 98%)",
        foreground: "hsl(218, 44%, 12%)",
        mutedForeground: "hsl(207, 28%, 48%)",
        border: "hsl(196, 60%, 80%)",
        cardBg: "hsl(0, 0%, 100%)",
        inputBg: "hsl(0, 0%, 100%)",
        mutedBg: "hsl(196, 60%, 94%)",
      };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, email address, and security settings.
        </p>
      </div>

      <UserProfile
        routing="path"
        path={`${basePath}/profile`}
        appearance={{
          variables: {
            colorPrimary: colors.primary,
            colorBackground: colors.cardBg,
            colorInputBackground: colors.inputBg,
            colorText: colors.foreground,
            colorTextSecondary: colors.mutedForeground,
            colorInputText: colors.foreground,
            colorNeutral: colors.border,
            colorDanger: "hsl(0, 84%, 60%)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            borderRadius: "0.25rem",
          },
          elements: {
            rootBox: "w-full",
            cardBox:
              "w-full shadow-none rounded-xl border border-border overflow-hidden bg-card",
            card: "!shadow-none !border-0 !rounded-none bg-card",
            navbar:
              "border-r border-border bg-muted/40 !shadow-none",
            navbarButton:
              "text-muted-foreground hover:text-foreground hover:bg-accent rounded-md font-medium",
            navbarButtonIcon: "opacity-70",
            pageScrollBox: "p-6 bg-card",
            headerTitle: "text-foreground font-bold text-xl",
            headerSubtitle: "text-muted-foreground text-sm",
            profileSectionTitle: "text-foreground font-semibold",
            profileSectionTitleText: "text-foreground font-semibold",
            profileSectionContent: "text-foreground",
            profileSectionPrimaryButton:
              "text-primary hover:text-primary/80 font-medium",
            formFieldLabel: "text-foreground font-medium text-sm",
            formFieldInput:
              "border border-border bg-background text-foreground rounded-md focus:ring-primary focus:border-primary",
            formFieldInputShowPasswordButton: "text-muted-foreground",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:opacity-90 rounded-md font-medium",
            formButtonReset:
              "text-muted-foreground hover:text-foreground border border-border rounded-md",
            badge:
              "bg-primary/10 text-primary border border-primary/20 rounded-md",
            breadcrumbsItem: "text-muted-foreground",
            breadcrumbsItemDivider: "text-muted-foreground",
            activeDevice:
              "border border-border rounded-lg bg-muted/30 p-3",
            avatarBox: "rounded-xl",
            avatarImageActionsUpload:
              "text-primary hover:text-primary/80 font-medium",
            userPreviewAvatarBox: "rounded-lg",
            alertText: "text-foreground",
            alert: "bg-muted border border-border rounded-md",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground text-xs",
            identityPreviewText: "text-foreground",
            identityPreviewEditButton:
              "text-primary hover:text-primary/80",
            accordionTriggerButton:
              "text-foreground hover:bg-accent rounded-md",
            socialButtonsBlockButton:
              "border border-border bg-background text-foreground hover:bg-muted rounded-md",
            otpCodeFieldInput: "border border-border rounded-md",
          },
        }}
      />
    </div>
  );
}
