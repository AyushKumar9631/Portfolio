import GithubHeatmap from "@/components/GithubHeatmap";
import LeetcodeRatingChart from "@/components/LeetcodeRatingChart";

export default function ActivityGraphs() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
      <GithubHeatmap />
      <LeetcodeRatingChart />
    </div>
  );
}
