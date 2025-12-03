export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string; // URL to an avatar image
  avatarFallback: string;
  sScore: number;
  refScore: number;
  ptsScore: number;
  multiplier: number;
  totalScore: number;
  isUser?: boolean; // We'll just ignore this now
}

export const leaderboardData: LeaderboardEntry[] = [
  // {
  //   rank: 88932,
  //   username: "0x1C22...3CEE",
  //   avatar: "https://i.imgur.com/gBqR1hB.png",
  //   avatarFallback: "0x",
  //   sScore: 0,
  //   refScore: 0,
  //   ptsScore: 925,
  //   multiplier: 1,
  //   totalScore: 925,
  //   isUser: true, // This row is now removed
  // },
  {
    rank: 1,
    username: "Ari_Defi",
    avatar: "https://i.imgur.com/example.png", // Replace with actual URLs
    avatarFallback: "AD",
    sScore: 71102100,
    refScore: 2347452,
    ptsScore: 17406882,
    multiplier: 2,
    totalScore: 181718888,
  },
  {
    rank: 2,
    username: "0xcuio45632yyv...",
    avatar: "https://i.imgur.com/gBqR1hB.png",
    avatarFallback: "0x",
    sScore: 51070100,
    refScore: 0,
    ptsScore: 4437,
    multiplier: 3,
    totalScore: 153223611,
  },
  {
    rank: 3,
    username: "Novus",
    avatar: "https://i.imgur.com/example.png",
    avatarFallback: "N",
    sScore: 3097700,
    refScore: 0,
    ptsScore: 44538530,
    multiplier: 3,
    totalScore: 143737890,
  },
  {
    rank: 4,
    username: "jepri",
    avatar: "https://i.imgur.com/example.png",
    avatarFallback: "J",
    sScore: 54000600,
    refScore: 0,
    ptsScore: 506156,
    multiplier: 2,
    totalScore: 108013512,
  },
  {
    rank: 5,
    username: "0xe7D4...De04",
    avatar: "https://i.imgur.com/gBqR1hB.png",
    avatarFallback: "0x",
    sScore: 25126000,
    refScore: 0,
    ptsScore: 9039368,
    multiplier: 3,
    totalScore: 102496104,
  },
  {
    rank: 6,
    username: "Bugo",
    avatar: "https://i.imgur.com/example.png",
    avatarFallback: "B",
    sScore: 7384700,
    refScore: 32851854,
    ptsScore: 104646,
    multiplier: 2,
    totalScore: 80682400,
  },
  {
    rank: 7,
    username: "THECATBURGLAR",
    avatar: "https://i.imgur.com/example.png",
    avatarFallback: "TC",
    sScore: 21669900,
    refScore: 318688,
    ptsScore: 92771,
    multiplier: 3,
    totalScore: 68244077,
  },
];
