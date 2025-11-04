export interface Team {
  id: number;
  name: string;
  logo: string;
  created_at?: string;
  updated_at?: string;
}

export interface Player {
  id: number;
  name: string;
  team_id: number;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MapPlayerStats {
  id?: number;
  map_id: number;
  player_id: number;
  team_id: number;
  kills: number;
  assists: number;
  deaths: number;
  player?: Player;
}

export interface MatchMap {
  id: number;
  match_id: number;
  map_number: number;
  team1_score: number;
  team2_score: number;
  winner_team_id: number | null;
  map_name?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
  player_stats?: MapPlayerStats[];
}

export interface Match {
  id: number;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  match_date: string;
  num_maps: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

export interface MatchWithTeams extends Match {
  team1?: Team;
  team2?: Team;
  maps?: MatchMap[];
}

export interface MatchFormData {
  team1_id: string;
  team2_id: string;
  team1_score: string;
  team2_score: string;
  match_date: string;
  status: string;
}

export interface BulkMatchFormData {
  team1_id: string;
  team2_id: string;
  match_date: string;
  status: string;
  number_of_matches: number;
  maps_per_match: number;
}

