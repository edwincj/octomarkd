import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Bookmarks from "./Bookmarks";
import { Stats } from "./Stats";
import { useBookMarks } from "@/context/BookMarkProvider";

type ViewType = "bookmarks" | "stats";

export default function BookmarksPage() {
  const [view, setView] = useState<ViewType>("bookmarks");
  const {bookMarks} = useBookMarks();

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="bookmarks"
        value={view}
        onValueChange={(value) => setView(value as ViewType)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="stats" disabled={bookMarks.length === 0}>Stats</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "bookmarks" && <Bookmarks />}

      {view === "stats" && <Stats />}
      
    </div>
  );
}
