import { notFound } from "next/navigation";
import { LessonClient } from "./LessonClient";
import { getLesson } from "../../../../lib/curriculum";

type LessonPageProps = {
  params: {
    level: string;
    lesson: string;
  };
};

export default function LessonPage({ params }: LessonPageProps) {
  const lesson = getLesson(params.level, params.lesson);
  if (!lesson) {
    notFound();
  }

  return <LessonClient lesson={lesson} levelKey={params.level} />;
}
