export interface Team {
  id: number;
  name: string;
  logo: string;
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: number;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  match_date: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

export interface MatchWithTeams extends Match {
  team1?: Team;
  team2?: Team;
}

export interface MatchMap {
  id: number;
  match_id: number;
  map_number: number;
  team1_score: number;
  team2_score: number;
  winner_team_id: number | null;
  map_name: string | null;
  status: "scheduled" | "live" | "completed" | "cancelled";
}

export interface Player {
  id: number;
  name: string;
  avatar: string;
}

export interface MapPlayerStats {
  id: number;
  map_id: number;
  player_id: number;
  team_id: number;
  kills: number;
  assists: number;
  deaths: number;
  player?: Player;
}

