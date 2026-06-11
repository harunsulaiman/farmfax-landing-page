"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { readApiError } from "@/lib/api-errors";
import styles from "@/styles/modules/farmer-dashboard.module.css";

interface ProfilePictureUploadProps {
  displayName: string;
  imageUrl: string | null;
  onUploaded: (url: string) => void;
}

export function ProfilePictureUpload({
  displayName,
  imageUrl,
  onUploaded,
}: ProfilePictureUploadProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, "Could not upload photo."));
      }
      const data = (await res.json()) as { url: string };
      onUploaded(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload photo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className={styles.profilePictureBlock}>
      <div className={styles.profilePicturePreview}>
        {imageUrl ? (
          imageUrl.startsWith("http") ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="96px"
              className={styles.profilePictureImg}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className={styles.profilePictureImgNative} />
          )
        ) : (
          <span className={styles.profilePictureInitial}>{initial}</span>
        )}
      </div>
      <div className={styles.profilePictureActions}>
        <button
          type="button"
          className={styles.btnGhost}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : imageUrl ? "Change photo" : "Add photo"}
        </button>
        <p className={styles.formHint}>JPEG, PNG or WebP · max 2MB</p>
        {error ? <p className={styles.flashError}>{error}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.srOnly}
        onChange={(e) => void handleChange(e)}
      />
    </div>
  );
}
