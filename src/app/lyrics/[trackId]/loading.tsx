import React from "react";
import { LoadingSpinner } from "~/components/loadingSpinner";
import ScrollContainer from "~/components/scrollContainer";
import { Button } from "~/components/ui/button";

const Loading = () => {
  return (
    <>
      <ScrollContainer></ScrollContainer>
      <div className="flex h-20 justify-between gap-4 bg-gray-900 text-white">
        <div className="mx-auto h-20 pb-8 pt-2">
          <Button size="icon" variant="ghost">
            <LoadingSpinner />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Loading;
