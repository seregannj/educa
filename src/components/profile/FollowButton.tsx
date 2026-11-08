"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/providers/ToastProvider";
import { followHandleAction } from "@/app/actions/content";

export function FollowButton({ handle, initial }: { handle: string; initial: boolean }) {
  const [following, setFollowing] = useState(initial);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <button
      className={`btn${following ? " btn-ghost" : ""}`}
      disabled={pending}
      onClick={() => {
        const next = !following;
        setFollowing(next);
        startTransition(async () => {
          const result = await followHandleAction(handle);
          if (result.requiresAuth) {
            setFollowing(!next);
            toast("Войди, чтобы подписаться");
            return;
          }
          setFollowing(Boolean(result.following));
        });
      }}
    >
      <Icon name={following ? "check" : "plus"} size={16} />
      {following ? "Вы подписаны" : "Подписаться"}
    </button>
  );
}
