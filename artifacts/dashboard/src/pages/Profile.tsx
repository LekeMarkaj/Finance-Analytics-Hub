import { useState, useRef } from "react";
import { useUser } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Settings, Camera, Loader2, User, Mail, Lock, Check,
} from "lucide-react";

function Avatar() {
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join("") || user?.username?.[0]?.toUpperCase() || "?";

  const hasPhoto = !!user?.hasImage && !user.imageUrl?.includes("gravatar");

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image file.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      await user?.setProfileImage({ file });
      toast({ title: "Photo updated" });
    } catch {
      toast({ title: "Upload failed", description: "Could not update your photo.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
          {hasPhoto ? (
            <img src={user!.imageUrl} alt="Profile" className="w-full h-full object-cover filter grayscale" />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground select-none">
              {initials}
            </span>
          )}
        </div>
        <button
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            : <Camera className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <div>
        <p className="font-semibold text-foreground">
          {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "—"}
        </p>
        <p className="text-sm text-muted-foreground">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
        <button
          className="text-xs text-primary hover:underline mt-0.5"
          onClick={() => fileRef.current?.click()}
        >
          Change photo
        </button>
      </div>
    </div>
  );
}

function NameSection() {
  const { user } = useUser();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await user?.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: "Name updated" });
    } catch {
      toast({ title: "Failed to update name", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const dirty = firstName !== (user?.firstName ?? "") || lastName !== (user?.lastName ?? "");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          Name
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={save} disabled={saving || !dirty} className="gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
            {saved ? "Saved" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmailSection() {
  const { user } = useUser();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [saving, setSaving] = useState(false);
  const pendingEmailRef = useRef<Awaited<ReturnType<NonNullable<typeof user>["createEmailAddress"]>> | null>(null);

  const currentEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  async function sendCode() {
    if (!newEmail.trim() || newEmail === currentEmail) return;
    setSaving(true);
    try {
      const ea = await user!.createEmailAddress({ email: newEmail.trim() });
      await ea.prepareVerification({ strategy: "email_code" });
      pendingEmailRef.current = ea;
      setStep("verify");
      toast({ title: "Verification code sent", description: `Check ${newEmail} for the code.` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not send verification code.";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function verify() {
    if (!code.trim() || !pendingEmailRef.current) return;
    setSaving(true);
    try {
      await pendingEmailRef.current.attemptVerification({ code: code.trim() });
      await user?.update({ primaryEmailAddressId: pendingEmailRef.current.id });
      toast({ title: "Email updated successfully" });
      setEditing(false);
      setStep("input");
      setNewEmail("");
      setCode("");
      pendingEmailRef.current = null;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Incorrect code. Please try again.";
      toast({ title: "Verification failed", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setEditing(false);
    setStep("input");
    setNewEmail("");
    setCode("");
    pendingEmailRef.current = null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          Email address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground font-medium">{currentEmail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Primary email address</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Change
            </Button>
          </div>
        ) : step === "input" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="newEmail">New email address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={cancel}>Cancel</Button>
              <Button size="sm" onClick={sendCode} disabled={saving || !newEmail.trim() || newEmail === currentEmail} className="gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Send verification code
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A verification code was sent to <span className="font-medium text-foreground">{newEmail}</span>.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && verify()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={cancel}>Cancel</Button>
              <Button size="sm" onClick={verify} disabled={saving || !code.trim()} className="gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Verify & update
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const { user } = useUser();
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (next !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (next.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await user?.updatePassword({ currentPassword: current, newPassword: next });
      setCurrent(""); setNext(""); setConfirm("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: "Password updated" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not update password.";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const ready = current && next && confirm;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label htmlFor="newPass">New password</Label>
            <Input
              id="newPass"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
              onKeyDown={(e) => e.key === "Enter" && ready && save()}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={save} disabled={saving || !ready} className="gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
            {saved ? "Updated" : "Update password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, email address, and password.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Avatar />
        </CardContent>
      </Card>

      <NameSection />
      <EmailSection />
      <PasswordSection />
    </div>
  );
}
