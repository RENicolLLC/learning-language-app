import { notFound } from "next/navigation";
import { getLevel } from "../../../lib/curriculum";
import LevelLessonsClient from "./LevelLessonsClient";

type LevelPageProps = {
  params: {
    level: string;
  };
};

export default function LevelPage({ params }: LevelPageProps) {
  const level = getLevel(params.level);
  if (!level) {
    notFound();
  }

  return <LevelLessonsClient level={level} />;
}
