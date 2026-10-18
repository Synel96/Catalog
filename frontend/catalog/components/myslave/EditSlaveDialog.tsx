import { useState } from "react";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ApiError, User } from "@/src/types/api";

type EditSlaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slave: User;
  onSave: (formData: FormData) => Promise<void>;
};

export function EditSlaveDialog({ open, onOpenChange, slave, onSave }: EditSlaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        {/* Radix unmounts the content while closed, so the form re-reads
            `slave` every time the dialog opens. */}
        <EditSlaveForm slave={slave} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
}

type SlaveFields = Pick<User, "username" | "email" | "first_name" | "last_name" | "bio">;

function EditSlaveForm({ slave, onSave }: Pick<EditSlaveDialogProps, "slave" | "onSave">) {
  const [fields, setFields] = useState<SlaveFields>({
    username: slave.username ?? "",
    email: slave.email ?? "",
    first_name: slave.first_name ?? "",
    last_name: slave.last_name ?? "",
    bio: slave.bio ?? "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value !== "") payload.append(key, value);
    }
    if (avatar) payload.append("avatar", avatar);

    try {
      await onSave(payload);
    } catch (err) {
      setError((err as ApiError).detail || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FormField label="Username" name="username" value={fields.username} onChange={handleChange} />
      <FormField
        label="Email"
        type="email"
        name="email"
        value={fields.email}
        onChange={handleChange}
      />
      <FormField
        label="First Name"
        name="first_name"
        value={fields.first_name}
        onChange={handleChange}
      />
      <FormField
        label="Last Name"
        name="last_name"
        value={fields.last_name}
        onChange={handleChange}
      />
      <FormField label="Bio" name="bio" value={fields.bio} onChange={handleChange} />
      <FormField
        label="Avatar"
        type="file"
        name="avatar"
        accept="image/*"
        onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
      />

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
