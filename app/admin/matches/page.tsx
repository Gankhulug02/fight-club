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

type MapDraft = Omit<MatchMap, "id"> & { id?: number }; // id is optional for drafts

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
  const parseId = (v: string) => (v ? parseInt(v, 10) : undefined);

  const getTeamPlayers = useCallback(
    (teamId?: number) =>
      teamId ? players.filter((p) => p.team_id === teamId).slice(0, 10) : [],
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
            // map_id will be filled on save for new maps
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

  // ---------- Data load ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

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
        const mapsWithStats = (mapsData ?? []).map((map) => ({
          ...map,
          player_stats: (playerStatsData ?? [])
            .filter((s) => s.map_id === map.id)
            .map((s) => ({ ...s, player: playersById.get(s.player_id) })),
        }));

        console.log("mapsWithStats", mapsWithStats);

        const matchesWithTeams: MatchWithTeams[] = (matchesData ?? []).map(
          (m) => ({
            ...m,
            team1: (teamsData ?? []).find((t) => t.id === m.team1_id),
            team2: (teamsData ?? []).find((t) => t.id === m.team2_id),
            maps: mapsWithStats.filter((map) => map.match_id === m.id),
          })
        );

        setTeams(teamsData ?? []);
        setPlayers(playersData ?? []);
        setMatches(matchesWithTeams);
      } catch (e) {
        console.error(e);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refetch = useCallback(async () => {
    // light wrapper so we can reuse
    setLoading(true);
    try {
      // you could DRY by calling the effect’s body, but keeping separate is clearer
      const [
        { data: teamsData },
        { data: playersData },
        { data: matchesData },
        { data: mapsData },
        { data: playerStatsData },
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

      const playersById = new Map((playersData ?? []).map((p) => [p.id, p]));
      const mapsWithStats = (mapsData ?? []).map((map) => ({
        ...map,
        player_stats: (playerStatsData ?? [])
          .filter((s) => s.map_id === map.id)
          .map((s) => ({ ...s, player: playersById.get(s.player_id) })),
      }));

      const matchesWithTeams: MatchWithTeams[] = (matchesData ?? []).map(
        (m) => ({
          ...m,
          team1: (teamsData ?? []).find((t) => t.id === m.team1_id),
          team2: (teamsData ?? []).find((t) => t.id === m.team2_id),
          maps: mapsWithStats.filter((map) => map.match_id === m.id),
        })
      );

      setTeams(teamsData ?? []);
      setPlayers(playersData ?? []);
      setMatches(matchesWithTeams);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to refresh data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Bulk add ----------
  const handleAddBulkMatches = async () => {
    const t1 = parseId(bulkFormData.team1_id);
    const t2 = parseId(bulkFormData.team2_id);

    if (!t1 || !t2) return alert("Please select both teams");
    if (t1 === t2) return alert("Teams must be different");
    if (!bulkFormData.match_date) return alert("Please select a match date");

    try {
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
      alert(
        `${matchesToInsert.length} matches scheduled successfully (${mapsToInsert.length} maps total)!`
      );
    } catch (e) {
      console.error(e);
      alert("Failed to add matches. Please try again.");
    }
  };

  // ---------- Update (now handles new maps & stats cleanly) ----------
  const handleUpdateMatch = async () => {
    if (!editingMatch) return;

    const t1 = parseId(formData.team1_id)!;
    const t2 = parseId(formData.team2_id)!;

    setIsUpdating(true);
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

      // 2) Update existing maps
      for (const map of existingMaps) {
        const winnerId =
          map.team1_score > map.team2_score
            ? t1
            : map.team2_score > map.team1_score
            ? t2
            : null;

        const { error: mapError } = await supabase
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
        if (mapError) throw mapError;

        // Upsert player stats for existing map
        if (map.player_stats?.length) {
          // Filter out players with 0/0/0 stats if team has more than 5 players
          const filteredStats = map.player_stats.filter((stat) => {
            const teamPlayerCount = getTeamPlayers(stat.team_id).length;
            const hasZeroStats =
              stat.kills === 0 && stat.assists === 0 && stat.deaths === 0;
            // Skip 0/0/0 stats if team has more than 5 players
            if (teamPlayerCount > 5 && hasZeroStats) {
              return false;
            }
            return true;
          });

          for (const stat of filteredStats) {
            if (stat.id) {
              const { error: statErr } = await supabase
                .from("map_player_stats")
                .update({
                  kills: stat.kills,
                  assists: stat.assists,
                  deaths: stat.deaths,
                })
                .eq("id", stat.id);
              if (statErr) throw statErr;
            }
            // else {
            //   const { error: statErr } = await supabase
            //     .from("map_player_stats")
            //     .insert({
            //       map_id: map.id,
            //       player_id: stat.player_id,
            //       team_id: stat.team_id,
            //       kills: stat.kills,
            //       assists: stat.assists,
            //       deaths: stat.deaths,
            //     });
            //   if (statErr) throw statErr;
            // }
          }
        }
      }

      // 3) Insert new maps, then insert their stats referring to returned map IDs
      if (newMaps.length) {
        // prepare payloads without id/map_id
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

        // Insert stats for each newly created map
        for (let i = 0; i < newMaps.length; i++) {
          const draft = newMaps[i];
          const created = insertedMaps?.[i];
          if (!created) continue;

          if (draft.player_stats?.length) {
            // Filter out players with 0/0/0 stats if team has more than 5 players
            const filteredStats = draft.player_stats.filter((stat) => {
              const teamPlayerCount = getTeamPlayers(stat.team_id).length;
              const hasZeroStats =
                stat.kills === 0 && stat.assists === 0 && stat.deaths === 0;
              // Skip 0/0/0 stats if team has more than 5 players
              if (teamPlayerCount > 5 && hasZeroStats) {
                return false;
              }
              return true;
            });

            if (filteredStats.length > 0) {
              const statsRows = filteredStats.map((s) => ({
                map_id: created.id,
                player_id: s.player_id,
                team_id: s.team_id,
                kills: s.kills,
                assists: s.assists,
                deaths: s.deaths,
              }));
              const { error: statsErr } = await supabase
                .from("map_player_stats")
                .insert(statsRows);
              if (statsErr) throw statsErr;
            }
          }
        }
      }

      // 4) Reset UI
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
      alert("Match, maps, and player stats updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to update match. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------- Delete match ----------
  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", matchId);
      if (error) throw error;
      await refetch();
      alert("Match deleted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to delete match. Please try again.");
    }
  };

  // ---------- FIXED: Add map to match (no fake IDs, player stats ready) ----------
  const handleAddMapToMatch = () => {
    const t1 = parseId(formData.team1_id);
    const t2 = parseId(formData.team2_id);
    if (!t1 || !t2)
      return alert("Please select both teams before adding maps.");

    const nextMapNumber = (editingMaps?.length ?? 0) + 1;

    // Build a draft map without id (DB will assign on save)
    const draft: MapDraft = {
      match_id: editingMatch?.id ?? 0, // will be used on insert
      map_number: nextMapNumber,
      map_name: "",
      team1_score: 0,
      team2_score: 0,
      winner_team_id: null,
      status: "completed",
      // player_stats will be populated below; omit map_id until insert
      player_stats: [],
    };

    // Ensure stats exist for top-5 players of each team (kills/assists/deaths = 0)
    const stats = ensurePlayerStatsForTeams(draft, t1, t2).map((s) => ({
      ...s,
      map_id: undefined as unknown as number, // filled after insert in handleUpdateMatch
    }));

    setEditingMaps((cur) => [...cur, { ...draft, player_stats: stats }]);
  };

  // ---------- Edit start ----------
  const startEditMatch = (match: MatchWithTeams) => {
    setEditingMatch(match);
    setFormData({
      team1_id: String(match.team1_id),
      team2_id: String(match.team2_id),
      team1_score: String(match.team1_score),
      team2_score: String(match.team2_score),
      match_date: match.match_date,
      status: match.status,
    });

    // Inflate player stats to include both teams’ top-5 with defaults where missing
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

    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  // ---------- Delete a map ----------
  const handleDeleteMap = async (mapId: number) => {
    if (editingMaps.length <= 2)
      return alert("Cannot delete map. Minimum 2 maps required per match.");
    if (!confirm("Are you sure you want to delete this map?")) return;

    try {
      const { error } = await supabase
        .from("match_maps")
        .delete()
        .eq("id", mapId);
      if (error) throw error;
      setEditingMaps((cur) => cur.filter((m) => m.id !== mapId));
      alert("Map deleted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to delete map. Please try again.");
    }
  };

  // ---------- Cancel ----------
  const cancelEdit = () => {
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
  };

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

  const { liveMatches, scheduledMatches, completedMatches } = useMemo(() => {
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
          liveMatches={liveMatches}
          scheduledMatches={scheduledMatches}
          completedMatches={completedMatches}
        />

        {/* Filters */}
        <StatusFilter
          statusFilter={statusFilter}
          liveMatches={liveMatches}
          scheduledMatches={scheduledMatches}
          completedMatches={completedMatches}
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
