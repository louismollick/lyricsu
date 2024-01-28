import React from "react";
import { LoadingSpinner } from "~/components/loadingSpinner";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <>
      <ScrollArea
        className="flex h-full rounded-md border p-4"
        viewportClassName="before:block before:h-[calc(50%-30px)] before:content-[''] after:block after:h-[calc(50%-30px)] after:content-[''] "
      >
        <Skeleton className="my-2 h-6 w-96 md:h-9 md:w-[600px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-80 md:h-9 md:w-[500px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-72 md:h-9 md:w-[550px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-80 md:h-9 md:w-[570px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-[100px] md:h-9 md:w-[620px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-96 md:h-9 md:w-[600px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-80 md:h-9 md:w-[500px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-72 md:h-9 md:w-[550px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-80 md:h-9 md:w-[570px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-[100px] md:h-9 md:w-[620px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-96 md:h-9 md:w-[600px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-80 md:h-9 md:w-[500px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-72 md:h-9 md:w-[550px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-80 md:h-9 md:w-[570px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-[100px] md:h-9 md:w-[620px] lg:h-14" />
        <Skeleton className="my-2 h-6 w-96 md:h-9 md:w-[600px] lg:h-14" />
      </ScrollArea>
      <div className="flex h-20 justify-between gap-4 bg-gray-900 px-2 py-2 text-white md:px-4">
        <div className="flex flex-grow basis-0 items-center gap-2">
          <Skeleton className="h-16 w-16" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <Button size="icon" variant="ghost">
            <LoadingSpinner />
          </Button>
          <Skeleton className="my-2 hidden h-3 w-96 md:block" />
        </div>

        <div className="hidden flex-grow basis-0 items-center justify-end md:flex">
          <Button size="icon" variant="ghost">
            <Skeleton className="h-6 w-6" />
          </Button>
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </>
  );
};

export default Loading;
