import React from "react";
import { ScrollArea } from "./ui/scroll-area";

const ScrollContainer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <ScrollArea
      className="flex h-full rounded-md border p-4"
      viewportClassName="before:block before:h-[calc(50%-30px)] before:content-[''] after:block after:h-[calc(50%-30px)] after:content-['']"
    >
      {children}
    </ScrollArea>
  );
};

export default ScrollContainer;
