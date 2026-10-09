/**
 * Helper para compartilhar qualquer dado do app na OctoCommunity.
 * Uso:
 *   import { shareToCommunity } from "@/lib/share-to-community";
 *   await shareToCommunity({
 *     communityId: "octocookie",
 *     source: "cryptex",
 *     label: "Meu portfolio",
 *     payload: { assets: [...], totalUsd: 1234 },
 *     title: "Olha meu portfolio no Cryptex!",
 *     body: "Aprendendo a diversificar...",
 *     author: { uid, displayName, username, photoURL }
 *   });
 */
import { createPost } from "./social";
import type { Post } from "./social-types";

export type SharePayload = {
  communityId?: string;
  source: "cryptex" | "analyzer" | "simulator" | "ide" | "other";
  label: string;
  payload: Record<string, unknown>;
  title: string;
  body?: string;
  author: {
    uid: string;
    displayName: string;
    username: string;
    photoURL?: string;
  };
};

export async function shareToCommunity(input: SharePayload): Promise<Post> {
  return createPost({
    communityId: input.communityId || "octocookie",
    authorId: input.author.uid,
    authorName: input.author.displayName,
    authorUsername: input.author.username,
    authorPhoto: input.author.photoURL,
    title: input.title,
    body: input.body,
    type: "share_app_data",
    appData: {
      source: input.source,
      label: input.label,
      payload: input.payload,
    },
  });
}
