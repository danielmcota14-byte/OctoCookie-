import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserProfile,
  Community,
  Post,
  Comment,
  Vote,
  Membership,
  PostType,
} from "./social-types";

// ─── Helpers ───────────────────────────────────────────────
function now() {
  return Date.now();
}

function toMillis(v: unknown): number {
  if (typeof v === "number") return v;
  if (v instanceof Timestamp) return v.toMillis();
  return Date.now();
}

/** Firestore rejects `undefined` field values. Strip them before setDoc/updateDoc. */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

// ─── Users ─────────────────────────────────────────────────
export async function getOrCreateUserProfile(
  uid: string,
  data: { displayName?: string | null; email?: string | null; photoURL?: string | null }
): Promise<UserProfile> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  const username =
    (data.displayName || data.email?.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) +
    "_" +
    uid.slice(0, 4);

  // photoURL: só inclui se for string (Firestore rejeita undefined)
  const profile = stripUndefined({
    uid,
    displayName: data.displayName || "Octonauta",
    username,
    photoURL: data.photoURL || undefined,
    bio: "",
    karma: 0,
    createdAt: now(),
    badges: ["early"],
  }) as UserProfile;
  await setDoc(ref, profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, partial: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), stripUndefined(partial as Record<string, unknown>));
}

// ─── Communities ───────────────────────────────────────────
export async function createCommunity(
  data: Omit<Community, "id" | "memberCount" | "createdAt"> & { id: string }
): Promise<Community> {
  const community: Community = stripUndefined({
    ...data,
    memberCount: 1,
    createdAt: now(),
  }) as Community;
  await setDoc(doc(db, "communities", data.id), community);
  // auto-join creator as admin
  await setDoc(doc(db, "memberships", `${data.createdBy}_${data.id}`), {
    id: `${data.createdBy}_${data.id}`,
    userId: data.createdBy,
    communityId: data.id,
    joinedAt: now(),
    role: "admin",
  } satisfies Membership);
  return community;
}

export async function getCommunity(id: string): Promise<Community | null> {
  const snap = await getDoc(doc(db, "communities", id));
  return snap.exists() ? (snap.data() as Community) : null;
}

export async function listCommunities(max = 30): Promise<Community[]> {
  const q = query(collection(db, "communities"), orderBy("memberCount", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Community);
}

export async function joinCommunity(userId: string, communityId: string) {
  const mid = `${userId}_${communityId}`;
  const ref = doc(db, "memberships", mid);
  const exists = await getDoc(ref);
  if (exists.exists()) return;
  await setDoc(ref, {
    id: mid,
    userId,
    communityId,
    joinedAt: now(),
    role: "member",
  } satisfies Membership);
  await updateDoc(doc(db, "communities", communityId), {
    memberCount: increment(1),
  });
}

export async function leaveCommunity(userId: string, communityId: string) {
  const mid = `${userId}_${communityId}`;
  await deleteDoc(doc(db, "memberships", mid));
  await updateDoc(doc(db, "communities", communityId), {
    memberCount: increment(-1),
  });
}

export async function isMember(userId: string, communityId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "memberships", `${userId}_${communityId}`));
  return snap.exists();
}

// ─── Posts ─────────────────────────────────────────────────
export async function createPost(input: {
  communityId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhoto?: string;
  title: string;
  body?: string;
  type: PostType;
  linkUrl?: string;
  imageUrl?: string;
  appData?: Post["appData"];
  flair?: string;
}): Promise<Post> {
  const ref = doc(collection(db, "posts"));
  const post: Post = stripUndefined({
    id: ref.id,
    communityId: input.communityId,
    authorId: input.authorId,
    authorName: input.authorName,
    authorUsername: input.authorUsername,
    authorPhoto: input.authorPhoto,
    title: input.title,
    body: input.body,
    type: input.type,
    linkUrl: input.linkUrl,
    imageUrl: input.imageUrl,
    appData: input.appData,
    score: 0,
    upvoteCount: 0,
    downvoteCount: 0,
    commentCount: 0,
    createdAt: now(),
    flair: input.flair,
  }) as Post;
  await setDoc(ref, post);
  return post;
}

export async function getPost(id: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, "posts", id));
  return snap.exists() ? (snap.data() as Post) : null;
}

export async function listPosts(opts: {
  communityId?: string;
  sort?: "hot" | "new" | "top";
  max?: number;
  after?: QueryDocumentSnapshot<DocumentData>;
}): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  const max = opts.max ?? 25;
  let q;
  if (opts.communityId) {
    if (opts.sort === "new") {
      q = query(
        collection(db, "posts"),
        where("communityId", "==", opts.communityId),
        orderBy("createdAt", "desc"),
        limit(max)
      );
    } else {
      // hot / top → por score
      q = query(
        collection(db, "posts"),
        where("communityId", "==", opts.communityId),
        orderBy("score", "desc"),
        limit(max)
      );
    }
  } else {
    if (opts.sort === "new") {
      q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(max));
    } else {
      q = query(collection(db, "posts"), orderBy("score", "desc"), limit(max));
    }
  }
  if (opts.after) {
    q = query(q, startAfter(opts.after));
  }
  const snap = await getDocs(q);
  return {
    posts: snap.docs.map((d) => d.data() as Post),
    lastDoc: snap.docs.length ? snap.docs[snap.docs.length - 1] : null,
  };
}

// ─── Votes ─────────────────────────────────────────────────
export async function vote(
  userId: string,
  targetId: string,
  targetType: "post" | "comment",
  value: 1 | -1
) {
  const voteId = `${userId}_${targetId}`;
  const voteRef = doc(db, "votes", voteId);
  const existing = await getDoc(voteRef);
  const collectionName = targetType === "post" ? "posts" : "comments";
  const targetRef = doc(db, collectionName, targetId);

  if (existing.exists()) {
    const prev = existing.data() as Vote;
    if (prev.value === value) {
      // remove vote
      await deleteDoc(voteRef);
      await updateDoc(targetRef, {
        score: increment(-value),
        ...(value === 1 ? { upvoteCount: increment(-1) } : { downvoteCount: increment(-1) }),
      });
      return;
    }
    // change vote
    await updateDoc(voteRef, { value, createdAt: now() });
    await updateDoc(targetRef, {
      score: increment(value * 2), // remove old + apply new
      ...(value === 1
        ? { upvoteCount: increment(1), downvoteCount: increment(-1) }
        : { upvoteCount: increment(-1), downvoteCount: increment(1) }),
    });
    return;
  }

  // new vote
  await setDoc(voteRef, {
    id: voteId,
    userId,
    targetId,
    targetType,
    value,
    createdAt: now(),
  } satisfies Vote);
  await updateDoc(targetRef, {
    score: increment(value),
    ...(value === 1 ? { upvoteCount: increment(1) } : { downvoteCount: increment(1) }),
  });
}

export async function getUserVote(
  userId: string,
  targetId: string
): Promise<1 | -1 | 0> {
  const snap = await getDoc(doc(db, "votes", `${userId}_${targetId}`));
  if (!snap.exists()) return 0;
  return (snap.data() as Vote).value;
}

// ─── Comments ──────────────────────────────────────────────
export async function createComment(input: {
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhoto?: string;
  body: string;
  parentId?: string | null;
  depth?: number;
}): Promise<Comment> {
  const ref = doc(collection(db, "comments"));
  const comment: Comment = stripUndefined({
    id: ref.id,
    postId: input.postId,
    authorId: input.authorId,
    authorName: input.authorName,
    authorUsername: input.authorUsername,
    authorPhoto: input.authorPhoto,
    body: input.body,
    parentId: input.parentId ?? null,
    score: 0,
    upvoteCount: 0,
    downvoteCount: 0,
    createdAt: now(),
    depth: input.depth ?? 0,
  }) as Comment;
  await setDoc(ref, comment);
  await updateDoc(doc(db, "posts", input.postId), {
    commentCount: increment(1),
  });
  return comment;
}

export async function listComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Comment);
}

// ─── Seed communities padrão (chamar uma vez) ──────────────
export const DEFAULT_COMMUNITIES: Omit<Community, "memberCount" | "createdAt" | "createdBy">[] = [
  {
    id: "octocookie",
    name: "OctoCookie",
    description: "Comunidade oficial do OctoCookie. Anúncios, feedback e compartilhamento de dados do app.",
    topics: ["octocookie", "app", "web3"],
    rules: ["Seja respeitoso", "Sem spam", "Compartilhe dados do app com o botão Share"],
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    description: "Tudo sobre Bitcoin, BTC, Lightning e o padrão ouro digital.",
    topics: ["btc", "bitcoin", "macro"],
  },
  {
    id: "ethereum",
    name: "Ethereum",
    description: "ETH, L2s, smart contracts, DeFi e NFTs no ecossistema Ethereum.",
    topics: ["eth", "defi", "l2"],
  },
  {
    id: "defi",
    name: "DeFi",
    description: "Finanças descentralizadas: yield, lending, DEXs, airdrops e estratégias.",
    topics: ["defi", "yield", "dex"],
  },
  {
    id: "solana",
    name: "Solana",
    description: "Solana, memecoins, velocidade e o ecossistema SOL.",
    topics: ["sol", "memecoins"],
  },
  {
    id: "web3",
    name: "Web3",
    description: "Discussões gerais sobre Web3, wallets, identidade e o futuro da internet.",
    topics: ["web3", "wallets", "identity"],
  },
  {
    id: "trading",
    name: "Trading",
    description: "Análises técnicas, setup, risco e discussões de mercado (não é conselho financeiro).",
    topics: ["trading", "ta", "mercado"],
  },
  {
    id: "news",
    name: "Crypto News",
    description: "Notícias, regulamentação e acontecimentos do mundo cripto.",
    topics: ["news", "regulação"],
  },
];
