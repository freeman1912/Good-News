export type Region = "china" | "world";

export type TopicSlug =
  | "science-health"
  | "environment-animals"
  | "charity-mutual-aid"
  | "public-improvement"
  | "people-kindness"
  | "education-culture"
  | "other";

export type SourceLanguage = "zh" | "en" | "multi";

export type SourceRegionFocus = "china" | "world" | "mixed";

export type SourceType =
  | "rss"
  | "site"
  | "search"
  | "official"
  | "ngo"
  | "academic";

export type TrustLevel = "high" | "medium" | "watch";

export interface NewsSource {
  id: string;
  name: string;
  language: SourceLanguage;
  regionFocus: SourceRegionFocus;
  type: SourceType;
  url: string;
  rssUrl?: string;
  topics?: TopicSlug[];
  trustLevel: TrustLevel;
  officialRisk?: boolean;
  notes?: string;
}

export interface CandidateItem {
  id: string;
  sourceId: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceTrustLevel?: TrustLevel;
  officialRisk?: boolean;
  title: string;
  url: string;
  publishedAt?: string;
  fetchedAt: string;
  language: "zh" | "en" | "other";
  rawSummary?: string;
  rawContent?: string;
  dedupeKey: string;
}

export interface AiNewsScore {
  isGoodNews: boolean;
  goodnessScore: number;
  specificityScore: number;
  evidenceScore: number;
  publicValueScore: number;
  prRiskScore: number;
  doomContextScore: number;
  suggestedRegion: Region;
  suggestedTopic: TopicSlug;
  summaryZh: string;
  whyGoodZh: string;
  verificationNoteZh: string;
  rejectReason?: string;
}

export type CandidateRoute = "published" | "candidate" | "rejected";

export interface ScoredCandidateItem extends CandidateItem {
  aiScore?: AiNewsScore;
  route: CandidateRoute;
  routeReason: string;
  scoredAt: string;
}

export interface RejectedCandidateItem extends ScoredCandidateItem {
  route: "rejected";
}

export interface PublishedNewsItem {
  id: string;
  title: string;
  summary: string;
  region: Region;
  topic: TopicSlug;
  sourceName: string;
  sourceUrl: string;
  originalUrl: string;
  publishedAt?: string;
  collectedAt: string;
  whyGood: string;
  verificationNote: string;
  sourceCount: number;
  status: "published";
  isExample?: boolean;
}

export interface NewsDateGroup {
  date: string;
  label: string;
  items: PublishedNewsItem[];
}

export type CommunityLeadType =
  | "media-candidate"
  | "public-project"
  | "everyday-kindness"
  | "self-reported-kindness"
  | "person-organization-profile"
  | "other";

export type CommunityLeadSubmitterRole =
  | "self"
  | "witness"
  | "online-source"
  | "media-source"
  | "other";

export type CommunityLeadReviewStatus =
  | "submitted"
  | "needs-review"
  | "needs-evidence"
  | "basic-trust"
  | "verified"
  | "rejected";

export type Trackability =
  | "result-visible"
  | "follow-up-needed"
  | "not-trackable";

export type VerificationStatus =
  | "verified-result"
  | "multi-source"
  | "single-source"
  | "official-only"
  | "corporate-only"
  | "needs-follow-up"
  | "source-inaccessible"
  | "rejected";

export type ChineseReviewRoute = "publishable" | "follow-up" | "rejected";

export interface FollowUpTask {
  id: string;
  candidateTitle: string;
  originalUrl?: string;
  route: Exclude<ChineseReviewRoute, "publishable">;
  trackability: Trackability;
  verificationStatus: VerificationStatus;
  followUpAfter?: string;
  followUpQuestions: string[];
  reason: string;
  createdAt: string;
}

export interface CommunityLead {
  id: string;
  type: CommunityLeadType;
  title: string;
  happenedAt?: string;
  location?: string;
  actors?: string;
  action: string;
  beneficiaries?: string;
  result?: string;
  whyGood: string;
  submitterRole: CommunityLeadSubmitterRole;
  evidence?: string;
  privacyNote?: string;
  relationshipDisclosure?: string;
  publicName?: string;
  reviewStatus: CommunityLeadReviewStatus;
  trackability?: Trackability;
  verificationStatus?: VerificationStatus;
  followUpAfter?: string;
  followUpQuestions?: string[];
  submittedAt: string;
}
