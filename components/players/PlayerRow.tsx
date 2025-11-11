import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { PlayerStats } from "./types";
import { TeamLogo } from "../shared/TeamLogo";

interface PlayerRowProps {
  playerStats: PlayerStats;
  rank: number;
}

function PlayerRow({ playerStats: ps, rank }: PlayerRowProps) {
  const isTopThree = rank < 3;
  // const isTopFive = rank < 5;
  const rankIcons = ["🥇", "🥈", "🥉"];

  return (
    <tr className="hover:bg-gray-800/30 transition-colors duration-150 relative">
      <td className="px-6 py-4 whitespace-nowrap relative">
        <div className="text-lg font-bold text-white flex items-center gap-2">
          {isTopThree ? (
            <span className="text-2xl">{rankIcons[rank]}</span>
          ) : (
            <span className="text-gray-400">#{rank + 1}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap relative overflow-hidden">
        {isTopThree && (
          <div className="absolute -top-1 left-0 w-full h-full z-10">
            <Image
              src="/gif/blood.gif"
              alt="Blood"
              fill
              className="w-full h-full"
              unoptimized
            />
          </div>
        )}
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{ps.player.avatar}</span>
          <div>
            <div className="text-lg font-semibold text-white">
              {ps.player.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap relative">
        {ps.team ? (
          <Link
            href={`/teams/${ps.team.id}`}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <TeamLogo logo={ps.team.logo} />
            {/* <span className="text-white hover:text-blue-400 transition-colors">
              {ps.team.name}
            </span> */}
          </Link>
        ) : (
          <span className="text-gray-500">No team</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap relative ">
        <span className="text-gray-300">{ps.player.role}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center relative ">
        <span className="text-blue-400 font-semibold">{ps.maps_played}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center relative ">
        <span className="text-green-400 font-bold text-lg">{ps.kills}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center relative ">
        <span className="text-yellow-400 font-bold text-lg">{ps.assists}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center relative ">
        <span className="text-red-400 font-bold text-lg">{ps.deaths}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center relative ">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-base ${
            ps.kd_ratio >= 1.5
              ? "bg-green-500/20 text-green-400"
              : ps.kd_ratio >= 1.0
              ? "bg-blue-500/20 text-blue-400"
              : "bg-gray-500/20 text-[#919191]"
          }`}
        >
          {ps.kd_ratio.toFixed(2)}
        </span>
      </td>
    </tr>
  );
}

export default memo(PlayerRow);
