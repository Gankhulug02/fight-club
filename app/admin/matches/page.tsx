"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import StatsOverview from "@/components/admin/matches/StatsOverview";
import StatusFilter from "@/components/admin/matches/StatusFilter";
import MatchesTable from "@/components/admin/matches/MatchesTable";
import ScheduleMatchForm from "@/components/admin/matches/ScheduleMatchForm";
import EditMatchForm from "@/components/admin/matches/EditMatchForm";
import {
  Team,
  Player,
  MatchMap,
  MapPlayerStats,
  MatchWithTeams,
  MatchFormData,
  BulkMatchFormData,
} from "@/components/admin/matches/types";

type MapDraft = Omit<MatchMap, "id"> & { id?: number };

interface LoadedData {
  teams: Team[];
  players: Player[];
  matches: MatchWithTeams[];
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchWithTeams | null>(null);

  const [formData, setFormData] = useState<MatchFormData>({
    team1_id: "",
    team2_id: "",
    team1_score: "0",
    team2_score: "0",
    match_date: "",
    status: "scheduled",
  });

  const [bulkFormData, setBulkFormData] = useState<BulkMatchFormData>({
    team1_id: "",
    team2_id: "",
    match_date: "",
    status: "scheduled",
    number_of_matches: 1,
    maps_per_match: 2,
  });

  const [editingMaps, setEditingMaps] = useState<MapDraft[]>([]);

  // ---------- Utilities ----------
  const parseId = useCallback(
    (v: string) => (v ? parseInt(v, 10) : undefined),
    []
  );

  const getTeamPlayers = useCallback(
    (teamId?: number) =>
      teamId ? players.filter((p) => p.team_id === teamId) : [],
    [players]
  );

  const ensurePlayerStatsForTeams = useCallback(
    (map: MapDraft, t1Id?: number, t2Id?: number): MapPlayerStats[] => {
      const existing = map.player_stats ?? [];
      const t1Players = getTeamPlayers(t1Id);
      const t2Players = getTeamPlayers(t2Id);

      const upsertFor = (pl: Player, teamId: number) => {
        const found = existing.find((s) => s.player_id === pl.id);
        return (
          found ?? {
            map_id: map.id!,
            player_id: pl.id,
            team_id: teamId,
            kills: 0,
            assists: 0,
            deaths: 0,
            player: pl,
          }
        );
      };

      return [
        ...t1Players.map((p) => upsertFor(p, t1Id!)),
        ...t2Players.map((p) => upsertFor(p, t2Id!)),
      ];
    },
    [getTeamPlayers]
  );

  // ---------- Data Loading (Consolidated) ----------
  const loadAllData = useCallback(async (): Promise<LoadedData> => {
    const [
      { data: teamsData, error: teamsError },
      { data: playersData, error: playersError },
      { data: matchesData, error: matchesError },
      { data: mapsData, error: mapsError },
      { data: playerStatsData, error: playerStatsError },
    ] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("players").select("*").order("name"),
      supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false }),
      supabase.from("match_maps").select("*").order("map_number"),
      supabase.from("map_player_stats").select("*"),
    ]);

    if (teamsError) throw teamsError;
    if (playersError) throw playersError;
    if (matchesError) throw matchesError;
    if (mapsError) throw mapsError;
    if (playerStatsError) throw playerStatsError;

    const playersById = new Map((playersData ?? []).map((p) => [p.id, p]));
    const teamsById = new Map((teamsData ?? []).map((t) => [t.id, t]));

    const mapsWithStats = (mapsData ?? []).map((map) => ({
      ...map,
      player_stats: (playerStatsData ?? [])
        .filter((s) => s.map_id === map.id)
        .map((s) => ({ ...s, player: playersById.get(s.player_id) })),
    }));

    const matchesWithTeams: MatchWithTeams[] = (matchesData ?? []).map((m) => ({
      ...m,
      team1: teamsById.get(m.team1_id),
      team2: teamsById.get(m.team2_id),
      maps: mapsWithStats.filter((map) => map.match_id === m.id),
    }));

    return {
      teams: teamsData ?? [],
      players: playersData ?? [],
      matches: matchesWithTeams,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadAllData();
        if (!cancelled) {
          setTeams(data.teams);
          setPlayers(data.players);
          setMatches(data.matches);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load data:", e);
          setError("Failed to load data. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadAllData]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadAllData();
      setTeams(data.teams);
      setPlayers(data.players);
      setMatches(data.matches);
      setError(null);
    } catch (e) {
      console.error("Failed to refresh data:", e);
      setError("Failed to refresh data.");
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  // ---------- Helper: Filter and prepare stats for save ----------
  const filterStatsForSave = useCallback(
    (stats: MapPlayerStats[]): MapPlayerStats[] => {
      return stats.filter((stat) => {
        const teamPlayerCount = getTeamPlayers(stat.team_id).length;
        const hasZeroStats =
          stat.kills === 0 && stat.assists === 0 && stat.deaths === 0;
        // Skip 0/0/0 stats if team has more than 5 players
        return !(teamPlayerCount > 5 && hasZeroStats);
      });
    },
    [getTeamPlayers]
  );

  // ---------- Helper: Upsert player stats (batch) ----------
  const upsertPlayerStats = useCallback(
    async (mapId: number, stats: MapPlayerStats[]) => {
      const filteredStats = filterStatsForSave(stats);
      if (filteredStats.length === 0) return;

      const statsToUpdate = filteredStats.filter((s) => s.id);
      const statsToInsert = filteredStats.filter((s) => !s.id);

      // Batch update existing stats
      if (statsToUpdate.length > 0) {
        // Use Promise.all for parallel updates
        const updatePromises = statsToUpdate.map((stat) =>
          supabase
            .from("map_player_stats")
            .update({
              kills: stat.kills,
              assists: stat.assists,
              deaths: stat.deaths,
            })
            .eq("id", stat.id)
        );

        const updateResults = await Promise.all(updatePromises);
        const updateErrors = updateResults
          .map((r, i) => (r.error ? { index: i, error: r.error } : null))
          .filter(Boolean);

        if (updateErrors.length > 0) {
          throw new Error(
            `Failed to update ${updateErrors.length} player stat(s)`
          );
        }
      }

      // Batch insert new stats
      if (statsToInsert.length > 0) {
        const insertRows = statsToInsert.map((s) => ({
          map_id: mapId,
          player_id: s.player_id,
          team_id: s.team_id,
          kills: s.kills,
          assists: s.assists,
          deaths: s.deaths,
        }));

        const { error: insertError } = await supabase
          .from("map_player_stats")
          .insert(insertRows);

        if (insertError) throw insertError;
      }
    },
    [filterStatsForSave]
  );

  // ---------- Bulk add ----------
  const handleAddBulkMatches = useCallback(async () => {
    const t1 = parseId(bulkFormData.team1_id);
    const t2 = parseId(bulkFormData.team2_id);

    if (!t1 || !t2) {
      setError("Please select both teams");
      return;
    }
    if (t1 === t2) {
      setError("Teams must be different");
      return;
    }
    if (!bulkFormData.match_date) {
      setError("Please select a match date");
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      const matchesToInsert = Array.from(
        { length: bulkFormData.number_of_matches },
        () => ({
          team1_id: t1,
          team2_id: t2,
          team1_score: 0,
          team2_score: 0,
          match_date: bulkFormData.match_date,
          num_maps: bulkFormData.maps_per_match,
          status: "completed",
        })
      );

      const { data: createdMatches, error: matchError } = await supabase
        .from("matches")
        .insert(matchesToInsert)
        .select();

      if (matchError) throw matchError;

      const mapsToInsert = (createdMatches ?? []).flatMap((m) =>
        Array.from({ length: bulkFormData.maps_per_match }, (_, i) => ({
          match_id: m.id,
          map_number: i + 1,
          team1_score: 0,
          team2_score: 0,
          winner_team_id: null,
          status: "completed",
        }))
      );

      const { error: mapsError } = await supabase
        .from("match_maps")
        .insert(mapsToInsert);

      if (mapsError) throw mapsError;

      setBulkFormData({
        team1_id: "",
        team2_id: "",
        match_date: "",
        status: "completed",
        number_of_matches: 1,
        maps_per_match: 3,
      });
      setShowAddForm(false);
      await refetch();
      setError(null);
    } catch (e) {
      console.error("Failed to add matches:", e);
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Failed to add matches. Please try again.";
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [bulkFormData, parseId, refetch]);

  // ---------- Update match (FIXED: Now properly upserts player stats) ----------
  const handleUpdateMatch = useCallback(async () => {
    if (!editingMatch) return;

    const t1 = parseId(formData.team1_id);
    const t2 = parseId(formData.team2_id);

    if (!t1 || !t2) {
      setError("Please select both teams");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // 1) Update match shell
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          team1_id: t1,
          team2_id: t2,
          match_date: formData.match_date,
          num_maps: editingMaps.length,
          status: formData.status,
        })
        .eq("id", editingMatch.id);

      if (matchError) throw matchError;

      // Split maps into existing vs new
      const existingMaps = editingMaps.filter((m) => !!m.id) as MatchMap[];
      const newMaps = editingMaps.filter((m) => !m.id);

      // 2) Update existing maps (batch)
      const mapUpdatePromises = existingMaps.map((map) => {
        const winnerId =
          map.team1_score > map.team2_score
            ? t1
            : map.team2_score > map.team1_score
            ? t2
            : null;

        return supabase
          .from("match_maps")
          .update({
            team1_score: map.team1_score,
            team2_score: map.team2_score,
            winner_team_id: winnerId,
            map_name: map.map_name || null,
            status: formData.status,
            map_number: map.map_number,
          })
          .eq("id", map.id);
      });

      const mapUpdateResults = await Promise.all(mapUpdatePromises);
      const mapUpdateErrors = mapUpdateResults
        .map((r, i) => (r.error ? { index: i, error: r.error } : null))
        .filter(Boolean);

      if (mapUpdateErrors.length > 0) {
        throw new Error(`Failed to update ${mapUpdateErrors.length} map(s)`);
      }

      // 3) Upsert player stats for existing maps
      const statsPromises = existingMaps.map((map) => {
        if (!map.player_stats?.length) return Promise.resolve();
        return upsertPlayerStats(map.id, map.player_stats);
      });

      await Promise.all(statsPromises);

      // 4) Insert new maps
      if (newMaps.length > 0) {
        const insertPayload = newMaps.map((m, idx) => {
          const map_number = m.map_number ?? existingMaps.length + idx + 1;
          const winner_team_id =
            m.team1_score > m.team2_score
              ? t1
              : m.team2_score > m.team1_score
              ? t2
              : null;
          return {
            match_id: editingMatch.id,
            map_number,
            map_name: m.map_name || null,
            team1_score: m.team1_score,
            team2_score: m.team2_score,
            winner_team_id,
            status: formData.status,
          };
        });

        const { data: insertedMaps, error: insertErr } = await supabase
          .from("match_maps")
          .insert(insertPayload)
          .select();

        if (insertErr) throw insertErr;

        // Insert stats for newly created maps
        const newStatsPromises = newMaps.map((draft, i) => {
          const created = insertedMaps?.[i];
          if (!created || !draft.player_stats?.length) return Promise.resolve();
          return upsertPlayerStats(created.id, draft.player_stats);
        });

        await Promise.all(newStatsPromises);
      }

      // 5) Reset UI
      setEditingMatch(null);
      setEditingMaps([]);
      setFormData({
        team1_id: "",
        team2_id: "",
        team1_score: "0",
        team2_score: "0",
        match_date: "",
        status: "completed",
      });
      setShowAddForm(false);

      await refetch();
      setError(null);
    } catch (e) {
      console.error("Failed to update match:", e);
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Failed to update match. Please try again.";
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [
    editingMatch,
    formData,
    editingMaps,
    parseId,
    upsertPlayerStats,
    refetch,
  ]);

  // ---------- Delete match ----------
  const handleDeleteMatch = useCallback(
    async (matchId: number) => {
      if (!confirm("Are you sure you want to delete this match?")) return;

      try {
        setError(null);
        const { error } = await supabase
          .from("matches")
          .delete()
          .eq("id", matchId);

        if (error) throw error;
        await refetch();
      } catch (e) {
        console.error("Failed to delete match:", e);
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Failed to delete match. Please try again.";
        setError(errorMessage);
      }
    },
    [refetch]
  );

  // ---------- Add map to match ----------
  const handleAddMapToMatch = useCallback(() => {
    const t1 = parseId(formData.team1_id);
    const t2 = parseId(formData.team2_id);

    if (!t1 || !t2) {
      setError("Please select both teams before adding maps.");
      return;
    }

    const nextMapNumber = (editingMaps?.length ?? 0) + 1;

    const draft: MapDraft = {
      match_id: editingMatch?.id ?? 0,
      map_number: nextMapNumber,
      map_name: "",
      team1_score: 0,
      team2_score: 0,
      winner_team_id: null,
      status: "completed",
      player_stats: [],
    };

    const stats = ensurePlayerStatsForTeams(draft, t1, t2).map((s) => ({
      ...s,
      map_id: undefined as unknown as number,
    }));

    setEditingMaps((cur) => [...cur, { ...draft, player_stats: stats }]);
  }, [formData, editingMatch, editingMaps, parseId, ensurePlayerStatsForTeams]);

  // ---------- Start editing match ----------
  const startEditMatch = useCallback(
    (match: MatchWithTeams) => {
      setEditingMatch(match);
      setFormData({
        team1_id: String(match.team1_id),
        team2_id: String(match.team2_id),
        team1_score: String(match.team1_score),
        team2_score: String(match.team2_score),
        match_date: match.match_date,
        status: match.status,
      });

      const mapsWithStats: MapDraft[] = (match.maps ?? []).map((map) => {
        const filledStats = ensurePlayerStatsForTeams(
          map as MapDraft,
          match.team1_id,
          match.team2_id
        );
        return { ...(map as MapDraft), player_stats: filledStats };
      });

      setEditingMaps(mapsWithStats);
      setShowAddForm(true);
      setError(null);

      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    },
    [ensurePlayerStatsForTeams]
  );

  // ---------- Delete a map ----------
  const handleDeleteMap = useCallback(
    async (mapId: number) => {
      if (editingMaps.length <= 2) {
        setError("Cannot delete map. Minimum 2 maps required per match.");
        return;
      }
      if (!confirm("Are you sure you want to delete this map?")) return;

      try {
        setError(null);
        const { error } = await supabase
          .from("match_maps")
          .delete()
          .eq("id", mapId);

        if (error) throw error;
        setEditingMaps((cur) => cur.filter((m) => m.id !== mapId));
      } catch (e) {
        console.error("Failed to delete map:", e);
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Failed to delete map. Please try again.";
        setError(errorMessage);
      }
    },
    [editingMaps]
  );

  // ---------- Cancel edit ----------
  const cancelEdit = useCallback(() => {
    setEditingMatch(null);
    setShowAddForm(false);
    setEditingMaps([]);
    setFormData({
      team1_id: "",
      team2_id: "",
      team1_score: "0",
      team2_score: "0",
      match_date: "",
      status: "scheduled",
    });
    setBulkFormData({
      team1_id: "",
      team2_id: "",
      match_date: "",
      status: "scheduled",
      number_of_matches: 1,
      maps_per_match: 2,
    });
    setError(null);
  }, []);

  // ---------- Derived/memoized ----------
  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return matches.filter((m) => {
      const okStatus = statusFilter === "all" || m.status === statusFilter;
      const okSearch =
        !q ||
        m.team1?.name.toLowerCase().includes(q) ||
        m.team2?.name.toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [matches, searchQuery, statusFilter]);

  const matchStats = useMemo(() => {
    const live = matches.filter((m) => m.status === "live").length;
    const sched = matches.filter((m) => m.status === "scheduled").length;
    const done = matches.filter((m) => m.status === "completed").length;
    return {
      liveMatches: live,
      scheduledMatches: sched,
      completedMatches: done,
    };
  }, [matches]);

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Link
                href="/admin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Admin
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Match Management
            </h1>
            <p className="text-gray-400">
              Manage all matches in Fight Club Tournament
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => {
                const open = !showAddForm;
                setShowAddForm(open);
                if (editingMatch) cancelEdit();
                if (open) {
                  setTimeout(() => {
                    window.scrollTo({
                      top: document.documentElement.scrollHeight,
                      behavior: "smooth",
                    });
                  }, 100);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              + Schedule Match
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <StatsOverview
          totalMatches={matches.length}
          liveMatches={matchStats.liveMatches}
          scheduledMatches={matchStats.scheduledMatches}
          completedMatches={matchStats.completedMatches}
        />

        {/* Filters */}
        <StatusFilter
          statusFilter={statusFilter}
          liveMatches={matchStats.liveMatches}
          scheduledMatches={matchStats.scheduledMatches}
          completedMatches={matchStats.completedMatches}
          onFilterChange={setStatusFilter}
        />

        {/* Table */}
        <MatchesTable
          matches={filteredMatches}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={startEditMatch}
          onDelete={handleDeleteMatch}
        />

        {/* Forms */}
        {showAddForm && !editingMatch && (
          <ScheduleMatchForm
            teams={teams}
            formData={bulkFormData}
            onFormChange={setBulkFormData}
            onSubmit={handleAddBulkMatches}
            onCancel={cancelEdit}
          />
        )}

        {showAddForm && editingMatch && (
          <EditMatchForm
            teams={teams}
            formData={formData}
            editingMaps={editingMaps as MatchMap[]}
            isUpdating={isUpdating}
            onFormChange={setFormData}
            onMapsChange={setEditingMaps}
            onSubmit={handleUpdateMatch}
            onCancel={cancelEdit}
            onDeleteMap={handleDeleteMap}
            onAddMap={handleAddMapToMatch}
          />
        )}
      </div>
    </div>
  );
}
