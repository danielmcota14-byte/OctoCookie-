/** Tipos da rede social OctoCommunity (estilo Reddit + Web3) */

export type UserProfile = {
  uid: string;
  displayName: string;
  username: string; // único, lowercase
  photoURL?: string;
  bio?: string;
  karma: number;
  createdAt: number;
  walletAddress?: string; // opcional Web3
  badges?: string[];
};

export type Community = {
  id: string; // slug, ex: "bitcoin", "defi", "octocookie"
  name: string;
  description: string;
  icon?: string;
  banner?: string;
  memberCount: number;
  createdAt: number;
  createdBy: string;
  rules?: string[];
  isNSFW?: boolean;
  topics?: string[]; // tags web3
};

export type PostType = "text" | "link" | "image" | "share_app_data";

export type Post = {
  id: string;
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
  /** Dados compartilhados do app (portfolio, análise, etc.) */
  appData?: {
    source: "cryptex" | "analyzer" | "simulator" | "ide" | "other";
    label: string;
    payload: Record<string, unknown>;
  };
  score: number; // upvotes - downvotes
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  createdAt: number;
  updatedAt?: number;
  flair?: string;
  isPinned?: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhoto?: string;
  body: string;
  parentId?: string | null; // para threads de respostas
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: number;
  depth: number;
};

export type Vote = {
  id: string; // `${userId}_${targetId}`
  userId: string;
  targetId: string; // postId ou commentId
  targetType: "post" | "comment";
  value: 1 | -1;
  createdAt: number;
};

export type Membership = {
  id: string; // `${userId}_${communityId}`
  userId: string;
  communityId: string;
  joinedAt: number;
  role: "member" | "mod" | "admin";
};
