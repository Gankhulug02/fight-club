export interface Team {
  id: number;
  name: string;
  logo: string;
  rounds_won: number;
  rounds_lost: number;
  matches_won: number;
  matches_lost: number;
}

export interface Match {
  id: number;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  status: string;
}

export interface MatchMap {
  id: number;
  match_id: number;
  map_number: number;
  team1_score: number;
  team2_score: number;
  status: string;
}

