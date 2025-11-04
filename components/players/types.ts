export interface Player {
  id: number;
  name: string;
  team_id: number;
  role: string;
  avatar: string;
  created_at?: string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface PlayerStats {
  player: Player;
  team: Team | null;
  kills: number;
  assists: number;
  deaths: number;
  kd_ratio: number;
  maps_played: number;
}

