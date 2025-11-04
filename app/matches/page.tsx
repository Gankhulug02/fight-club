"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  MatchStatsOverview,
  MatchFilters,
  MatchCard,
  type MatchWithTeams,
  type MatchMap,
  type MapPlayerStats,
} from "@/components/matches";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedMatches, setExpandedMatches] = useState<Set<number>>(
    new Set()
  );
  const [mapsData, setMapsData] = useState<Record<number, MatchMap[]>>({});
  const [expandedMaps, setExpandedMaps] = useState<Set<number>>(new Set());
  const [playerStatsData, setPlayerStatsData] = useState<
    Record<number, MapPlayerStats[]>
  >({});
  const [loadingMaps, setLoadingMaps] = useState<Set<number>>(new Set());
  const [loadingStats, setLoadingStats] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      if (teamsError) throw teamsError;

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false });

      if (matchesError) throw matchesError;

      // Combine matches with team data
      const matchesWithTeams = (matchesData || []).map((match) => ({
        ...match,
        team1: teamsData?.find((t) => t.id === match.team1_id),
        team2: teamsData?.find((t) => t.id === match.team2_id),
      }));

      setMatches(matchesWithTeams);
      setError(null);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchMaps = async (matchId: number) => {
    try {
      setLoadingMaps((prev) => new Set(prev).add(matchId));

      const { data: mapsData, error: mapsError } = await supabase
        .from("match_maps")
        .select("*")
        .eq("match_id", matchId)
        .order("map_number");

      if (mapsError) throw mapsError;

      setMapsData((prev) => ({
        ...prev,
        [matchId]: mapsData || [],
      }));
    } catch (err) {
      console.error("Error fetching maps:", err);
    } finally {
      setLoadingMaps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });
    }
  };

  const fetchMapPlayerStats = async (mapId: number) => {
    try {
      setLoadingStats((prev) => new Set(prev).add(mapId));

      const { data: statsData, error: statsError } = await supabase
        .from("map_player_stats")
        .select(
          `
          *,
          player:players(id, name, avatar)
        `
        )
        .eq("map_id", mapId)
        .order("kills", { ascending: false });

      if (statsError) throw statsError;

      setPlayerStatsData((prev) => ({
        ...prev,
        [mapId]: statsData || [],
      }));
    } catch (err) {
      console.error("Error fetching player stats:", err);
    } finally {
      setLoadingStats((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mapId);
        return newSet;
      });
    }
  };

  const toggleMatchExpansion = async (matchId: number) => {
    const isExpanded = expandedMatches.has(matchId);

    if (isExpanded) {
      // Collapse
      setExpandedMatches((prev) => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });
    } else {
      // Expand
      setExpandedMatches((prev) => new Set(prev).add(matchId));

      // Fetch maps if not already fetched
      if (!mapsData[matchId]) {
        await fetchMatchMaps(matchId);
      }
    }
  };

  const toggleMapExpansion = async (mapId: number) => {
    const isExpanded = expandedMaps.has(mapId);

    if (isExpanded) {
      // Collapse
      setExpandedMaps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mapId);
        return newSet;
      });
    } else {
      // Expand
      setExpandedMaps((prev) => new Set(prev).add(mapId));

      // Fetch player stats if not already fetched
      if (!playerStatsData[mapId]) {
        await fetchMapPlayerStats(mapId);
      }
    }
  };

  // Memoized filtered matches by status
  const filteredMatches = useMemo(() => {
    if (statusFilter === "all") return matches;
    return matches.filter((match) => match.status === statusFilter);
  }, [matches, statusFilter]);

  // Memoized match counts by status
  const matchCounts = useMemo(() => {
    return {
      all: matches.length,
      live: matches.filter((m) => m.status === "live").length,
      scheduled: matches.filter((m) => m.status === "scheduled").length,
      completed: matches.filter((m) => m.status === "completed").length,
    };
  }, [matches]);

  if (loading) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            All Matches
          </h1>
          <p className="text-gray-400">
            View all tournament matches - live, scheduled, and completed
          </p>
        </div>

        {/* Stats Overview */}
        <MatchStatsOverview
          totalMatches={matchCounts.all}
          liveMatches={matchCounts.live}
          scheduledMatches={matchCounts.scheduled}
          completedMatches={matchCounts.completed}
        />

        {/* Filter Buttons */}
        <MatchFilters
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          counts={matchCounts}
        />

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-400 text-lg">
                No matches found in this category.
              </p>
            </div>
          ) : (
            filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isExpanded={expandedMatches.has(match.id)}
                isLoadingMaps={loadingMaps.has(match.id)}
                maps={mapsData[match.id] || []}
                expandedMaps={expandedMaps}
                loadingStats={loadingStats}
                playerStatsData={playerStatsData}
                onToggleExpand={toggleMatchExpansion}
                onToggleMapExpand={toggleMapExpansion}
              />
            ))
          )}
        </div>

        {/* Footer Message */}
        {filteredMatches.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-8">
            Showing {filteredMatches.length} of {matches.length} total matches
          </div>
        )}
      </div>
    </div>
  );
}
