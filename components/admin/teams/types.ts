export interface Team {
  id: number;
  name: string;
  logo: string;
  rounds_won: number;
  rounds_lost: number;
  matches_won: number;
  matches_lost: number;
  created_at?: string;
}

export interface TeamFormData {
  name: string;
  logo: string | File;
}

export interface TeamStats {
  matchRecord: string;
  roundDiff: number;
  totalMatches: number;
  matchWinRate: string;
}

